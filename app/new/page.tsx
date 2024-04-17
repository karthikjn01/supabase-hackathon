import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { newQuestion } from "../actions/questions";
import { createClient, getUser } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Alert } from "@/components/ui/alert";

export default async function NewQuestionPage({
    searchParams
}: {
    searchParams?: { [key: string]: string | string[] | undefined }
}) {

    // only visible if logged in
    const responseError = searchParams?.error;

    const { user, error } = await getUser();

    if (error || !user) {
        redirect('/login');
    }

    return <div className="flex flex-col container gap-8">
        {
            !!responseError && <Alert variant={"destructive"}>
                {responseError}
            </Alert>
        }
        <h1 className="text-3xl">
            New Question
        </h1>
        <form className="gap-6 flex flex-col" action={newQuestion}>
            <div className="flex flex-col gap-2">
                <label>
                    Question
                </label>
                <Input
                    type="text"
                    name="question"
                    id="question"
                    className="border border-foreground/10 rounded-md"
                />
            </div>
            <div className="flex flex-row gap-4 justify-stretch">
                <div className="flex flex-col gap-2 w-full">
                    <label>
                        First Option
                    </label>
                    <Input
                        type="text"
                        name="first_option"
                        id="first_option"
                        className="border border-foreground/10 rounded-md"
                    />
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <label>
                        Second Option
                    </label>
                    <Input
                        type="text"
                        name="second_option"
                        id="second_option"
                        className="border border-foreground/10 rounded-md"
                    />
                </div>
            </div>
            <Button
                type="submit"
                className=""
            >
                Submit
            </Button>
        </form>
    </div>
}