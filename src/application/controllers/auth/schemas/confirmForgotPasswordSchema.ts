import z from "zod";

export const confirmForgotPasswordSchema = z.object({
  email: z.string().min(1, "'email' is required").email("Email is invalid"),
  confirmationCode: z.string().min(1, "'confirmationCode' is required"),
  password: z.string().min(8, "'password' must have at least 8 characters"),
});

export type ConfirmForgotPasswordBody = z.infer<
  typeof confirmForgotPasswordSchema
>;
