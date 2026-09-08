import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { toast } from 'sonner'
import { updatePost } from '@/services/posts'
import { parseApiError } from '@/services/api'
import type { PostResponse } from '@/services/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface EditPostDialogProps {
  post: PostResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditPostDialog({ post, open, onOpenChange }: EditPostDialogProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    if (post && open) {
      setTitle(post.title)
      setContent(post.content)
    }
  }, [post, open])

  const mutation = useMutation({
    mutationFn: () =>
      updatePost(post?.id as number, { title: title.trim(), content: content.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Sujet modifié !')
      onOpenChange(false)
    },
    onError: (error) => toast.error(parseApiError(error).message),
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (post && title.trim() && content.trim()) mutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le sujet</DialogTitle>
          <DialogDescription>Mettez à jour le titre ou le contenu du sujet.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-post-title">Titre</Label>
            <Input
              id="edit-post-title"
              value={title}
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de votre sujet"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-post-content">Contenu</Label>
            <Textarea
              id="edit-post-content"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Décrivez votre sujet…"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !content.trim() || mutation.isPending}
            >
              {mutation.isPending ? 'Modification…' : 'Modifier'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
