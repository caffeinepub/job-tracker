import { ReactNode } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { LayoutDashboard, Briefcase, BookmarkCheck, Building2, FileText, Upload } from 'lucide-react';
import LoginButton from '../auth/LoginButton';
import ProfileSetupDialog from '../auth/ProfileSetupDialog';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserRole } from '../../hooks/useQueries';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: userRole } = useGetCallerUserRole();
  const isAdmin = userRole === 'admin';

  const navItems = [
    { path: '/jobs', label: 'Job Board', icon: Briefcase, public: true },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, public: true },
    { path: '/my-tracker', label: 'My Tracker', icon: BookmarkCheck, public: false },
  ];

  const adminItems = [
    { path: '/admin/firms', label: 'Firms', icon: Building2 },
    { path: '/admin/jobs', label: 'Jobs', icon: FileText },
    { path: '/admin/bulk-import', label: 'Bulk Import', icon: Upload },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/assets/generated/job-tracker-logo.dim_512x512.png" 
                alt="Job Tracker" 
                className="h-10 w-10"
              />
              <span className="text-xl font-semibold tracking-tight">Job Tracker</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                if (!item.public && !isAuthenticated) return null;
                const Icon = item.icon;
                const isActive = currentPath === item.path || (item.path === '/jobs' && currentPath === '/');
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              {isAdmin && (
                <>
                  <div className="mx-2 h-6 w-px bg-border" />
                  {adminItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPath === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive
                            ? 'bg-accent text-accent-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </>
              )}
            </nav>
          </div>
          <LoginButton />
        </div>
      </header>
      <main className="container py-8">
        {children}
      </main>
      <footer className="border-t border-border/40 mt-16">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} · Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
      <ProfileSetupDialog />
    </div>
  );
}
