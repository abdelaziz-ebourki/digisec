import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Users } from 'lucide-react'
import Autoplay from 'embla-carousel-autoplay'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'

const CAROUSEL_IMAGES = [1, 2, 4, 5, 6, 7]

export function HomeContent() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2">
        <div className="relative">
          <img
            src="/images/home/22.jpg"
            alt="Événement DIGISEC"
            className="aspect-[4/3] w-full rounded-2xl object-cover"
            loading="lazy"
          />
          <div
            aria-hidden
            className="from-primary/30 absolute inset-0 rounded-2xl bg-gradient-to-tr to-transparent"
          />
        </div>
        <div>
          <h2 className="text-3xl font-bold">
            Au <span className="text-primary">cœur</span> de Digisec
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            DIGISEC, une fusion entre la digitalisation et la sécurité, symbolise notre engagement
            pour un futur numérique innovant et protégé. En intégrant des solutions modernes pour
            rendre la faculté plus réactive et en sensibilisant la communauté universitaire aux
            enjeux de cybersécurité, nous bâtissons une génération prête à relever les défis
            numériques de demain.
          </p>
        </div>
      </section>

      <section className="bg-neutral-950 py-20 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold">
            NOTRE <span className="text-primary">IMPACT</span>
          </h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-neutral-300">
            Nous offrons des expériences uniques qui permettent à chacun de découvrir sa passion
            pour la cybersécurité, d'affiner ses compétences techniques et de collaborer sur des
            projets innovants pour protéger et servir le monde numérique.
          </p>
          <Button className="mt-6" variant="secondary" asChild>
            <Link to="/digisec">
              En savoir plus <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <Carousel
          opts={{ align: 'start', loop: true }}
          plugins={[Autoplay({ delay: 3000, stopOnInteraction: true })]}
          className="w-full"
        >
          <CarouselContent>
            {CAROUSEL_IMAGES.map((image) => (
              <CarouselItem key={image} className="md:basis-1/2 lg:basis-1/3">
                <img
                  src={`/images/carousel/${image}.jpg`}
                  alt={`Moment fort DIGISEC ${image}`}
                  loading="lazy"
                  className="aspect-video w-full rounded-xl object-cover"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 md:grid-cols-2">
        <div className="order-2 md:order-1">
          <h2 className="text-3xl font-bold">
            Plongés dans l'univers des{' '}
            <span className="text-primary">opportunités</span> !
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Chez DIGISEC, nous mettons à votre disposition une variété de ressources et d'activités
            pour enrichir votre expérience et stimuler votre curiosité pour la cybersécurité. Que
            vous soyez étudiant passionné, professionnel en quête d'échange ou simplement curieux,
            nous avons ce qu'il vous faut !
          </p>
          <Button className="mt-6" asChild>
            <Link to="/activities">
              Découvrir nos activités <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="relative order-1 md:order-2">
          <img
            src="/images/home/opportunites.jpg"
            alt="Atelier DIGISEC"
            className="aspect-[4/3] w-full rounded-2xl object-cover"
            loading="lazy"
          />
          <div
            aria-hidden
            className="from-primary/30 absolute inset-0 rounded-2xl bg-gradient-to-tl to-transparent"
          />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-20">
        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="text-center transition-shadow hover:shadow-lg">
            <CardHeader>
              <Users className="text-primary mx-auto size-10" />
              <CardTitle>Devenir membre</CardTitle>
              <CardDescription>
                Bénéficiez d'un réseau de professionnels et de passionnés pour booster votre
                parcours !
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link to="/register">Rejoindre le club</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="text-center transition-shadow hover:shadow-lg">
            <CardHeader>
              <ShieldCheck className="text-primary mx-auto size-10" />
              <CardTitle>Nos Ateliers</CardTitle>
              <CardDescription>
                Développez vos compétences avec nos formations pratiques sur des sujets clés de la
                cybersécurité.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link to="/activities">Voir les activités</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  )
}
