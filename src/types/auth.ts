import { z } from "zod"

async function validateAvatarUrl(url: string): Promise<boolean> {
  if (!url) return true; // Allow empty URLs

  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('Content-Type');
    return contentType?.startsWith('image/') ?? false;
  } catch (error) {
    return false;
  }
}

export const ProfileSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3, { message: "Username must be at least 3 characters long" }),
  avatar: z.optional(z.string()
    .refine((url) => !url || url.startsWith("https://"), { message: "Avatar must be a valid URL" })
    // .refine(
    //   (url) => !url || (url.endsWith(".png") || url.endsWith(".jpg") || url.endsWith(".jpeg")),
    //   { message: "Avatar must be a valid image type" }
    // )
    .refine(async (url) => (await validateAvatarUrl(url)) || !url || url.endsWith(".png") || url.endsWith(".jpg") || url.endsWith(".jpeg") || url.endsWith(".webp"), { message: "Avatar must be a valid image URL" })
  )
})

export const SignUpSchema = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })


export const SignInSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(1, { message: "Password is required" }),
})

export const VerifyEmailSchema = z.object({
  token: z.string(),
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const ResetPasswordSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
  confirmPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
})
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })