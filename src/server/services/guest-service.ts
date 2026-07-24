import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { Prisma, Role } from "@prisma/client";
import { db } from "~/server/db";
import type {
  RegisterGuestInput,
  CreateWalkInGuestInput,
  UpdateWalkInGuestInput,
  CompleteGuestRegistrationCardInput,
  GetAllGuestsInput,
  // CreateOnlineGuestInput
} from "../validations/guest-validation";
import { issueVerificationEmail } from "~/server/services/email-verification";
import { ReservationStatus } from "@prisma/client";

// Projection for a portal-registered guest (User + linked Guest)
const registeredGuestSelect = {
  id: true,
  email: true,
  emailVerified: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  guest: {
    select: {
      firstName: true,
      lastName: true,
    },
  },
} satisfies Prisma.UserSelect;

// Projection for a Guest record itself (walk-in, checkout, or portal)
const guestSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  dateOfBirth: true,
  nationality: true,
  idType: true,
  idNumber: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: { reservations: true },
  },
} satisfies Prisma.GuestSelect;

export async function registerGuest(data: RegisterGuestInput) {
  const passwordHash = await bcrypt.hash(data.password, 12);

  try {
    const newUser = await db.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: Role.GUEST,
        isActive: true,
        guest: {
          create: {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
          },
        },
      },
      select: registeredGuestSelect,
    });

    issueVerificationEmail(newUser.id, newUser.email!).catch((err) => {
      console.error("Failed to send verification email:", err);
    });

    return newUser;
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const target =
        (err.meta?.target as string[] | undefined)?.join(", ") ?? "field";
      throw new TRPCError({
        code: "CONFLICT",
        message: `Account with this ${target} already exists.`,
      });
    }
    throw err;
  }
}

export async function createWalkinGuest(
  data: CreateWalkInGuestInput,
  createdByUserId: string,
) {
  return db.guest.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      createdById: createdByUserId,
      updatedById: createdByUserId,
    },
    select: guestSelect,
  });
}

export async function updateWalkinGuest(
  data: UpdateWalkInGuestInput,
  updatedByUserId: string,
) {
  const { guestId, firstName, lastName, email, phone } = data;

  try {
    return await db.guest.update({
      where: { id: guestId },
      data: {
        firstName,
        lastName,
        email,
        phone: phone ?? null,
        updatedById: updatedByUserId,
      },
      select: guestSelect,
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Guest not found." });
    }
    throw err;
  }
}

export async function completeGuestRegistrationCard(
  data: CompleteGuestRegistrationCardInput,
  updatedByUserId: string,
) {
  const { guestId, dateOfBirth, nationality, idType, idNumber } = data;

  try {
    return await db.guest.update({
      where: { id: guestId },
      data: {
        dateOfBirth,
        nationality,
        idType,
        idNumber,
        updatedById: updatedByUserId,
      },
      select: guestSelect,
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Guest not found." });
    }
    throw err;
  }
}

export async function setGuestActive(
  guestId: string,
  isActive: boolean,
  actingUserId: string,
) {
  if (!isActive) {
    const guest = await db.guest.findUnique({
      where: { id: guestId },
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

    if (!guest) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Guest not found.",
      });
    }

    if (guest._count.reservations > 0) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Cannot deactivate — guest has ${guest._count.reservations} active reservation(s). Cancel or complete them first.`,
      });
    }
  }

  return db.guest.update({
    where: { id: guestId },
    data: {
      deactivatedAt: isActive ? null : new Date(),
      deactivatedById: isActive ? null : actingUserId,
      updatedById: actingUserId,
    },
    select: guestSelect,
  });
}

export async function getAllGuests(input: GetAllGuestsInput) {
  const { search, page, pageSize } = input;

  const where: Prisma.GuestWhereInput = {
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [guests, total] = await Promise.all([
    db.guest.findMany({
      where,
      select: guestSelect,
      orderBy: { lastName: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.guest.count({ where }),
  ]);

  return {
    guests,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getGuestById(guestId: string) {
  const guest = await db.guest.findUnique({
    where: { id: guestId },
    select: guestSelect,
  });

  if (!guest) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Guest not found.",
    });
  }

  return guest;
}


// export async function createOnlineGuest(
//   guestData: CreateOnlineGuestInput,
//   reservationData: { roomId: string; ratePlanId: string; checkInDate: Date; checkOutDate: Date },
// ) {
//   return db.$transaction(async (tx) => {
//     // Reuse an existing Guest if this email has booked before, instead of creating a duplicate
//     let guest = await tx.guest.findFirst({
//       where: { email: guestData.email },
//     });

//     if (!guest) {
//       guest = await tx.guest.create({
//         data: {
//           firstName: guestData.firstName,
//           lastName: guestData.lastName,
//           email: guestData.email,
//           phone: guestData.phone,
//         },
//       });
//     }

//     await checkRoomAvailability(
//       tx,
//       reservationData.roomId,
//       reservationData.checkInDate,
//       reservationData.checkOutDate,
//     );

//     const ratePlan = await tx.ratePlan.findUnique({
//       where: { id: reservationData.ratePlanId },
//     });
//     if (!ratePlan) {
//       throw new TRPCError({ code: "NOT_FOUND", message: "Rate plan not found." });
//     }

//     const reservation = await tx.reservation.create({
//       data: {
//         roomId: reservationData.roomId,
//         guestId: guest.id,
//         ratePlanId: reservationData.ratePlanId,
//         checkInDate: reservationData.checkInDate,
//         checkOutDate: reservationData.checkOutDate,
//         status: ReservationStatus.CONFIRMED,
//         createdById: guest.id, // or a system/portal identifier — see note below
//         updatedById: guest.id,
//       },
//     });

//     await tx.statusHistory.create({
//       data: {
//         reservationId: reservation.id,
//         fromStatus: null,
//         toStatus: ReservationStatus.CONFIRMED,
//         changedById: guest.id,
//       },
//     });

//     return reservation;
//   });
// }