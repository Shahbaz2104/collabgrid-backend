import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  role: z.enum(["Member", "Manager", "Owner"]).optional()
});

// ... existing registerSchema export is above

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(1, { message: "Password is required" })
});


// We can also extract the pure TypeScript type directly from this Zod schema!
export type RegisterInput = z.infer<typeof registerSchema>;