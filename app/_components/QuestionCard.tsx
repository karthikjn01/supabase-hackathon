'use client';

import { Card } from "@/components/ui/card";
import { QuestionType } from "./QuestionListRenderer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/utils/supabase/client";
import { UserResponse } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export default function QuestionCard({
    question,
    handleVote,
    relevantVotes,
    deleteVote,
    deleteQuestion,
    userId,
    showViewButton = true,
}: {
    question: QuestionType,
    handleVote: (questionId: string, answerId: string) => Promise<void>,
    relevantVotes: Map<string, number>,
    deleteVote: (questionId: string, answerId: string) => Promise<void>,
    deleteQuestion: (questionId: string) => Promise<void>,
    userId: string | undefined,
    showViewButton?: boolean,
}) {

    let totalVotes = 0;

    question.Answers.forEach((answer) => {
        totalVotes += relevantVotes.get(answer.id) ?? 0;
    });


    const votePercentage = (answerId: string) => {
        const voteCount = relevantVotes.get(answerId) ?? 0;
        return (voteCount / totalVotes) * 100;
    }


    const [voteLoading, useVoteLoading] = useTransition();
    const [deleteVoteLoading, useDeleteVoteLoading] = useTransition();
    const router = useRouter();


    return <Card className="p-5 w-full gap-6 flex flex-col">
        <div className="flex flex-row justify-between">
            <h1 className="text-3xl">
                {
                    question.question
                }
            </h1>
            <div className="flex flex-row gap-2">
                {showViewButton && <Button variant={"outline"} onClick={() => {
                    router.push(`/question/${question.id}`);
                }}>
                    View
                </Button>}
                {(userId === question.createdById) && <Button
                    variant={'destructive'}
                    onClick={() => {
                        deleteQuestion(
                            question.id
                        );
                    }}>
                    Delete
                </Button>}
            </div>
        </div>
        <div className="flex flex-row items-center justify-stretch gap-4">
            {
                question.Answers.map((answer) => {
                    const voted = (question.Votes?.filter((vote) => vote.answerId === answer.id).length ?? 0) > 0;

                    return <div className="flex flex-row gap-4 w-full" key={answer.id}>
                        <Button
                            className={`text-xl font-bold w-full ${voted && 'bg-indigo-700 text-white border border-indigo-700 hover:text-indigo-700'} p-10`}
                            variant={'secondary'}
                            disabled={voteLoading || deleteVoteLoading}
                            onClick={() => {
                                if (!voted) {
                                    useVoteLoading(() => handleVote(question.id, answer.id));
                                } else {
                                    useDeleteVoteLoading(() => deleteVote(question.id, answer.id));
                                }
                            }}
                        >
                            {
                                answer.answer
                            }
                        </Button>
                    </div>
                })
            }
        </div>
        {totalVotes > 0 && <div className="flex flex-col w-full gap-2">
            <Progress
                value={votePercentage(question.Answers[0].id)}
                className="w-full h-10 rounded-md"
            />
            <div className="flex flex-row justify-between">
                <p>
                    {votePercentage(question.Answers[0].id)}% out of {totalVotes} votes
                </p>

                <p>
                    Asked by {
                        question.createdBy.displayName ?? question.createdBy.email
                    }
                </p>
            </div>
        </div>}
        {
            totalVotes === 0 && <div className="flex flex-row justify-end">

                <p>
                    Asked by {
                        question.createdBy.displayName ?? question.createdBy.email
                    }
                </p>
            </div>
        }
    </Card>;
}