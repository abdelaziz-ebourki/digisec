import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { PostResponse } from '@/services/types'
import { formatDateTime } from '@/lib/date'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CommentSection, CommentsToggle } from '@/components/forum/CommentSection'

interface PostCardProps {
  post: PostResponse
  onRequestDelete: (postId: number) => void
}

export function PostCard({ post, onRequestDelete }: PostCardProps) {
  const { user } = useAuth()
  const [expanded, setExpanded] = useState(false)

  const canDelete = Boolean(user && (user.id === post.authorId || user.role === 'ADMIN'))

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-full font-semibold"
          >
            {post.authorFirstName.charAt(0).toUpperCase()}
          </span>
          <div>
            <h2 className="leading-tight font-semibold">{post.title}</h2>
            <p className="text-xs text-muted-foreground">
              {post.authorFirstName} · {formatDateTime(post.createdAt)}
            </p>
          </div>
        </div>
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Supprimer le sujet ${post.title}`}
            onClick={() => onRequestDelete(post.id)}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm whitespace-pre-wrap text-foreground/90">{post.content}</p>
        <CommentsToggle expanded={expanded} onToggle={() => setExpanded(!expanded)} />
        {expanded && <CommentSection postId={post.id} />}
      </CardContent>
    </Card>
  )
}
