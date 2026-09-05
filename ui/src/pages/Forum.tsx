import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { PlusCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { deletePost, listPosts } from '@/services/posts'
import { parseApiError } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PostCard } from '@/components/forum/PostCard'
import { CreatePostDialog } from '@/components/forum/CreatePostDialog'
import { DeleteConfirmDialog } from '@/components/forum/DeleteConfirmDialog'
import { Pagination } from '@/components/forum/Pagination'

const PAGE_SIZE = 10

export default function Forum() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const postsQuery = useQuery({
    queryKey: ['posts', page],
    queryFn: () => listPosts(page, PAGE_SIZE),
  })

  const deleteMutation = useMutation({
    mutationFn: (postId: number) => deletePost(postId),
    onSuccess: () => {
      toast.success('Sujet supprimé !')
      setDeleteTarget(null)
      void queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
    onError: (error) => toast.error(parseApiError(error).message),
  })

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Forum de <span className="text-amber-400">discussion</span></h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Questions, idées et discussions de la communauté.
          </p>
        </div>
        {user ? (
          <Button onClick={() => setCreateOpen(true)}>
            <PlusCircle /> Nouveau sujet
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link to="/login">Connectez-vous pour publier</Link>
          </Button>
        )}
      </div>

      {postsQuery.isPending && (
        <div className="space-y-6">
          {[0, 1, 2].map((index) => (
            <Card key={index}>
              <CardContent className="space-y-3 py-6">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {postsQuery.isError && (
        <Alert variant="destructive">
          <AlertTitle>Impossible de charger le forum</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            {parseApiError(postsQuery.error).message}
            <Button
              variant="outline"
              size="sm"
              onClick={() => void postsQuery.refetch()}
              className="shrink-0"
            >
              <RefreshCw /> Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {postsQuery.data &&
        (postsQuery.data.content.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Aucun sujet pour le moment. Lancez la discussion !
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-6">
              {postsQuery.data.content.map((post) => (
                <PostCard key={post.id} post={post} onRequestDelete={setDeleteTarget} />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={postsQuery.data.totalPages}
              onChange={setPage}
            />
          </>
        ))}

      <CreatePostDialog open={createOpen} onOpenChange={setCreateOpen} />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget !== null) deleteMutation.mutate(deleteTarget)
        }}
        isPending={deleteMutation.isPending}
        description="Ce sujet et tous ses commentaires seront définitivement supprimés."
      />
    </section>
  )
}
