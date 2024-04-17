"use server";

import prisma from "@/db";
import { getUser } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const vote = async (questionId: string, answerId: string) => {
  const { user, error } = await getUser();

  if (error || !user) {
    return redirect("/login");
  }

  const { id: userId } = user;

  const vote = await prisma.votes.upsert({
    create: {
      userId,
      answerId,
      questionId,
    },
    update: {
      userId,
      answerId,
      questionId,
    },
    where: {
      userId_questionId: {
        userId,
        questionId,
      },
    },
  });

  return {
    vote,
    success: true,
  };
};
