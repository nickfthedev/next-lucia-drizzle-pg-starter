"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ResetPasswordSchema } from "~/src/types/auth";
import { useRouter } from "next/navigation";
import { z } from "zod";
import toast from "react-hot-toast";
import { useServerAction } from "zsa-react";
import { resetPassword } from "~/src/actions/auth.actions";
import { PageHeader } from "../ui/pageHeader";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const { isPending, execute, data } = useServerAction(resetPassword);

  async function onSubmit(values: z.infer<typeof ResetPasswordSchema>) {
    const [data, error] = await execute({ ...values });
    if (error) {
      console.log(error);
      toast.error(error.message);
    } else if (data) {
      if (data.success) {
        toast.success("Password reset successfully");
        router.push("/auth/signin");
      } else {
        toast.error("Failed to reset password");
      }
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Reset password"
          description="Enter your new password"
        />
        <input type="hidden" {...form.register("token")} value={token} />
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
              type="password"
              className="grow"
              placeholder="New password"
              {...form.register("password")}
            />
          </label>
          <small className="text-red-500">
            {form.formState.errors.password?.message}
          </small>
        </div>

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
              type="password"
              className="grow"
              placeholder="Confirm password"
              {...form.register("confirmPassword")}
            />
          </label>
          <small className="text-red-500">
            {form.formState.errors.confirmPassword?.message}
          </small>
        </div>
        <button
          className="btn btn-primary"
          type="submit"
          disabled={isPending || data?.success}
        >
          Reset password
        </button>
      </div>
    </form>
  );
}
