import { z } from "zod";
import { optionalString } from "./shared";

const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters.");

const guestNameFields = {
  firstName: z
    .string()
    .min(1, "First name is required.")
    .max(100, "First name cannot exceed 100 characters."),
  lastName: z
    .string()
    .min(1, "Last name is required.")
    .max(100, "Last name cannot exceed 100 characters."),
};

export const createWalkInGuestSchema = z.object({
  ...guestNameFields,
  email: optionalString(
    z.string().email("Please enter a valid email address.").toLowerCase().trim(),
  ),
  phone: optionalString(
    z.string().max(11, "Phone number cannot exceed 11 digits."),
  ),
});

export const updateWalkinGuestSchema = z.object ({
  guestId: z.string().cuid("invalid guest ID."),
  ...guestNameFields,
    email: optionalString(
    z.string().email("Please enter a valid email address.").toLowerCase().trim(),
  ),
  phone: optionalString(
    z.string().max(11, "Phone number cannot exceed 11 digits."),
  ),
});

export const completeGuestRegistrationCardSchema = z.object({
  guestId: z.string().cuid("Invalid guest ID."),
  dateOfBirth: z.coerce
  .date({ invalid_type_error: "Please enter a valid date." })
  .refine((date) => date <= new Date(), {
    message: "Date of birth cannot be in the future.",
  })
  .refine((date) => date >= new Date(new Date().setFullYear(new Date().getFullYear() - 120)), {
    message: "Please enter a valid date of birth.",
  })
  .optional(),
  nationality: optionalString(
    z.string().max(100, "Nationality cannot exceed 100 characters."),
  ),
  idType: optionalString(z.string().max(50, "ID type cannot exceed 50 characters.")),
  idNumber: optionalString(
    z.string().max(100, "ID number cannot exceed 100 characters."),
  ),
  // idDocumentUrl is set via the upload flow separately, not typed in directly here
});

// This is for client side validation
export const registerGuestFormSchema = z
  .object({
    email: z.string().email("Please enter a valid email address.").toLowerCase().trim(),
    password: passwordField,
    confirmPassword: z.string().min(1, "Please confirm your password."),
    ...guestNameFields,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export const registerGuestSchema = z.object({
  email: z.string().email("Please enter a valid email address.").toLowerCase().trim(),
  password: passwordField,
  ...guestNameFields,
});

export const createOnlineGuestSchema = z.object({
  ...guestNameFields,
  email: z.string().email("Please enter a valid email address.").toLowerCase().trim(),
  phone: optionalString(z.string().max(11, "Phone number cannot exceed 11 digits.")),
});

export const setGuestActiveSchema = z.object({
  roomId: z.string().cuid("Invalid guest ID."),
  isActive: z.boolean({
    required_error: "isActive is required.",
    invalid_type_error: "isActive must be true or false.",
  }),
});
export const getAllGuestsSchema = z
  .object({
    search: z.string().trim().optional(),
    page: z.coerce
      .number({ invalid_type_error: "Page must be a number." })
      .int("Page must be a whole number.")
      .min(1, "Page must be at least 1.")
      .default(1),
    pageSize: z.coerce
      .number({ invalid_type_error: "Page size must be a number." })
      .int("Page size must be a whole number.")
      .min(1, "Page size must be at least 1.")
      .max(100, "Page size cannot exceed 100.")
      .default(10),
  })
  .optional()
  .default({});

export type GetAllGuestsInput = z.infer<typeof getAllGuestsSchema>;
export type CreateWalkInGuestInput = z.infer<typeof createWalkInGuestSchema>;
export type UpdateWalkInGuestInput = z.infer<typeof updateWalkinGuestSchema>;
export type CompleteGuestRegistrationCardInput = z.infer<typeof completeGuestRegistrationCardSchema>;
export type RegisterGuestFormInput = z.infer<typeof registerGuestFormSchema>;
export type RegisterGuestInput = z.infer<typeof registerGuestSchema>;
export type CreateOnlineGuestInput = z.infer<typeof createOnlineGuestSchema>;