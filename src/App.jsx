import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Courses from './pages/Courses.jsx';
import Course from './pages/Course.jsx';
import Lesson from './pages/Lesson.jsx';
import Search from './pages/Search.jsx';
import Pricing from './pages/Pricing.jsx';
import Order from './pages/Order.jsx';
import OrderStatus from './pages/OrderStatus.jsx';
import { Login, Signup, ForgotPassword, ResetPassword } from './pages/Auth.jsx';
import Account from './pages/Account.jsx';
import Support from './pages/Support.jsx';
import { NewsletterConfirm, Unsubscribe } from './pages/Newsletter.jsx';
import Flows from './pages/Flows.jsx';
import NotFound from './pages/NotFound.jsx';
import { useAuth } from './lib/auth.jsx';

function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login?next=/account" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/:slug" element={<Course />} />
        <Route path="courses/:slug/:lesson" element={<Lesson />} />
        <Route path="search" element={<Search />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="order" element={<Order />} />
        <Route path="order/:id" element={<OrderStatus />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="account/*" element={<RequireAuth><Account /></RequireAuth>} />
        <Route path="support" element={<Support />} />
        <Route path="newsletter/confirm" element={<NewsletterConfirm />} />
        <Route path="newsletter/unsubscribe" element={<Unsubscribe />} />
        <Route path="flows" element={<Flows />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
