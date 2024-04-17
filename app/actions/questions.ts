"use server";

import prisma from "@/db";
import { createClient, getUser } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const getQuestions = async ({
  page = 0,
  take = 10,
}: {
  page?: number;
  take?: number;
}) => {
  const { user, error } = await getUser();

  let query = prisma.questions.findMany({
    take,
    skip: page * take,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      Answers: true,
    },
  });

  if (!!(user?.id)) {
    query = prisma.questions.findMany({
      take,
      skip: page * take,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        Answers: true,
        Votes: {
          where: {
            userId: user.id,
          },
        },
      },
    });
  }

  const [data, total] = await Promise.all([
    await query,
    await prisma.questions.count(),
  ]);

  return {
    data,
    success: true,
    totalQuestions: total,
  };
};

export const loadQuestion = async (questionId: string) => {
  const { user, error } = await getUser();

  let query = prisma.questions.findFirst({
    where: {
      id: questionId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      Answers: true,
    },
  });

  if (!!(user?.id)) {
    query = prisma.questions.findFirst({
      where: {
        id: questionId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        Answers: true,
        Votes: {
          where: {
            userId: user.id,
          },
        },
      },
    });
  }

  const data = await query;
  return data;
};

export const newQuestion = async (formData: FormData) => {
  const question = formData.get("question") as string;
  const firstOption = formData.get("first_option") as string;
  const secondOption = formData.get("second_option") as string;

  const { user, error } = await getUser();

  if (error || !user) {
    redirect("/login");
  }

  if (!question.trim() || !firstOption.trim() || !secondOption.trim()) {
    return redirect(
      `/new?error=` + encodeURIComponent("Please fill in all fields."),
    );
  }

  const { id } = user;

  const newQuestion = await prisma.questions.create({
    data: {
      question,
      createdById: id,
      Answers: {
        create: [
          {
            answer: firstOption,
          },
          {
            answer: secondOption,
          },
        ],
      },
    },
  });

  if (!newQuestion) {
    return redirect(
      `/new?error=` +
        encodeURIComponent("An error occurred while creating the question."),
    );
  }

  return redirect("/");
};
