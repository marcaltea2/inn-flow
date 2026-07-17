import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const setNewPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const changeOwnPasswordSchema = z.object({
  newPassword: z.string().min(8),
});

export const completeResetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

export const checkEmailVerificationStatusSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SetNewPasswordInput = z.infer<typeof setNewPasswordSchema>;
