import { Profile } from "@aplication/entities/Profile";
import z from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required!"),
  birthDate: z
    .string()
    .min(1, "Birthdate is required!")
    .date('"birthDate" should be a valid date (YYYY-MM-DD)')
    .transform((date) => new Date(date)), // Added this transform to turn a string into a Date,
  // DynamoDB doesn’t actually have a native "Date" data type. Unlike some SQL databases that have specific DATETIME or TIMESTAMP types,
  // DynamoDB relies on its core set of types: String, Number, and Binary.
  gender: z.nativeEnum(Profile.Gender),
  height: z.number(),
  weight: z.number(),
});

export type UpdateProfileBody = z.infer<typeof updateProfileSchema>;
