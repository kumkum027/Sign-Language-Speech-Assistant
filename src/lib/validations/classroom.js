import { z } from "zod";

export const createClassroomSchema = z.object({
  name: z
    .string()
    .min(2, "Classroom name must be at least 2 characters")
    .max(80, "Classroom name cannot exceed 80 characters"),
  subject: z
    .string()
    .min(2, "Subject must be at least 2 characters")
    .max(80, "Subject cannot exceed 80 characters"),
  description: z.string().max(300, "Description is too long").optional(),
  semester: z.string().max(30, "Semester format invalid").optional(),
});

export const joinClassroomSchema = z.object({
  code: z
    .string()
    .min(4, "Classroom code must be at least 4 characters")
    .max(16, "Classroom code cannot exceed 16 characters")
    .transform((val) => val.trim().toUpperCase()),
});
