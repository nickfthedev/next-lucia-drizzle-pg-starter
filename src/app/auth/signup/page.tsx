import { redirect } from "next/navigation";
import SignupForm from "~/src/components/auth/signupform";
import { validateRequest } from "~/src/lib/lucia";
import { env } from "@/env";
export default async function SignupPage() {
  const { user } = await validateRequest();

  if (user) {
    return redirect("/");
  }

  return (
    <SignupForm
      verifyMailEnabled={
        (env.AUTH_SEND_VERIFICATION_EMAIL && env.ENABLE_MAIL_SERVICE) ?? false
      }
    />
  );
}
