import z from "zod";

export const signUpSchema = z.object({
  account: z.object({
    email: z.string().min(1, "'email' is required").email("Email is invalid"),
    password: z.string().min(8, "'password' must have at least 8 characters"),
  }),
});

export type SignUpBody = z.infer<typeof signUpSchema>;
