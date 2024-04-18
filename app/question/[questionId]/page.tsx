import QuestionCard from "@/app/_components/QuestionCard"
import { deleteQuestion, loadQuestion } from "@/app/actions/questions"
import IndividualQuestion from "./_components/IndividualQuestion";
import { deleteVote, vote } from "@/app/actions/vote";
import { getUser } from "@/utils/supabase/server";

export default async function Page({
    params: { questionId }
}: {
    params: { questionId: string }
}) {

    const initialQuestion = await loadQuestion(questionId);

    if (!initialQuestion) {
        return <div>
            <h1 className="text-5xl">Question not found</h1>
        </div>
    }

    const {
        data,
        answerCounts
    } = initialQuestion;

    const { user, error } = await getUser();



    return <div className="flex flex-col w-full container">
        <IndividualQuestion
            questionId={questionId}
            deleteQuestion={deleteQuestion}
            question={data}
            relevantVotes={answerCounts}
            vote={vote}
            deleteVote={deleteVote}
            userId={user?.id}
            refreshQuestion={loadQuestion}
        />
    </div>
}