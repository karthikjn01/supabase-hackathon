import { redirect } from "next/navigation";

export default async function Page() {
    redirect("/newest");
    return <div></div>
}