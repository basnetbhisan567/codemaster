import React, { lazy, Suspense, useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { KioskLockdown } from "./components/lockdown/KioskLockdown";
import { SessionTracker } from "./components/lockdown/SessionTracker";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { Footer } from "./components/layout/Footer";
import { NotificationBell } from "./components/notifications/NotificationBell";
import { DailyReminder } from "./components/notifications/DailyReminder";
import { useNotificationStore } from "./stores/notificationStore";
import { useLockdownStore } from "./stores/lockdownStore";
import { Toaster } from "sonner";

const Community = lazy(() => import("./pages/Community"));
const Landing = lazy(() => import("./pages/Landing"));
const Learning = lazy(() => import("./pages/Learning"));
const Projects = lazy(() => import("./pages/Projects"));
const Problems = lazy(() => import("./pages/Problems"));
const Playground = lazy(() => import("./pages/Playground"));
const Assignments = lazy(() => import("./pages/Assignments"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const Jobs = lazy(() => import("./pages/Jobs"));
const JobDetail = lazy(() => import("./pages/JobDetail"));
const TechNews = lazy(() => import("./pages/TechNews"));
const AITools = lazy(() => import("./pages/AITools"));
const Music = lazy(() => import("./pages/Music"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Admin = lazy(() => import("./pages/Admin"));
const Auth = lazy(() => import("./pages/Auth"));
const LockScreen = lazy(() => import("./pages/LockScreen"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Plans = lazy(() => import("./pages/Plans"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCancel = lazy(() => import("./pages/PaymentCancel"));

const pageVariants = {
  initial: (direction: number) => ({ opacity: 0, x: direction > 0 ? 30 : -30, scale: 0.97, filter: "blur(4px)" }),
  animate: { opacity: 1, x: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
  exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -30 : 30, scale: 0.97, filter: "blur(4px)", transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } }),
};

const modalVariants = {
  initial: { opacity: 0, y: 50, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -30, scale: 0.95, transition: { duration: 0.2 } },
};

function useNavigationDirection() {
  const location = useLocation();
  const [prevPath, setPrevPath] = useState(location.pathname);
  const [direction, setDirection] = useState(0);
  useEffect(() => {
    if (prevPath !== location.pathname) {
      const prevDepth = prevPath.split("/").filter(Boolean).length;
      const currentDepth = location.pathname.split("/").filter(Boolean).length;
      setDirection(currentDepth >= prevDepth ? 1 : -1);
      setPrevPath(location.pathname);
    }
  }, [location.pathname, prevPath]);
  return direction;
}

function PageWrapper({ children, variants, custom = 0 }: { children: React.ReactNode; variants: any; custom?: number }) {
  return (
    <motion.div variants={variants} initial="initial" animate="animate" exit="exit" custom={custom} className="w-full">
      {children}
    </motion.div>
  );
}

function PageLoader() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center h-96">
      <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ rotate: { duration: 1, repeat: Infinity, ease: "linear" }, scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } }}
        className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
    </motion.div>
  );
}

function AuthGuard() {
  const location = useLocation();
  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('user');
  const isAuthenticated = !!token && !!userStr;
  const publicPaths = ['/login', '/register', '/plans'];
  const isPublicPath = publicPaths.includes(location.pathname);

  if (!isAuthenticated && !isPublicPath) {
    return <Navigate to="/login" replace />;
  }

  if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function DashboardLayout() {
  const location = useLocation();
  const navigationDirection = useNavigationDirection();

  return (
    <div className="relative flex min-h-screen transition-all duration-500">
      <motion.div initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
        <Sidebar />
      </motion.div>

      <div className="flex-1 flex flex-col">
        <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
          <Header>
            <NotificationBell />
          </Header>
        </motion.div>

        <main className="flex-1 container mx-auto px-4 py-6 max-w-6xl">
          <Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait" custom={navigationDirection} initial={false}>
              <Routes location={location}>
                <Route path="/" element={<PageWrapper variants={pageVariants} custom={navigationDirection}><Landing /></PageWrapper>} />
                <Route path="/learning" element={<PageWrapper variants={pageVariants} custom={navigationDirection}><Learning /></PageWrapper>} />
                <Route path="/projects" element={<PageWrapper variants={pageVariants} custom={navigationDirection}><Projects /></PageWrapper>} />
                <Route path="/problems" element={<PageWrapper variants={pageVariants} custom={navigationDirection}><Problems /></PageWrapper>} />
                <Route path="/playground" element={<PageWrapper variants={pageVariants} custom={navigationDirection}><Playground /></PageWrapper>} />
                <Route path="/assignments" element={<PageWrapper variants={pageVariants} custom={navigationDirection}><Assignments /></PageWrapper>} />
                <Route path="/roadmap" element={<PageWrapper variants={pageVariants} custom={navigationDirection}><Roadmap /></PageWrapper>} />
                <Route path="/community" element={<PageWrapper variants={pageVariants} custom={navigationDirection}><Community /></PageWrapper>} />
                <Route path="/jobs" element={<PageWrapper variants={pageVariants} custom={navigationDirection}><Jobs /></PageWrapper>} />
                <Route path="/jobs/:id" element={<PageWrapper variants={pageVariants} custom={navigationDirection}><JobDetail /></PageWrapper>} />
                <Route path="/tech-news" element={<PageWrapper variants={pageVariants} custom={navigationDirection}><TechNews /></PageWrapper>} />
                <Route path="/ai-tools" element={<PageWrapper variants={pageVariants} custom={navigationDirection}><AITools /></PageWrapper>} />
                <Route path="/music" element={<PageWrapper variants={pageVariants} custom={navigationDirection}><Music /></PageWrapper>} />
                <Route path="/profile" element={<PageWrapper variants={pageVariants} custom={navigationDirection}><Profile /></PageWrapper>} />
                <Route path="/settings" element={<PageWrapper variants={pageVariants} custom={navigationDirection}><Settings /></PageWrapper>} />
                <Route path="/admin" element={<PageWrapper variants={pageVariants} custom={navigationDirection}><Admin /></PageWrapper>} />
                <Route path="/lockscreen" element={<PageWrapper variants={pageVariants} custom={navigationDirection}><LockScreen /></PageWrapper>} />
                <Route path="*" element={<PageWrapper variants={pageVariants} custom={navigationDirection}><NotFound /></PageWrapper>} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </main>

        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
          <Footer />
        </motion.div>
      </div>
    </div>
  );
}

function FocusModeGuard() {
  const { focusActive } = useLockdownStore();
  const location = useLocation();
  const forbidden = ["/settings", "/admin", "/jobs", "/tech-news", "/ai-tools", "/music", "/community", "/profile"];
  if (focusActive && forbidden.some(path => location.pathname.startsWith(path))) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

function App() {
  const location = useLocation();
  const [isAppReady, setIsAppReady] = useState(false);
  const { addNotification } = useNotificationStore();
  const { checkScheduledFocus, startFocus, endFocus, focusActive, isLocked, canExit } = useLockdownStore();

  useEffect(() => { const timer = setTimeout(() => setIsAppReady(true), 100); return () => clearTimeout(timer); }, []);

  useEffect(() => {
    const preventExit = (e: KeyboardEvent) => {
      if ((focusActive || isLocked) && !canExit) {
        if (e.key === "Escape" || (e.altKey && e.key === "F4") || ((e.ctrlKey || e.metaKey) && e.key === "w") || e.key === "F5") {
          e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        }
      }
    };
    window.addEventListener("keydown", preventExit, true);
    const preventUnload = (e: BeforeUnloadEvent) => { if ((focusActive || isLocked) && !canExit) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener("beforeunload", preventUnload);
    return () => { window.removeEventListener("keydown", preventExit, true); window.removeEventListener("beforeunload", preventUnload); };
  }, [focusActive, isLocked, canExit]);

  useEffect(() => {
    const checkSchedule = () => { const shouldFocus = checkScheduledFocus(); if (shouldFocus && !focusActive) startFocus(); else if (!shouldFocus && focusActive && canExit) endFocus(); };
    checkSchedule();
    const interval = setInterval(checkSchedule, 60000);
    return () => clearInterval(interval);
  }, [checkScheduledFocus, startFocus, endFocus, focusActive, canExit]);

  useEffect(() => {
    const lastDate = localStorage.getItem("lastSessionDate");
    const today = new Date().toDateString();
    if (lastDate !== today) { useLockdownStore.getState().resetDailyProgress(); localStorage.setItem("lastSessionDate", today); }
  }, []);

  useEffect(() => {
    const hasVisited = localStorage.getItem("has_visited");
    if (!hasVisited && isAppReady) {
      setTimeout(() => { addNotification({ type: "system", title: "Welcome to CodeMaster! 🚀", message: "Start your coding journey today!", actionUrl: "/settings", actionLabel: "Set Goal" }); localStorage.setItem("has_visited", "true"); }, 2000);
    }
  }, [isAppReady, addNotification]);

  if (!isAppReady) return <PageLoader />;

  return (
    <>
      <SessionTracker />
      <KioskLockdown />
      <DailyReminder />
      <Toaster position="bottom-right" theme="dark" richColors />

      <Routes>
        {/* Public routes — NO sidebar/header/footer */}
        <Route path="/login" element={<PageWrapper variants={modalVariants}><Auth /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper variants={modalVariants}><Auth /></PageWrapper>} />

        {/* Plans & Payment — accessible without full dashboard layout but with auth */}
        <Route path="/plans" element={<PageWrapper variants={pageVariants}><Plans /></PageWrapper>} />
        <Route path="/payment/success" element={<PageWrapper variants={pageVariants}><PaymentSuccess /></PageWrapper>} />
        <Route path="/payment/cancel" element={<PageWrapper variants={pageVariants}><PaymentCancel /></PageWrapper>} />

        {/* Protected routes — WITH sidebar/header/footer */}
        <Route element={<AuthGuard />}>
          <Route element={<FocusModeGuard />}>
            <Route path="/*" element={<DashboardLayout />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;