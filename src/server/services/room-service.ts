import { db } from "~/server/db";
import { Prisma, RoomStatus } from "@prisma/client";
import type {
  CreateRoomInput,
  UpdateRoomInput,
  SetRoomStatusInput,
} from "../validations/room-validation";
import { TRPCError } from "@trpc/server";
import type { GetAllRoomInput } from "../validations/room-validation";
import { ReservationStatus } from "@prisma/client";

const roomSelect = {
  id: true,
  number: true,
  floor: true,
  status: true,
  deactivatedAt: true,
  createdAt: true,
  updatedAt: true,
  roomType: {
    select: {
      id: true,
      name: true,
    },
  },
  _count: {
    select: { reservations: true },
  },
} satisfies Prisma.RoomSelect;

export async function createRoom(
  data: CreateRoomInput,
  createdByUserId: string,
) {
  try {
    return await db.room.create({
      data: {
        number: data.number,
        floor: data.floor,
        roomType: {
          connect: { id: data.roomTypeId },
        },
        createdById: createdByUserId,
      },
      select: roomSelect,
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const target =
        (err.meta?.target as string[] | undefined)?.join(", ") ?? "field";
      throw new TRPCError({
        code: "CONFLICT",
        message: `Room with this ${target} already exists.`,
      });
    }
    throw err;
  }
}

export async function updateRoom(
  data: UpdateRoomInput,
  updatedByUserId: string,
) {
  const { roomId, number, floor, roomTypeId } = data;

  try {
    return await db.room.update({
      where: { id: roomId },
      data: {
        number,
        floor: floor ?? null,
        roomType: {
          connect: { id: roomTypeId },
        },
        updatedById: updatedByUserId,
      },
      select: roomSelect,
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Room type not found.",
      });
    }
    throw err;
  }
}

export async function setRoomActive(
  roomId: string,
  isActive: boolean,
  actingUserId: string,
) {
  if (!isActive) {
    const room = await db.room.findUnique({
      where: { id: roomId },
      select: {
        _count: {
          select: {
            reservations: {
              where: {
                status: {
                  in: [
                    ReservationStatus.CONFIRMED,
                    ReservationStatus.CHECKED_IN,
                  ],
                },
              },
            },
          },
        },
      },
    });

    if (!room) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Room not found.",
      });
    }

    if (room._count.reservations > 0) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Cannot deactivate — still assigned to ${room._count.reservations} reservation(s). Reassign them first.`,
      });
    }
  }

  return db.room.update({
    where: { id: roomId },
    data: {
      deactivatedAt: isActive ? null : new Date(),
      deactivatedById: isActive ? null : actingUserId,
      updatedById: actingUserId,
    },
    select: roomSelect,
  });
}

export async function getAllRooms(input: GetAllRoomInput) {
  const { search, page, pageSize } = input;

  const where: Prisma.RoomWhereInput = {
    ...(search && {
      OR: [
        { number: { contains: search, mode: "insensitive" } },
        ...(Number.isInteger(Number(search))
          ? [{ floor: Number(search) }]
          : []),
      ],
    }),
  };

  const [rooms, total] = await Promise.all([
    db.room.findMany({
      where,
      select: roomSelect,
      orderBy: { number: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.room.count({ where }),
  ]);

  return {
    rooms,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getRoomById(roomId: string) {
  const roomType = await db.room.findUnique({
    where: { id: roomId },
    select: roomSelect,
  });

  if (!roomType) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Room not found.",
    });
  }

  return roomType;
}

export async function setRoomStatus(
  data: SetRoomStatusInput,
  updatedByUserId: string,
) {
  try {
    const { roomId, status } = data;

    if (status === RoomStatus.OCCUPIED) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Room status cannot be set to Occupied directly. Use check-in instead.",
      });
    }

    return await db.room.update({
      where: { id: roomId },
      data: {
        status,
        updatedById: updatedByUserId,
      },
      select: roomSelect,
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Room not found.",
      });
    }
    throw err;
  }
}