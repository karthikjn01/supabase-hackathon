"use server";

import prisma from "@/db";
import { getUser } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const changeUsername = async (formData: FormData) => {
  const {
    user,
    error,
  } = await getUser();

  if (!user || error) {
    redirect("/login");
  }

  const newUsername = formData.get("username") as string;

  const id = user.id;

  if (!newUsername.trim()) {
    redirect("/settings?error=Username cannot be empty");
  }

  const updatedProfile = await prisma.profiles.update({
    where: {
      id,
    },
    data: {
      displayName: newUsername,
    },
  });

  if (!updatedProfile) {
    redirect("/settings?error=Something went wrong");
  }

  redirect("/settings?success=Username updated successfully");
};
