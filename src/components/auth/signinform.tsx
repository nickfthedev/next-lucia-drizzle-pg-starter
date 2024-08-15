"use client";

import Link from "next/link";
import { signIn } from "@/actions/auth.actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { SignInSchema } from "~/src/types/auth";
import { useRouter } from "next/navigation";
import { z } from "zod";
import toast from "react-hot-toast";
import { useServerAction } from "zsa-react";
import { Alert } from "../ui/alert";
import { PageHeader } from "../ui/pageHeader";

interface SignInFormProps {
  github: boolean;
  error?: string;
}

export default function SignInForm({ github, error }: SignInFormProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isPending, execute, data } = useServerAction(signIn);

  async function onSubmit(values: z.infer<typeof SignInSchema>) {
    const [data, error] = await execute(values);
    if (error) {
      console.log(error);
      toast.error(error.message);
    } else if (data) {
      if (data.success) {
        toast.success("Sign in successful");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        router.push("/");
      } else {
        toast.error(data?.error ?? "An error occurred");
      }
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-4 max-w-xl">
        {error && <Alert message={error} type="error" />}
        <PageHeader
          title="Login in to your account"
          description="Sign in to continue"
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
        <button className="btn btn-primary" type="submit">
          Sign in
        </button>
        <Link className="text-primary text-sm" href="/auth/forgot-password">
          Forgot password?
        </Link>
        <div className="divider">OR</div>
        <Link className="btn btn-outline btn-primary" href="/auth/signup">
          Create account
        </Link>

        <div className="divider">OR</div>
        {github && (
          <Link className="btn btn-outline btn-primary" href="/auth/github">
            Sign in with Github
          </Link>
        )}
      </div>
    </form>
  );
}
