import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const setNewPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export const changeOwnPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters."),
});

export const completeResetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required."),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters."),
});

export const checkEmailVerificationStatusSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address.")
    .toLowerCase()
    .trim(),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address.")
    .toLowerCase()
    .trim(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SetNewPasswordInput = z.infer<typeof setNewPasswordSchema>;
export type ChangeOwnPasswordInput = z.infer<typeof changeOwnPasswordSchema>;
export type CompleteResetPasswordInput = z.infer<typeof completeResetPasswordSchema>;
export type CheckEmailVerificationStatusInput = z.infer<typeof checkEmailVerificationStatusSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;