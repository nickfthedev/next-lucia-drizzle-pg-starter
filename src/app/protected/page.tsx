import { PageHeader } from "~/src/components/ui/pageHeader";
import { validateRequest } from "~/src/lib/lucia";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect("/auth/signin");
  }
  return (
    <div className="flex flex-col gap-4 p-4">
      <PageHeader title="Protected Page" />
      Sample Protected Page. You can access this page because you are logged in.
      <br />
    </div>
  );
}
