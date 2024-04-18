import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Comments } from "@prisma/client"
import { PenBox, Trash } from "lucide-react";
import { useEffect, useState } from "react";

type CommentType = (Comments & {
    user: {
        displayName?: string | null,
        id?: string | null,
    }
});

export default function CommentsForAnswer({
    answerId,
    questionId,
    loadComments,
    createComment,
    updateComment,
    deleteComment,
    userId,
}: {
    answerId: string,
    questionId: string,
    loadComments: (answerId: string, props: { page?: number }) => Promise<{
        comments: CommentType[],
        totalComments: number,
    }>,
    createComment: (questionId: string, answerId: string, text: string) => Promise<{
        success?: boolean,
        error?: string,
    }>
    updateComment: (commentId: string, text: string) => Promise<{
        success?: boolean,
        error?: string,
    }>,
    deleteComment: (commentId: string) => Promise<{
        success?: boolean,
        error?: string,
    }>,
    userId: string | undefined,
}) {
    const [comments, setComments] = useState<CommentType[]>([]);
    const [page, setPage] = useState(0);
    const [newComment, setNewComment] = useState("")
    const [editingComment, setEditingComment] = useState<{
        commentId: string,
        text: string,
    } | null>(null);

    const handleLoadComments = async (page: number) => {
        if (page < 0) return;
        const { comments, totalComments } = await loadComments(answerId, { page });
        setPage(page);
        setComments((existingComments) => {
            //sort comments with existing comments
            const allComments = [
                ...existingComments,
                ...comments,
            ].sort((a, b) => {
                return a.createdAt.getTime() - b.createdAt.getTime();
            });

            //remove dupes
            const uniqueComments = allComments.filter((comment, index) => {
                return allComments.findIndex((c) => c.id === comment.id) === index;
            });

            return uniqueComments;
        });
    }

    const handleCreateComment = async (text: string) => {
        const { success, error } = await createComment(questionId, answerId, text);
        if (!success) {
            console.error(error);
            return;
        }
        setComments([]);
        handleLoadComments(0);
        setNewComment("");
    }

    const handleDeleteComment = async (commentId: string) => {
        const { success, error } = await deleteComment(commentId);
        if (!success) {
            console.error(error);
            return;
        }
        setComments((existingComments) => {
            return existingComments.filter((comment) => {
                return comment.id !== commentId;
            });
        });
    }

    const handleEditComment = async (comment: {
        commentId: string,
        text: string,
    }) => {
        const { success, error } = await updateComment(comment.commentId, comment.text);
        if (!success) {
            console.error(error);
            return;
        }
        setEditingComment(null);
        setComments((exComments) => [...exComments.map((c) => {
            if (c.id === comment.commentId) {
                return {
                    ...c,
                    comment: comment.text,
                }
            }
            return c;
        })]);
    }

    useEffect(() => {
        handleLoadComments(0);
    }, [])


    return <Card className="flex flex-col p-5 w-full">
        {
            comments.map((comment) => {
                return <div key={comment.id} className="flex flex-row py-3 justify-between items-center">
                    <div>
                        <p>{comment.user.displayName} : {comment.comment}</p>
                    </div>
                    {userId === comment.user.id && <div className="flex flex-row gap-2">
                        <Button
                            onClick={() => {
                                setEditingComment({
                                    commentId: comment.id,
                                    text: comment.comment,
                                })
                            }}
                            size={'icon'}
                            variant={'ghost'}
                        >
                            <PenBox size={24} />
                        </Button>
                        <Button
                            onClick={() => handleDeleteComment(comment.id)}
                            size={'icon'}
                            variant={'destructive'}
                        >
                            <Trash size={24} />
                        </Button>
                    </div>}
                </div>
            })
        }
        {!editingComment && <div className="flex flex-row gap-2">
            <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment"
                className="flex-grow"
            />
            <Button
                onClick={() => handleCreateComment(newComment)}
                disabled={!newComment}
            >
                Add Comment
            </Button>
        </div>}

        {!!editingComment && <div className="flex flex-row gap-2">
            <Input
                value={editingComment.text}
                onChange={(e) => setEditingComment({
                    ...editingComment,
                    text: e.target.value,
                })}
                placeholder="Edit a comment"
                className="flex-grow"
            />
            <Button
                onClick={() => handleEditComment(editingComment)}
                disabled={!editingComment.text}
            >
                Update Comment
            </Button>
        </div>}
    </Card>

}