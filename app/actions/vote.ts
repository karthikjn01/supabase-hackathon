"use server";

import prisma from "@/db";
import { getUser } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
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

  revalidatePath("/newest");
  revalidatePath("/popular");
  revalidatePath(`/question/${questionId}`);

  return {
    vote,
    success: true,
  };
};

export const deleteVote = async (questionId: string, answerId: string) => {
  const { user, error } = await getUser();

  if (error || !user) {
    return redirect("/login");
  }

  const { id: userId } = user;

  const deletedVotes = await prisma.votes.delete({
    where: {
      userId_questionId: {
        userId,
        questionId,
      },
    },
  });

  revalidatePath("/newest");
  revalidatePath("/popular");
  revalidatePath(`/question/${questionId}`);

  return {
    success: !!deletedVotes,
  };
};
