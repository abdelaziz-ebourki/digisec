import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { AdminRoute, ProtectedRoute } from '@/components/layout/RouteGuards'
import Home from '@/pages/Home'
import Accueil1 from '@/pages/Accueil1'
import Accueil2 from '@/pages/Accueil2'
import About from '@/pages/About'
import Activities from '@/pages/Activities'
import Forum from '@/pages/Forum'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Verify from '@/pages/Verify'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="accueil1" element={<Accueil1 />} />
        <Route path="acceuil1" element={<Accueil1 />} />
        <Route path="accueil2" element={<Accueil2 />} />
        <Route path="acceuil2" element={<Accueil2 />} />
        <Route path="digisec" element={<About />} />
        <Route path="activities" element={<Activities />} />
        <Route path="forum" element={<Forum />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="verify" element={<Verify />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminRoute />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
