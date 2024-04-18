import { Button } from "@/components/ui/button";
import QuestionsList from "./QuestionsList";
import Link from "next/link";

export default async function PageContent({
  sortBy,
  page,
}: {
  sortBy: "Popular" | "Newest";
  page: number;
}) {


  return (
    <div className="flex-1 w-full flex flex-col gap-10 items-center">
      <div className="flex flex-row justify-end w-full container">
        <Button asChild>
          <Link href={`${sortBy === "Newest" ? "popular" : "newest"}`}>
            {
              sortBy === "Newest" ? "Sort by Popular" : "Sort by Newest"
            }
          </Link>
        </Button>
      </div>
      <QuestionsList
        sortBy={sortBy as "Popular" | "Newest"}
        page={page}
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
