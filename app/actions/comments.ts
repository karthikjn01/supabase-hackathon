"use server";

import prisma from "@/db";
import { getUser } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const addComment = async (
  questionId: string,
  answerId: string,
  text: string,
) => {
  const { user, error } = await getUser();

  if (error || !user) {
    redirect("/login");
  }

  const id = user.id;

  const comment = await prisma.comments.create({
    data: {
      questionId,
      comment: text,
      userId: id,
      answerId,
    },
  });

  if (!comment) {
    return {
      error: "An error occurred while creating the comment.",
    };
  }

  return {
    success: true,
  };
};

export const updateComment = async (commentId: string, text: string) => {
  const { user, error } = await getUser();

  if (error || !user) {
    redirect("/login");
  }

  const id = user.id;

  const comment = await prisma.comments.update({
    where: {
      id: commentId,
      userId: id,
    },
    data: {
      comment: text,
    },
  });

  if (!comment) {
    return {
      error: "An error occurred while updating the comment.",
    };
  }

  return {
    success: true,
  };
};

export const deleteComment = async (commentId: string) => {
  const { user, error } = await getUser();

  if (error || !user) {
    redirect("/login");
  }

  const id = user.id;

  const comment = await prisma.comments.delete({
    where: {
      id: commentId,
      userId: id,
    },
  });

  if (!comment) {
    return {
      error: "An error occurred while deleting the comment.",
    };
  }

  return {
    success: true,
  };
};

export const loadComments = async (answerId: string, {
  page = 0,
}: {
  page?: number;
}) => {
  const comments = await prisma.comments.findMany({
    where: {
      answerId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          displayName: true,
          id: true,
        },
      },
    },
    skip: page * 10,
    take: 10,
  });

  const totalComments = await prisma.comments.count({
    where: {
      answerId,
    },
  });

  return {
    comments,
    totalComments,
  };
};
