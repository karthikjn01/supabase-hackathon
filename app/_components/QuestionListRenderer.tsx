'use client';

import { Answers, Questions, Votes } from "@prisma/client";
import { useState } from "react";
import LoadMoreButton from "./LoadMoreButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type QuestionType = (Questions & {
    Answers: Answers[],
    Votes?: Votes[],
})

export default function QuestionListRenderer({
    initialQuestions,
    totalQuestions,
    refreshQuestion,
    vote
}: {
    initialQuestions: QuestionType[]
    totalQuestions: number
    refreshQuestion: (questionId: string) => Promise<QuestionType | null>;
    vote: (questionId: string, answerId: string) => Promise<{
        vote: Votes,
        success: boolean,
    }>
}) {

    const [questions, setQuestions] = useState<QuestionType[]>(initialQuestions);

    const handleVote = async (questionId: string, answerId: string) => {
        const {
            success,
        } = await vote(questionId, answerId);

        if (!success) {
            console.error("Failed to vote");
            //todo handle properly.
            return;
        }

        const updatedQuestion = await refreshQuestion(questionId);

        const newQuestionsArray: QuestionType[] = [];
        questions.forEach((question) => {
            if (question.id === questionId && !!updatedQuestion) {
                newQuestionsArray.push(updatedQuestion);
            } else {
                newQuestionsArray.push(question);
            }
        });

        setQuestions(newQuestionsArray);
    }

    return <div className="w-full flex flex-col gap-10">
        {
            questions.map((question) => {
                return <Card className="p-5 w-full gap-6 flex flex-col">
                    <h1 className="text-3xl">
                        {
                            question.question
                        }
                    </h1>
                    <div className="flex flex-row items-center justify-stretch gap-4">
                        {
                            question.Answers.map((answer) => {
                                const voted = (question.Votes?.filter((vote) => vote.answerId === answer.id).length ?? 0) > 0;

                                return <div className="flex flex-row gap-4 w-full">
                                    <Button
                                        className={`text-xl font-bold w-full ${voted && 'bg-green-300'}`}
                                        variant={'secondary'}
                                        onClick={() => {
                                            handleVote(question.id, answer.id)
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
                </Card>
            })
        }
        <LoadMoreButton loadedAll={questions.length === totalQuestions} onClick={() => {
            console.log("Load more questions - being pressed");
            //todo
        }} />
    </div>
}