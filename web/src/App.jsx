import { useCallback, useEffect } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import Landing from './pages/Landing.jsx'
import Order from './pages/Order.jsx'
import Catalog from './pages/Catalog.jsx'
import Course from './pages/Course.jsx'
import Lesson from './pages/Lesson.jsx'
import Login from './pages/Login.jsx'
import Account from './pages/Account.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import Overview from './pages/admin/Overview.jsx'
import Orders from './pages/admin/Orders.jsx'
import Invoices from './pages/admin/Invoices.jsx'
import Payments from './pages/admin/Payments.jsx'
import Members from './pages/admin/Members.jsx'
import Support from './pages/admin/Support.jsx'
import DemoSwitch from './components/DemoSwitch.jsx'
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

  const isAdmin = location.pathname.startsWith('/admin')

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return // the admin keeps its own scroll
    const target = location.state?.scrollTo
    if (location.pathname === '/' && target) {
      requestAnimationFrame(() => scrollToId(target))
    } else {
      window.scrollTo(0, 0)
    }
  }, [location])

  return (
    <>
      {!isAdmin && <Nav onNav={onNav} />}
      <Routes>
        <Route path="/" element={<Landing onNav={onNav} />} />
        <Route path="/order" element={<Order />} />
        <Route path="/courses" element={<Catalog />} />
        <Route path="/courses/:slug" element={<Course />} />
        <Route path="/courses/:slug/:nr" element={<Lesson />} />
        <Route path="/login" element={<Login />} />
        <Route path="/account" element={<Account />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Overview />} />
          <Route path="orders" element={<Orders />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="payments" element={<Payments />} />
          <Route path="members" element={<Members />} />
          <Route path="support" element={<Support />} />
        </Route>
        <Route
          path="*"
          element={<ComingSoon label="404" title="This page does not exist." text="The link may be old. The courses are still where they were." />}
        />
      </Routes>
      <DemoSwitch />
    </>
  )
}
