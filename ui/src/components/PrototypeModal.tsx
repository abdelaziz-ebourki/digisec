import { useEffect, useState } from 'react'
import { FlaskConical, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD, resetMockDb } from '@/mocks/db'
import {
  PROTOTYPE_MODAL_HIDE_KEY,
  SHOW_PROTOTYPE_MODAL_EVENT,
  isMockApi,
} from '@/mocks/env'

/**
 * Startup disclosure shown in prototype mode (VITE_MOCK_API=true) only.
 * Real-backend builds never render it.
 */
export function PrototypeModal() {
  const [open, setOpen] = useState(
    () => isMockApi() && localStorage.getItem(PROTOTYPE_MODAL_HIDE_KEY) !== '1',
  )
  const [hideNextTime, setHideNextTime] = useState(false)

  useEffect(() => {
    const reopen = () => setOpen(true)
    window.addEventListener(SHOW_PROTOTYPE_MODAL_EVENT, reopen)
    return () => window.removeEventListener(SHOW_PROTOTYPE_MODAL_EVENT, reopen)
  }, [])

  if (!isMockApi()) return null

  const handleOpenChange = (next: boolean) => {
    if (!next && hideNextTime) {
      localStorage.setItem(PROTOTYPE_MODAL_HIDE_KEY, '1')
    }
    setOpen(next)
  }

  const handleReset = () => {
    resetMockDb()
    localStorage.removeItem('digisec.token')
    window.location.reload()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="size-5 text-amber-400" aria-hidden />
            Bienvenue sur la démo DIGISEC
          </DialogTitle>
          <DialogDescription>Ce que vous visitez est un prototype.</DialogDescription>
        </DialogHeader>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Le backend Spring Boot est entièrement développé et testé (67 tests API, 96 tests UI,
            32 tests E2E au vert), mais il n’est pas encore hébergé.
          </li>
          <li>
            En attendant, vos actions tournent sur une simulation locale : inscrivez-vous, créez
            des sujets et explorez — les données restent dans votre navigateur.
          </li>
          <li>
            Compte admin de démonstration : <code className="text-foreground">{DEMO_ADMIN_EMAIL}</code>{' '}
            / <code className="text-foreground">{DEMO_ADMIN_PASSWORD}</code>
          </li>
        </ul>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hide-prototype-modal"
            checked={hideNextTime}
            onCheckedChange={(checked) => setHideNextTime(checked === true)}
          />
          <Label htmlFor="hide-prototype-modal" className="text-sm font-normal">
            Ne plus afficher ce message
          </Label>
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="size-4" aria-hidden />
            Réinitialiser la démo
          </Button>
          <Button onClick={() => handleOpenChange(false)}>Explorer la démo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
