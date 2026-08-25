import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold">
            Digi<span className="text-primary">sec</span>
          </p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Digitalisation et cybersécurité — club étudiant de la FSBM.
          </p>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <MapPin className="size-4" /> FSBM, Casablanca - 20670
          </p>
          <p className="flex items-center gap-2">
            <Mail className="size-4" />
            <a href="mailto:digisecfsbm@gmail.com" className="hover:text-foreground">
              digisecfsbm@gmail.com
            </a>
          </p>
          <p className="flex items-center gap-2">
            <Phone className="size-4" />
            <a href="tel:+212668889041" className="hover:text-foreground">
              +212 668-889041
            </a>
          </p>
        </div>
        <div className="text-sm text-muted-foreground md:text-right">
          <nav aria-label="Navigation pied de page" className="flex flex-col gap-1 md:items-end">
            <Link to="/digisec" className="hover:text-foreground">
              À propos
            </Link>
            <Link to="/activities" className="hover:text-foreground">
              Activités
            </Link>
            <Link to="/forum" className="hover:text-foreground">
              Forum
            </Link>
          </nav>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        DIGISEC © 2024–2026 TOUS DROITS RÉSERVÉS
      </div>
    </footer>
  )
}
