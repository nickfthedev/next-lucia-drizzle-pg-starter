"use client";

import Link from "next/link";
import { signUp } from "@/actions/auth.actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { SignUpSchema } from "~/src/types/auth";
import { useRouter } from "next/navigation";
import { z } from "zod";
import toast from "react-hot-toast";
import { useServerAction } from "zsa-react";
import { PageHeader } from "../ui/pageHeader";
import { Mail } from "lucide-react";

export default function SignupForm({
  verifyMailEnabled,
}: {
  verifyMailEnabled: boolean;
}) {
  const router = useRouter();

  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { isPending, execute, data } = useServerAction(signUp);

  async function onSubmit(values: z.infer<typeof SignUpSchema>) {
    const [data, error] = await execute(values);
    if (error) {
      console.log(error);
      toast.error(error.message);
    } else if (data) {
      console.log(data);
      if (data.success) {
        toast.success(
          verifyMailEnabled
            ? "Sign up successful. Please verify your email."
            : "Sign up successful."
        );
        await new Promise((resolve) => setTimeout(resolve, 2000));
        router.push("/");
      } else {
        toast.error(data.error);
      }
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-4">
        <PageHeader title="Create account" description="Sign up to continue" />

        <div className="flex flex-col gap-1">
          <label className="input input-bordered flex items-center gap-2">
            <Mail />
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
        <div className="flex flex-col gap-1">
          <label className="input input-bordered flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 opacity-70"
            >
              <path
                fillRule="evenodd"
                d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="password"
              placeholder="Password"
              className="grow"
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
              <path
                fillRule="evenodd"
                d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="password"
              placeholder="Confirm password"
              className="grow"
              {...form.register("confirmPassword")}
            />
          </label>
          <small className="text-red-500">
            {form.formState.errors.confirmPassword?.message}
          </small>
        </div>
        <button className="btn btn-primary">Sign up</button>
        <div className="divider">OR</div>
        <Link className="btn btn-outline btn-primary" href="/auth/signin">
          Sign in
        </Link>
      </div>
    </form>
  );
}
