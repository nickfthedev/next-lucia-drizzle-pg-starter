import { redirect } from "next/navigation";
import SignInForm from "~/src/components/auth/signinform";
import { validateRequest } from "~/src/lib/lucia";
import { env } from "~/src/env";

export default async function SigninPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const { user } = await validateRequest();

  if (user) {
    return redirect("/");
  }
  const githubEnabled =
    env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET ? true : false;

  let error = searchParams.error
    ? decodeURIComponent(searchParams.error)
    : undefined;

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <SignInForm github={githubEnabled} error={error} />
    </div>
  );
}
