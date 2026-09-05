import { CalendarDays, Trash2 } from 'lucide-react'
import type { ActivityResponse } from '@/services/types'
import { formatDate } from '@/lib/date'
import { useAuth } from '@/context/AuthContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface ActivityCardProps {
  activity: ActivityResponse
  onRequestDelete: (activityId: number) => void
}

export function ActivityCard({ activity, onRequestDelete }: ActivityCardProps) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  return (
    <Card className="group flex flex-col overflow-hidden pt-0 transition-shadow hover:shadow-lg">
      <div className="bg-primary/10 text-amber-400 relative aspect-[4/3] w-full">
        {activity.imageUrl ? (
          <img
            src={activity.imageUrl}
            alt={activity.title}
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <CalendarDays className="size-12 opacity-40" />
          </div>
        )}
      </div>
      <CardHeader className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className="gap-1.5">
            <CalendarDays className="size-3" />
            {formatDate(activity.activityDate)}
          </Badge>
          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Supprimer l'activité ${activity.title}`}
              onClick={() => onRequestDelete(activity.id)}
            >
              <Trash2 className="text-muted-foreground size-4" />
            </Button>
          )}
        </div>
        <CardTitle className="leading-snug">{activity.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
          {activity.message}
        </p>
      </CardContent>
    </Card>
  )
}
