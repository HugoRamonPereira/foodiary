// Created this file to solve the issue with the fileRtp

import { mbToBytes } from "@shared/utils/mbToBytes";
import z from "zod";

export const createMealSchema = z.object({
  file: z.object({
    type: z.enum(["audio/m4a", "image/jpeg"]),
    size: z
      .number()
      .min(1, "The file must have at least 1 byte")
      //This mbToBytes is a function in the shared/utils folder, it just makes a simple calculation
      .max(mbToBytes(10), "The file should have up to 10MB"),
  }),
});

export type CreateMealBody = z.infer<typeof createMealSchema>;
