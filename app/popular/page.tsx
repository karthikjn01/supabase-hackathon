import PageContent from "../_components/PageContent"

export default async function Page({
    searchParams
}: {
    searchParams?: { [key: string]: string | string[] | undefined }
}) {

    const page = searchParams?.page || 0;

    return <PageContent
        sortBy="Popular"
        page={parseInt(page as string)}
    />
}