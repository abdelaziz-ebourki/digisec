import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarPlus, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { deleteActivity, listActivities } from '@/services/activities'
import { parseApiError } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ActivityCard } from '@/components/activities/ActivityCard'
import { CreateActivityDialog } from '@/components/activities/CreateActivityDialog'
import { DeleteConfirmDialog } from '@/components/forum/DeleteConfirmDialog'

export default function Activities() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const activitiesQuery = useQuery({
    queryKey: ['activities'],
    queryFn: listActivities,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteActivity(id),
    onSuccess: () => {
      toast.success('Activité supprimée')
      setDeleteTarget(null)
      void queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
    onError: (error) => toast.error(parseApiError(error).message),
  })

  const isAdmin = user?.role === 'ADMIN'

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Nos activités</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ateliers, conférences et événements du club.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setCreateOpen(true)}>
            <CalendarPlus /> Nouvelle activité
          </Button>
        )}
      </div>

      {activitiesQuery.isPending && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <Card key={index} className="overflow-hidden pt-0">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <CardContent className="space-y-3 pt-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activitiesQuery.isError && (
        <Alert variant="destructive">
          <AlertTitle>Impossible de charger les activités</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            {parseApiError(activitiesQuery.error).message}
            <Button
              variant="outline"
              size="sm"
              onClick={() => void activitiesQuery.refetch()}
              className="shrink-0"
            >
              <RefreshCw /> Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {activitiesQuery.data &&
        (activitiesQuery.data.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Aucune activité pour le moment. Revenez bientôt !
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activitiesQuery.data.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onRequestDelete={setDeleteTarget}
              />
            ))}
          </div>
        ))}

      <CreateActivityDialog open={createOpen} onOpenChange={setCreateOpen} />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget !== null) deleteMutation.mutate(deleteTarget)
        }}
        isPending={deleteMutation.isPending}
        description="Cette activité et son image seront définitivement supprimées."
      />
    </section>
  )
}
