'use client';

import QuestionCard from "@/app/_components/QuestionCard";
import { QuestionType } from "@/app/_components/QuestionListRenderer";
import { deleteQuestion } from "@/app/actions/questions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CommentsForAnswer from "./CommentsForAnswer";
import { addComment, deleteComment, loadComments, updateComment } from "@/app/actions/comments";

export default function IndividualQuestion({
    questionId,
    question,
    relevantVotes,
    vote,
    deleteQuestion,
    deleteVote,
    userId,
    refreshQuestion,
}: {
    questionId: string
    question: QuestionType
    relevantVotes: Map<string, number>
    vote: (questionId: string, answerId: string) => Promise<{
        success: boolean;
    }>
    deleteQuestion: (questionId: string) => Promise<{
        success: boolean;
    }>
    deleteVote: (questionId: string, answerId: string) => Promise<{
        success: boolean;
    }>
    userId: string | undefined,
    refreshQuestion: (questionId: string) => Promise<{
        data: QuestionType,
        answerCounts: Map<string, number>
    } | null>;
}) {

    const [relevantV, setRelevantVotes] = useState<Map<string, number>>(relevantVotes);
    const [q, setQuestion] = useState<QuestionType>(question);

    const router = useRouter();

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

        if (!updatedQuestion) {
            console.error("Failed to refresh question");
            //todo handle properly
            return;
        }

        setQuestion(updatedQuestion.data);
        setRelevantVotes(updatedQuestion.answerCounts);
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

        if (!updatedQuestion) {
            console.error("Failed to refresh question");
            //todo handle properly
            return;
        }

        setQuestion(updatedQuestion.data);
        setRelevantVotes(updatedQuestion.answerCounts);

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

        router.push("/");
    }

    return <div className="w-full flex flex-col container gap-2">
        <QuestionCard
            question={q}
            relevantVotes={relevantV}
            handleVote={handleVote}
            deleteQuestion={handleDeleteQuestion}
            deleteVote={handleDeleteVote}
            userId={userId}
            showViewButton={false}
        />
        <div className="flex flex-row gap-2 justify-stretch">
            {
                q.Answers.map((answer) => {
                    return <CommentsForAnswer
                        key={answer.id}
                        answerId={answer.id}
                        questionId={questionId}
                        createComment={addComment}
                        deleteComment={deleteComment}
                        updateComment={updateComment}
                        userId={userId}
                        loadComments={loadComments}
                    />
                })
            }
        </div>
    </div>
}