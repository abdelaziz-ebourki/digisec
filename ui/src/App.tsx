import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { AdminRoute, ProtectedRoute } from '@/components/layout/RouteGuards'

const Home = lazy(() => import('@/pages/Home'))
const About = lazy(() => import('@/pages/About'))
const Activities = lazy(() => import('@/pages/Activities'))
const Admin = lazy(() => import('@/pages/Admin'))
const Forum = lazy(() => import('@/pages/Forum'))
const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))
const Verify = lazy(() => import('@/pages/Verify'))
const NotFound = lazy(() => import('@/pages/NotFound'))

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center" role="status">
          <LoaderCircle className="size-8 animate-spin" aria-hidden />
        </div>
      }
    >
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
          <Route element={<AdminRoute />}>
            <Route path="admin" element={<Admin />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
      </Routes>
    </Suspense>
  )
}
