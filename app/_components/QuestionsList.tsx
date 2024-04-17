import { Questions } from "@prisma/client";
import QuestionListRenderer from "./QuestionListRenderer";
import { getQuestions, loadQuestion } from "../actions/questions";
import { vote } from "../actions/vote";

export default async function QuestionsList() {
    const {
        data: initialQuestions,
        success,
        totalQuestions,
    } = await getQuestions({ page: 0 });

    if (!success) {
        return <div>Failed to load questions</div>
    }

    return <div className="container">
        <QuestionListRenderer
            initialQuestions={initialQuestions}
            totalQuestions={totalQuestions}
            vote={vote}
            refreshQuestion={loadQuestion} />
    </div>
}