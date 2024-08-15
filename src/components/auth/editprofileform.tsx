"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileSchema } from "~/src/types/auth";
import toast from "react-hot-toast";
import { useServerAction } from "zsa-react";
import { updateProfile } from "~/src/actions/auth.actions";
import { PageHeader } from "~/src/components/ui/pageHeader";
import { Image, Mail, User } from "lucide-react";
import { Input } from "../ui/input";
import { User as LuciaUser } from "lucia";

export default function EditProfileForm({ user }: { user: LuciaUser }) {
  //
  // Profile form
  const form = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      email: user.email,
      username: user.username,
      avatar: user.avatarUrl,
    },
  });
  const { isPending, execute, data } = useServerAction(updateProfile);

  async function onSubmit(values: z.infer<typeof ProfileSchema>) {
    const [data, error] = await execute(values);
    if (error) {
      console.log(error);
      toast.error(error.message);
    } else if (data) {
      console.log(data);
      if (data.success) {
        if (data.newEmail) {
          toast.success(
            "Email updated successfully. Please verify your new email for the changes to take place."
          );
        } else {
          toast.success("Profile updated successfully.");
        }
      } else {
        toast.error(`Error: ${data.error}`);
      }
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <PageHeader title="Edit profile" />

        <Input
          type="text"
          placeholder="Email"
          textTop="Email"
          disabled={user.authProvider !== "password"}
          {...form.register("email")}
          icon={<Mail />}
          error={form.formState.errors.email?.message}
          text="If you change your email, you will need to verify it again. If you login via a social provider you cannot change your email."
        />
        <Input
          type="text"
          placeholder="Username"
          textTop="Username"
          icon={<User />}
          {...form.register("username")}
          error={form.formState.errors.username?.message}
        />
        <Input
          type="text"
          placeholder="Avatar"
          textTop="Avatar"
          text="Paste in a URL to an image. The image must be a PNG, JPG, or JPEG and must be hosted on a HTTPS URL."
          icon={<Image />}
          {...form.register("avatar")}
          error={form.formState.errors.avatar?.message}
        />
        <button
          className="btn btn-primary mt-2 w-full"
          type="submit"
          disabled={isPending}
        >
          Update
        </button>
      </form>
    </div>
  );
}
