import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Menu } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const NAV_ITEMS = [
  { to: '/', label: 'ACCUEIL' },
  { to: '/digisec', label: 'DIGISEC' },
  { to: '/activities', label: 'ACTIVITÉS' },
  { to: '/forum', label: 'FORUM' },
]

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium tracking-wide transition-colors ${
      isActive
        ? 'text-primary'
        : isScrolled
          ? 'text-foreground/80 hover:text-foreground'
          : 'text-white/80 hover:text-white'
    }`

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors ${
        isScrolled
          ? 'border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
          : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          to="/"
          className={`flex items-center gap-2 text-lg font-bold tracking-tight transition-colors ${
            isScrolled ? 'text-foreground' : 'text-white'
          }`}
        >
          <img
            src="/images/logos/digisec.png"
            alt="DIGISEC"
            className="size-8 rounded-full object-cover"
          />
          <span>
            Digi<span className="text-primary">sec</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Navigation principale">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={isScrolled ? '' : 'text-white hover:bg-white/10 hover:text-white'}
                >
                  {user.firstName}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className={isScrolled ? '' : 'text-white hover:bg-white/10 hover:text-white'}
                asChild
              >
                <Link to="/login">Connexion</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Adhérer</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Ouvrir le menu"
              className={isScrolled ? '' : 'text-white hover:bg-white/10 hover:text-white'}
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <img
                  src="/images/logos/digisec.png"
                  alt="DIGISEC"
                  className="size-7 rounded-full object-cover"
                />
                <span>
                  Digi<span className="text-primary">sec</span>
                </span>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4" aria-label="Navigation mobile">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-sm font-medium ${
                      isActive ? 'bg-accent text-primary' : 'hover:bg-accent'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="my-2 border-t" />
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false)
                    handleLogout()
                  }}
                  className="rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-accent"
                >
                  Déconnexion
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                  >
                    Adhérer
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
