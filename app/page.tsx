import AuthButton from "../components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header";
import QuestionsList from "./_components/QuestionsList";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Index({
  searchParams
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {

  const sortBy = searchParams?.sort_by ?? "Popular";
  const page = searchParams?.page ?? 0;

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <QuestionsList
        sortBy={sortBy as "Popular" | "Newest"}
        page={parseInt(page as string)}
      />
      <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
        <p>
          Powered by{" "}
          <a
            href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
            target="_blank"
            className="font-bold hover:underline"
            rel="noreferrer"
          >
            Supabase
          </a>
        </p>
      </footer>
    </div>
  );
}
