import { useCallback, useEffect } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import Landing from './pages/Landing.jsx'
import Order from './pages/Order.jsx'
import Course from './pages/Course.jsx'
import Lesson from './pages/Lesson.jsx'
import Login from './pages/Login.jsx'
import Account from './pages/Account.jsx'
import Admin from './pages/Admin.jsx'
import ComingSoon from './pages/ComingSoon.jsx'

function scrollToId(id) {
  if (id === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()

  // Section links work from every page: on the landing page they scroll,
  // elsewhere they first go back to the landing page and scroll after it has rendered.
  const onNav = useCallback(
    (id) => {
      if (location.pathname === '/') scrollToId(id)
      else navigate('/', { state: { scrollTo: id } })
    },
    [location.pathname, navigate],
  )

  useEffect(() => {
    const target = location.state?.scrollTo
    if (location.pathname === '/' && target) {
      requestAnimationFrame(() => scrollToId(target))
    } else {
      window.scrollTo(0, 0)
    }
  }, [location])

  return (
    <>
      <Nav onNav={onNav} />
      <Routes>
        <Route path="/" element={<Landing onNav={onNav} />} />
        <Route path="/order" element={<Order />} />
        <Route path="/courses/:slug" element={<Course />} />
        <Route path="/courses/:slug/:nr" element={<Lesson />} />
        <Route path="/login" element={<Login />} />
        <Route path="/account" element={<Account />} />
        <Route path="/admin" element={<Admin />} />
        <Route
          path="*"
          element={<ComingSoon label="404" title="This page does not exist." text="The link may be old. The courses are still where they were." />}
        />
      </Routes>
    </>
  )
}
