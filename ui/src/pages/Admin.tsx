import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, CalendarDays, MessagesSquare, Pencil, RefreshCw, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { deleteActivity, listActivities } from '@/services/activities'
import { listUsers } from '@/services/admin'
import { parseApiError } from '@/services/api'
import { deletePost, listPosts } from '@/services/posts'
import { formatDate, formatDateTime } from '@/lib/date'
import type { ActivityResponse, PostResponse } from '@/services/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DeleteConfirmDialog } from '@/components/forum/DeleteConfirmDialog'
import { EditActivityDialog } from '@/components/activities/EditActivityDialog'
import { EditPostDialog } from '@/components/forum/EditPostDialog'

const POSTS_PAGE_SIZE = 50

interface DeleteTarget {
  kind: 'activity' | 'post'
  id: number
  label: string
}

export default function Admin() {
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [editActivity, setEditActivity] = useState<ActivityResponse | null>(null)
  const [editPost, setEditPost] = useState<PostResponse | null>(null)

  const activitiesQuery = useQuery({ queryKey: ['activities'], queryFn: listActivities })
  const postsQuery = useQuery({
    queryKey: ['posts', 0],
    queryFn: () => listPosts(0, POSTS_PAGE_SIZE),
  })
  const usersQuery = useQuery({ queryKey: ['admin-users'], queryFn: listUsers })

  const deleteMutation = useMutation({
    mutationFn: (target: DeleteTarget) =>
      target.kind === 'activity' ? deleteActivity(target.id) : deletePost(target.id),
    onSuccess: (_, target) => {
      toast.success(target.kind === 'activity' ? 'Activité supprimée !' : 'Sujet supprimé !')
      setDeleteTarget(null)
      void queryClient.invalidateQueries({ queryKey: ['activities'] })
      void queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
    onError: (error) => toast.error(parseApiError(error).message),
  })

  const isPending = activitiesQuery.isPending || postsQuery.isPending || usersQuery.isPending
  const firstError = activitiesQuery.error ?? postsQuery.error ?? usersQuery.error

  const stats = [
    {
      label: 'Activités',
      value: activitiesQuery.data?.length,
      icon: CalendarDays,
    },
    {
      label: 'Sujets du forum',
      value: postsQuery.data?.totalElements,
      icon: MessagesSquare,
    },
    {
      label: 'Membres',
      value: usersQuery.data?.length,
      icon: Users,
    },
  ]

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Panneau <span className="text-amber-400">d&apos;administration</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vue d&apos;ensemble du contenu et des membres du club.
        </p>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 py-6">
              <stat.icon className="size-8 shrink-0 text-amber-400" aria-hidden />
              <div>
                <p className="text-3xl font-bold">
                  {stat.value ?? <Skeleton className="h-9 w-12" />}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isPending && (
        <div className="space-y-6">
          {[0, 1, 2].map((index) => (
            <Card key={index}>
              <CardContent className="space-y-3 py-6">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isPending && firstError && (
        <Alert variant="destructive">
          <AlertTitle>Impossible de charger le panneau</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            {parseApiError(firstError).message}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void activitiesQuery.refetch()
                void postsQuery.refetch()
                void usersQuery.refetch()
              }}
              className="shrink-0"
            >
              <RefreshCw /> Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!isPending && !firstError && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Activités ({activitiesQuery.data?.length ?? 0})</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/activities">
                  Gérer <ArrowRight />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="divide-y px-0">
              {activitiesQuery.data?.length === 0 && (
                <p className="px-6 py-8 text-center text-muted-foreground">
                  Aucune activité pour le moment.
                </p>
              )}
              {activitiesQuery.data?.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between gap-4 px-6 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(activity.activityDate)}
                    </p>
                  </div>
                  <div className="flex shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Modifier l'activité ${activity.title}`}
                      onClick={() => setEditActivity(activity)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`supprimer l'activité ${activity.title}`}
                      onClick={() =>
                        setDeleteTarget({ kind: 'activity', id: activity.id, label: activity.title })
                      }
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Sujets du forum ({postsQuery.data?.totalElements ?? 0})</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/forum">
                  Gérer <ArrowRight />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="divide-y px-0">
              {postsQuery.data?.content.length === 0 && (
                <p className="px-6 py-8 text-center text-muted-foreground">
                  Aucun sujet pour le moment.
                </p>
              )}
              {postsQuery.data?.content.map((post) => (
                <div key={post.id} className="flex items-center justify-between gap-4 px-6 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{post.title}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      par {post.authorFirstName} · {formatDateTime(post.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Modifier le sujet ${post.title}`}
                      onClick={() => setEditPost(post)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`supprimer le sujet ${post.title}`}
                      onClick={() => setDeleteTarget({ kind: 'post', id: post.id, label: post.title })}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Membres ({usersQuery.data?.length ?? 0})</CardTitle>
            </CardHeader>
            <CardContent className="divide-y px-0">
              {usersQuery.data?.length === 0 && (
                <p className="px-6 py-8 text-center text-muted-foreground">
                  Aucun membre pour le moment.
                </p>
              )}
              {usersQuery.data?.map((member) => (
                <div key={member.id} className="flex items-center justify-between gap-4 px-6 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {member.email} · {member.codeApoge}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {member.role === 'ADMIN' && <Badge>Admin</Badge>}
                    <Badge variant={member.verified ? 'secondary' : 'outline'}>
                      {member.verified ? 'Vérifié' : 'En attente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      <EditActivityDialog
        activity={editActivity}
        open={editActivity !== null}
        onOpenChange={(open) => !open && setEditActivity(null)}
      />

      <EditPostDialog
        post={editPost}
        open={editPost !== null}
        onOpenChange={(open) => !open && setEditPost(null)}
      />

      <DeleteConfirmDialog        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget !== null) deleteMutation.mutate(deleteTarget)
        }}
        isPending={deleteMutation.isPending}
        description={
          deleteTarget?.kind === 'activity'
            ? `« ${deleteTarget?.label} » et son image seront définitivement supprimés.`
            : `Le sujet « ${deleteTarget?.label} » et ses commentaires seront définitivement supprimés.`
        }
      />
    </section>
  )
}
