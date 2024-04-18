import { getUser } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { changeUsername } from "../actions/profile";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import prisma from "@/db";

export default async function Page({
    searchParams
}: {
    searchParams?: { [key: string]: string | string[] | undefined }
}) {
    const { user, error: accountError } = await getUser();

    const success = searchParams?.success;

    const error = searchParams?.error;

    if (accountError || !user) {
        redirect('/login');
    }

    const profile = await prisma.profiles.findFirst({
        where: {
            id: user.id
        }
    })

    return <div className="flex flex-col w-full container gap-6">
        {
            success && <Alert>
                {success}
            </Alert>
        }

        {
            error && <Alert variant={'destructive'}>
                {error}
            </Alert>
        }

        <h1 className="text-3xl">Settings</h1>
        <form action={changeUsername} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
                <label>
                    Change Display Name
                </label>
                <Input type="text" name="username" id="username" placeholder={profile?.displayName ?? 'Display Name'} />
            </div>
            <Button type="submit">
                Change Username
            </Button>
        </form>
    </div>


}