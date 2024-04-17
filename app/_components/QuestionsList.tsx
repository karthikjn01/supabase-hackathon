import { Questions } from "@prisma/client";
import QuestionListRenderer from "./QuestionListRenderer";
import { deleteQuestion, getQuestions, loadQuestion } from "../actions/questions";
import { deleteVote, vote } from "../actions/vote";
import { getUser } from "@/utils/supabase/server";

export default async function QuestionsList({
    sortBy = 'Newest',
    page = 0,
}: {
    sortBy: "Popular" | "Newest";
    page?: number;
}) {
    const {
        data: initialQuestions,
        success,
        totalQuestions,
        voteCounts,
    } = await getQuestions({ page, sortBy });

    if (!success) {
        return <div>Failed to load questions</div>
    }

    const { user, error } = await getUser();

    return <div className="container">
        <QuestionListRenderer
            initialQuestions={initialQuestions}
            initialVoteCounts={voteCounts}
            totalQuestions={totalQuestions}
            vote={vote}
            refreshQuestion={loadQuestion}
            deleteVote={deleteVote}
            deleteQuestion={deleteQuestion}
            sortBy={sortBy}
            userId={user?.id}
            page={page}
            loadMore={getQuestions}
        />
    </div>
}