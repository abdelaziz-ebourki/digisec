import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, ChevronUp, LoaderCircle, SendHorizonal, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { addComment, deleteComment, listComments } from '@/services/comments'
import { parseApiError } from '@/services/api'
import type { CommentResponse } from '@/services/types'
import { formatDateTime } from '@/lib/date'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface CommentSectionProps {
  postId: number
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [text, setText] = useState('')

  const commentsQuery = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => listComments(postId),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['comments', postId] })

  const addMutation = useMutation({
    mutationFn: () => addComment(postId, text.trim()),
    onSuccess: () => {
      setText('')
      invalidate()
    },
    onError: (error) => toast.error(parseApiError(error).message),
  })

  const deleteMutation = useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onSuccess: () => {
      toast.success('Commentaire supprimé')
      invalidate()
    },
    onError: (error) => toast.error(parseApiError(error).message),
  })

  const handleAdd = (event: FormEvent) => {
    event.preventDefault()
    if (text.trim()) addMutation.mutate()
  }

  const canDelete = (comment: CommentResponse) =>
    user && (user.id === comment.authorId || user.role === 'ADMIN')

  if (commentsQuery.isPending) {
    return <LoaderCircle className="text-muted-foreground mx-auto my-4 size-5 animate-spin" />
  }

  if (commentsQuery.isError) {
    return (
      <p role="alert" className="text-destructive px-4 py-2 text-sm">
        {parseApiError(commentsQuery.error).message}
      </p>
    )
  }

  const comments = commentsQuery.data ?? []

  return (
    <div className="space-y-3 border-t px-4 py-3">
      {comments.length === 0 && (
        <p className="text-sm text-muted-foreground">Aucun commentaire pour le moment.</p>
      )}
      {comments.map((comment) => (
        <div key={comment.id} className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm">
              <span className="font-medium">{comment.authorFirstName}</span>{' '}
              <span className="text-xs text-muted-foreground">
                · {formatDateTime(comment.createdAt)}
              </span>
            </p>
            <p className="text-sm break-words text-foreground/90">{comment.commentText}</p>
          </div>
          {canDelete(comment) && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Supprimer le commentaire de ${comment.authorFirstName}`}
              onClick={() => deleteMutation.mutate(comment.id)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      ))}

      {user ? (
        <form onSubmit={handleAdd} className="flex items-end gap-2 pt-1">
          <Textarea
            aria-label="Nouveau commentaire"
            placeholder="Ajouter un commentaire…"
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button
            type="submit"
            size="icon"
            aria-label="Publier le commentaire"
            disabled={!text.trim() || addMutation.isPending}
          >
            {addMutation.isPending ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <SendHorizonal />
            )}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-primary underline">
            Connectez-vous
          </Link>{' '}
          pour commenter.
        </p>
      )}
    </div>
  )
}

interface CommentsToggleProps {
  expanded: boolean
  onToggle: () => void
}

export function CommentsToggle({ expanded, onToggle }: CommentsToggleProps) {
  const Icon = expanded ? ChevronUp : ChevronDown
  return (
    <Button variant="ghost" size="sm" onClick={onToggle}>
      <Icon />
      Commentaires
    </Button>
  )
}
