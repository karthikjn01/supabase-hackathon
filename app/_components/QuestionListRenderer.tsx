'use client';

import { Answers, Profiles, Questions, Votes } from "@prisma/client";
import { useState } from "react";
import LoadMoreButton from "./LoadMoreButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QuestionCard from "./QuestionCard";

export type QuestionType = (Questions & {
    Answers: Answers[],
    Votes?: Votes[],
    createdBy: Profiles,
})

export default function QuestionListRenderer({
    initialQuestions,
    totalQuestions,
    refreshQuestion,
    vote,
    initialVoteCounts,
    deleteVote,
    deleteQuestion,
    sortBy,
    loadMore,
    page: initialPage,
    userId,
}: {
    initialQuestions: QuestionType[]
    totalQuestions: number
    initialVoteCounts: Map<string, number>
    refreshQuestion: (questionId: string) => Promise<{
        data: QuestionType,
        answerCounts: Map<string, number>
    } | null>;
    vote: (questionId: string, answerId: string) => Promise<{
        vote: Votes,
        success: boolean,
    }>
    deleteVote: (questionId: string, answerId: string) => Promise<{
        success: boolean,
    }>,
    deleteQuestion: (questionId: string) => Promise<{
        success: boolean,
    }>
    sortBy: "Popular" | "Newest",
    page: number,
    loadMore: (props: { page: number, sortBy: "Popular" | "Newest" }) => Promise<{
        data: QuestionType[],
        success: boolean,
        totalQuestions: number,
        voteCounts: Map<string, number>,
    }>,
    userId: string | undefined,
}) {

    const [questions, setQuestions] = useState<QuestionType[]>(initialQuestions);
    const [voteCounts, setVoteCounts] = useState<Map<string, number>>(initialVoteCounts);
    const [page, setPage] = useState<number>(initialPage);

    const handleDeleteVote = async (questionId: string, answerId: string) => {
        const {
            success,
        } = await deleteVote(questionId, answerId);

        if (!success) {
            console.error("Failed to vote");
            //todo handle properly.
            return;
        }

        const updatedQuestion = await refreshQuestion(questionId);

        const newQuestionsArray: QuestionType[] = [];
        questions.forEach((question) => {
            if (question.id === questionId && !!updatedQuestion) {
                newQuestionsArray.push(updatedQuestion.data);
            } else {
                newQuestionsArray.push(question);
            }
        });

        //update answer counts
        updatedQuestion?.answerCounts.forEach((count, answerId) => {
            voteCounts.set(answerId, count);
        });

        setQuestions(newQuestionsArray);
    }

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
                newQuestionsArray.push(updatedQuestion.data);
            } else {
                newQuestionsArray.push(question);
            }
        });

        //update answer counts
        updatedQuestion?.answerCounts.forEach((count, answerId) => {
            voteCounts.set(answerId, count);
        });

        setQuestions(newQuestionsArray);
    }

    const handleDeleteQuestion = async (questionId: string) => {
        const {
            success
        } = await deleteQuestion(questionId);

        if (!success) {
            console.error("Failed to delete question");
            //todo handle properly
            return;
        }

        setQuestions((questions) => questions.filter((question) => question.id !== questionId));
    }

    const handleLoadMore = async () => {
        const {
            data,
            success,
            totalQuestions: newTotalQuestions,
            voteCounts: newVoteCounts,
        } = await loadMore({ page: page + 1, sortBy });
        setPage(page + 1);

        if (!success) {
            console.error("Failed to load more questions");
            //todo handle properly
            return;
        }

        const newQuestions = questions.concat(data);

        setQuestions(newQuestions);

        newVoteCounts.forEach((count, answerId) => {
            voteCounts.set(answerId, count);
        });

    }

    console.log({
        page,
        count: ((page + 1) * 10),
        totalQuestions: totalQuestions,
    })


    return <div className="w-full flex flex-col gap-10">
        {
            questions.map((question) => {
                const relevantVotes = new Map<string, number>();
                question.Answers.forEach((answer) => {
                    relevantVotes.set(answer.id, voteCounts.get(answer.id) ?? 0);
                });



                return <QuestionCard
                    question={question}
                    handleVote={handleVote}
                    relevantVotes={relevantVotes}
                    deleteVote={handleDeleteVote}
                    deleteQuestion={handleDeleteQuestion}
                    key={question.id}
                    userId={userId}
                />
            })
        }



        <LoadMoreButton loadedAll={((page + 1) * 10) >= totalQuestions} onClick={() => {
            handleLoadMore();
        }} />
    </div>
}