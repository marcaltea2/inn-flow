import { db } from "~/server/db";
import { Prisma } from "@prisma/client";
import type {
  CreateAmenityInput,
  UpdateAmenityInput,
  GetAllAmenitiesInput
} from "../validations/amenity-validation";
import { TRPCError } from "@trpc/server";

const amenitySelect = {
  id: true,
  name: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AmenitySelect;

export async function createAmenity(
  data: CreateAmenityInput,
  createdByUserId: string,
) {
  try {
    return await db.amenity.create({
      data: {
        name: data.name,
        isActive: true,
        createdById: createdByUserId,
      },
      select: amenitySelect,
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
        message: `Amenity with this ${target} already exists.`,
      });
    }
    throw err;
  }
}

export async function updateAmenity(
  data: UpdateAmenityInput,
  updatedByUserId: string,
) {
  const { amenityId, name } = data;

  try {
    return await db.amenity.update({
      where: { id: amenityId },
      data: {
        name,
        updatedById: updatedByUserId,
      },
      select: amenitySelect,
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Amenity not found.",
      });
    }
    throw err;
  }
}


export async function setAmenityActive(
  amenityId: string,
  isActive: boolean,
  actingUserId: string,
) {
  return db.amenity.update({
    where: { id: amenityId },
    data: {
      deactivatedAt: isActive ? null : new Date(),
      deactivatedById: isActive ? null : actingUserId,
      updatedById: actingUserId,
    },
    select: amenitySelect,
  });
}

export async function getAllAmenities(input: GetAllAmenitiesInput) {
  const { search, page, pageSize } = input;

  const where: Prisma.AmenityWhereInput = {
    ...(search && {
      name: { contains: search, mode: "insensitive" },
    }),
  };

  const [amenities, total] = await Promise.all([
    db.amenity.findMany({
      where,
      select: amenitySelect,
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.amenity.count({ where }),
  ]);

  return {
    amenities,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getAmenityById(amenityId: string) {
  const amenity = await db.amenity.findUnique({
    where: { id: amenityId },
    select: amenitySelect,
  });
  if (!amenity) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Amenity not found.",
    });
  }
  return amenity;
}