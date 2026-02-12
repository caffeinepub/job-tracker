import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import AppShell from './components/layout/AppShell';
import JobBoardPage from './pages/JobBoardPage';
import MyTrackerPage from './pages/MyTrackerPage';
import DashboardPage from './pages/DashboardPage';
import AdminFirmsPage from './pages/AdminFirmsPage';
import AdminJobsPage from './pages/AdminJobsPage';
import BulkImportPage from './pages/BulkImportPage';
import { Toaster } from './components/ui/sonner';

const rootRoute = createRootRoute({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: JobBoardPage,
});

const jobBoardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/jobs',
  component: JobBoardPage,
});

const myTrackerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-tracker',
  component: MyTrackerPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});

const adminFirmsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/firms',
  component: AdminFirmsPage,
});

const adminJobsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/jobs',
  component: AdminJobsPage,
});

const bulkImportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/bulk-import',
  component: BulkImportPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  jobBoardRoute,
  myTrackerRoute,
  dashboardRoute,
  adminFirmsRoute,
  adminJobsRoute,
  bulkImportRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
