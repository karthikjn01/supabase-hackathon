import { Button } from "@/components/ui/button"

export default function LoadMoreButton({
    loadedAll,
    onClick
}: {
    loadedAll: boolean
    onClick: () => void
}) {
    return <div>
        <Button
            disabled={loadedAll}
            onClick={onClick}
        >
            {loadedAll ? "Loaded All" : "Load More"}
        </Button>
    </div>
}