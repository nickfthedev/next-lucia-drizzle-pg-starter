import { redirect } from "next/navigation";
import EditProfileForm from "~/src/components/auth/editprofileform";
import { validateRequest } from "~/src/lib/lucia";

export default async function ProfilePage() {
  const { user } = await validateRequest();

  if (!user) {
    return redirect("/auth/signin");
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <EditProfileForm user={user} />
    </div>
  );
}
