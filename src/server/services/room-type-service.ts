import { db } from "~/server/db";
import { Prisma } from "@prisma/client";
import type {
  CreateRoomTypeInput,
  UpdateRoomTypeInput,
  GetAllRoomTypesInput,
} from "../validations/room-type-validation";
import { TRPCError } from "@trpc/server";

const roomTypeSelect = {
  id: true,
  name: true,
  baseRate: true,
  capacity: true,
  description: true,
  deactivatedAt: true,
  createdAt: true,
  updatedAt: true,
  amenities: {
    select: {
      id: true,
    },
  },
  _count: {
    select: { rooms: true },
  },
} satisfies Prisma.RoomTypeSelect;

export async function createRoomType(
  data: CreateRoomTypeInput,
  createdByUserId: string,
) {
  try {
    return await db.roomType.create({
      data: {
        name: data.name,
        baseRate: data.baseRate,
        capacity: data.capacity,
        description: data.description,
        amenities: {
          connect: (data.amenityIds ?? []).map((id) => ({ id })),
        },
        createdById: createdByUserId,
      },
      select: roomTypeSelect,
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
        message: `Room type with this ${target} already exists.`,
      });
    }
    throw err;
  }
}

export async function updateRoomType(
  data: UpdateRoomTypeInput,
  updatedByUserId: string,
) {
  const { roomTypeId, name, baseRate, capacity, description, amenityIds } =
    data;

  try {
    return await db.roomType.update({
      where: { id: roomTypeId },
      data: {
        name,
        baseRate,
        capacity,
        description: description ?? null,
        amenities: {
          set: (amenityIds ?? []).map((id) => ({ id })),
        },
        updatedById: updatedByUserId,
      },
      select: roomTypeSelect,
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

export async function setRoomTypeActive(
  roomTypeId: string,
  isActive: boolean,
  actingUserId: string,
) {
  if (!isActive) {
    const roomType = await db.roomType.findUnique({
      where: { id: roomTypeId },
      select: { _count: { select: { rooms: true } } },
    });

    if (!roomType) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Room type not found.",
      });
    }

    if (roomType._count.rooms > 0) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Cannot deactivate — still assigned to ${roomType._count.rooms} room(s). Reassign them first.`,
      });
    }
  }

  return db.roomType.update({
    where: { id: roomTypeId },
    data: {
      deactivatedAt: isActive ? null : new Date(),
      deactivatedById: isActive ? null : actingUserId,
      updatedById: actingUserId,
    },
    select: roomTypeSelect,
  });
}

export async function getAllRoomTypes(input: GetAllRoomTypesInput) {
  const { search, page, pageSize } = input;

  const where: Prisma.RoomTypeWhereInput = {
    ...(search && {
      name: { contains: search, mode: "insensitive" },
    }),
  };

  const [roomTypes, total] = await Promise.all([
    db.roomType.findMany({
      where,
      select: roomTypeSelect,
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.roomType.count({ where }),
  ]);

  return {
    roomTypes,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getRoomTypeById(roomTypeId: string) {
  const roomType = await db.roomType.findUnique({
    where: { id: roomTypeId },
    select: roomTypeSelect,
  });

  if (!roomType) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Room type not found.",
    });
  }

  return roomType;
}
