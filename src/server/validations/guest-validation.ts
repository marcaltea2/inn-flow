import { z } from "zod";
import { optionalString } from "./shared";

const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters");

const guestNameFields = {
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
};

export const createWalkInGuestSchema = z.object({
  ...guestNameFields,
  email: optionalString(z.string().email().toLowerCase().trim()), 
  phone: optionalString(z.string().max(11)),
});

export const completeGuestRegistrationCardSchema = z.object({
  guestId: z.string().cuid(),
  dateOfBirth: z.coerce.date().optional(),
  nationality: optionalString(z.string().max(100)),
  idType: optionalString(z.string().max(50)),
  idNumber: optionalString(z.string().max(100)),
  // idDocumentUrl is set via the upload flow separately, not typed in directly here
});

// This is for client side validation
export const registerGuestFormSchema = z
  .object({
    email: z.string().email().toLowerCase().trim(),
    password: passwordField,
    confirmPassword: z.string(),
    ...guestNameFields,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const registerGuestSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: passwordField,
  ...guestNameFields,
});

export const createGuestCheckoutSchema = z.object({
  ...guestNameFields,
  email: z.string().email().toLowerCase().trim(),
  phone: z.string().max(20).optional(),
});

export type CreateWalkInGuestInput = z.infer<typeof createWalkInGuestSchema>;
export type CompleteGuestRegistrationCardInput = z.infer<typeof completeGuestRegistrationCardSchema>;
export type RegisterGuestFormInput = z.infer<typeof registerGuestFormSchema>;
export type RegisterGuestInput = z.infer<typeof registerGuestSchema>;
export type CreateGuestCheckoutInput = z.infer<typeof createGuestCheckoutSchema>;
