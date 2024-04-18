"use server";

import prisma from "@/db";
import { createClient, getUser } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const getQuestions = async ({
  page = 0,
  take = 10,
  sortBy = "Popular",
}: {
  sortBy?: "Popular" | "Newest";
  page?: number;
  take?: number;
}) => {
  const { user, error } = await getUser();

  const cappedTake = Math.min(take, 10);

  let queryOrderByVotes = prisma.questions.findMany({
    take: cappedTake,
    skip: page * take,
    orderBy: [
      {
        Votes: {
          _count: "desc",
        },
      },
      {
        createdAt: "desc",
      },
    ],
    include: {
      Answers: true,
      createdBy: true,
    },
  });

  let queryOrderByNewest = prisma.questions.findMany({
    take: cappedTake,
    skip: page * take,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      Answers: true,
      createdBy: true,
    },
  });

  if (!!(user?.id)) {
    queryOrderByNewest = prisma.questions.findMany({
      take: cappedTake,
      skip: page * take,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        Answers: true,
        createdBy: true,
        Votes: {
          where: {
            userId: user.id,
          },
        },
      },
    });

    queryOrderByVotes = prisma.questions.findMany({
      take: cappedTake,
      skip: page * take,
      orderBy: [
        {
          Votes: {
            _count: "desc",
          },
        },
        {
          createdAt: "desc",
        },
      ],
      include: {
        Answers: true,
        createdBy: true,
        Votes: {
          where: {
            userId: user.id,
          },
        },
      },
    });
  }

  const [data, total] = await Promise.all([
    await sortBy === "Popular" ? queryOrderByVotes : queryOrderByNewest,
    await prisma.questions.count(),
  ]);

  const voteCounts = new Map<string, number>();
  await Promise.all(data.map(async (question) => {
    await Promise.all(question.Answers.map(async (answer) => {
      const count = await prisma.votes.count({
        where: {
          answerId: answer.id,
        },
      });

      voteCounts.set(answer.id, count);
    }));
  }));

  return {
    voteCounts,
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
      createdBy: true,
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
        createdBy: true,
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

  if (!data) {
    return null;
  }

  const answerCounts = new Map<string, number>();

  await Promise.all(
    data?.Answers.map(async (answer) => {
      const count = await prisma.votes.count({
        where: {
          answerId: answer.id,
        },
      });

      answerCounts.set(answer.id, count);
    }) ?? [],
  );

  return {
    data,
    answerCounts,
  };
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

  revalidatePath("/popular");
  revalidatePath("/newest");

  return redirect("/");
};

export const deleteQuestion = async (questionId: string) => {
  const { user, error } = await getUser();

  if (error || !user) {
    redirect("/login");
  }

  const votes = await prisma.votes.deleteMany({
    where: {
      question: {
        id: questionId,
        createdById: user.id,
      },
    },
  });

  if (!votes) {
    console.log("Failed to delete votes");
    return {
      success: false,
    };
  }

  const answers = await prisma.answers.deleteMany({
    where: {
      question: {
        id: questionId,
        createdById: user.id,
      },
    },
  });

  if (!answers) {
    console.log("Failed to delete answers");
    return {
      success: false,
    };
  }

  const question = await prisma.questions.delete({
    where: {
      id: questionId,
      createdById: user.id,
    },
  }).catch(() => null);

  if (!question) {
    console.log("Failed to delete question");
    return {
      success: false,
    };
  }

  revalidatePath("/newest");
  revalidatePath("/popular");
  revalidatePath(`/question/${questionId}`);

  return {
    success: true,
  };
};
