import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { AdminRoute, ProtectedRoute } from '@/components/layout/RouteGuards'
import Home from '@/pages/Home'
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
