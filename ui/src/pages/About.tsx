import { CalendarDays, Megaphone, ShieldCheck, Smartphone, Target } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { MEMBERS } from '@/data/members'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface MissionCard {
  icon: LucideIcon
  title: string
  text: string
  image: string
}

const MISSIONS: MissionCard[] = [
  {
    icon: Smartphone,
    title: 'Digitalisation',
    text: "Moderniser les activités de la faculté pour la rendre plus réactive aux besoins évolutifs de la communauté universitaire.",
    image: '/images/about/mission.jpg',
  },
  {
    icon: ShieldCheck,
    title: 'Sécurité',
    text: "Sensibiliser les étudiants à l'importance de la sécurité informatique et aux risques liés aux cyberattaques.",
    image: '/images/about/obj.jpg',
  },
  {
    icon: CalendarDays,
    title: 'Événements',
    text: 'Organiser conférences et ateliers pour développer les compétences des étudiants face aux défis numériques.',
    image: '/images/about/events.jpg',
  },
]

export default function About() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-3xl font-bold">
          Notre <span className="text-primary">mission</span>
        </h1>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {MISSIONS.map((mission) => (
            <Card key={mission.title} className="overflow-hidden pt-0 transition-shadow hover:shadow-lg">
              <img
                src={mission.image}
                alt={mission.title}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
              <CardHeader>
                <mission.icon className="text-primary size-7" />
                <CardTitle className="mt-2">{mission.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{mission.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/50 py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
          <img
            src="/images/about/degi.jpg"
            alt="Membre DIGISEC"
            loading="lazy"
            className="aspect-[4/5] w-full rounded-2xl object-cover"
          />
          <div>
            <h2 className="flex items-center gap-3 text-3xl font-bold">
              <Target className="text-primary size-8" /> Objectifs
            </h2>
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="font-semibold">Développement</h3>
                <p className="mt-1 leading-relaxed text-muted-foreground">
                  Développer les compétences en sécurité informatique et les compétences
                  numériques pour maîtriser les enjeux technologiques et s'adapter à un monde
                  toujours plus connecté.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Communication</h3>
                <p className="mt-1 leading-relaxed text-muted-foreground">
                  Garantir une communication efficace à l'interne et à l'externe de la faculté.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
        <div className="order-2 md:order-1">
          <h2 className="text-3xl font-bold">
            Notre <span className="text-primary">vision</span>
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Le club DIGISEC vise à devenir une plateforme incontournable pour les étudiants
            passionnés par la cybersécurité, le numérique et l'innovation technologique. Nous
            souhaitons renforcer les compétences techniques et développer une culture de sécurité
            parmi les étudiants afin de les préparer aux défis de l'ère numérique.
          </p>
        </div>
        <img
          src="/images/about/vision.jpg"
          alt="Cybersécurité"
          loading="lazy"
          className="order-1 aspect-[4/3] w-full rounded-2xl object-cover md:order-2"
        />
      </section>

      <section className="bg-muted/50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8">
            <Megaphone className="text-primary size-8" />
            <h2 className="mt-2 text-3xl font-bold">Notre bureau</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              L'équipe qui fait vivre le club au quotidien.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4" aria-label="Membres du bureau">
            {MEMBERS.map((member) => (
              <li key={member.id}>
                <Card className="h-full overflow-hidden pt-0 transition-shadow hover:shadow-lg">
                  <img
                    src={member.photo}
                    alt={member.name}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                  <CardContent className="space-y-1.5 py-4">
                    <p className="text-sm font-semibold">{member.name}</p>
                    <Badge variant="secondary" className="font-normal">
                      {member.role}
                    </Badge>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
