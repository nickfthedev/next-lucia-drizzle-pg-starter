import { validateRequest } from "@/lib/lucia";
import { redirect } from "next/navigation";

export default async function AppPage() {
  const { user } = await validateRequest();

  if (!user) {
    return redirect("/auth/signin");
  }

  return <div>App</div>;
}
