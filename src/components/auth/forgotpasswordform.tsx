"use client";

import Link from "next/link";
import { forgotPassword, signIn } from "@/actions/auth.actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ForgotPasswordSchema, SignInSchema } from "~/src/types/auth";
import { useRouter } from "next/navigation";
import { z } from "zod";
import toast from "react-hot-toast";
import { useServerAction } from "zsa-react";
import { PageHeader } from "../ui/pageHeader";

export default function ForgotPasswordForm() {
  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const { isPending, execute, data } = useServerAction(forgotPassword);

  async function onSubmit(values: z.infer<typeof ForgotPasswordSchema>) {
    const [data, error] = await execute(values);
    if (error) {
      console.log(error);
      toast.error(error.message);
    } else if (data) {
      if (data.success) {
        toast.success("Password reset email sent");
      } else {
        toast.success("Password reset email sent");
      }
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Forgot password"
          description="Enter your email to reset your password"
        />
        <div className="flex flex-col gap-1">
          <label className="input input-bordered flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 opacity-70"
            >
              <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
              <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
            </svg>
            <input
              type="text"
              className="grow"
              placeholder="Email"
              {...form.register("email")}
            />
          </label>
          <small className="text-red-500">
            {form.formState.errors.email?.message}
          </small>
        </div>
        <button
          className="btn btn-primary"
          type="submit"
          disabled={isPending || data != null}
        >
          Reset password
        </button>
        <div className="divider">OR</div>
        <Link className="btn btn-outline btn-primary" href="/auth/signin">
          Back to Login
        </Link>
      </div>
    </form>
  );
}
