import { verifyEmail } from "~/src/actions/auth.actions";
import { Alert } from "~/src/components/ui/alert";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token: string };
}) {
  // Get the token from the query string

  if (!searchParams.token) {
    return (
      <div className="flex justify-center items-center h-full w-full max-w-lg mx-auto">
        <Alert message="Invalid token" type="error" />
      </div>
    );
  }

  const [result, error] = await verifyEmail({ token: searchParams.token });
  console.log(result, error);
  if (error || result.error) {
    return (
      <div className="flex justify-center items-center h-full w-full max-w-lg mx-auto">
        <Alert
          message={error?.message || result?.error || "Invalid token"}
          type="error"
        />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-full w-full max-w-lg mx-auto">
      <Alert
        message="Email verified. Redirecting to sign in..."
        type="success"
      />
      <meta httpEquiv="refresh" content="2;url=/auth/signin" />
    </div>
  );
}
