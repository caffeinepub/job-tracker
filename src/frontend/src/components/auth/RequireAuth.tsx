import { ReactNode } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '../ui/button';
import { LogIn } from 'lucide-react';

interface RequireAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function RequireAuth({ children, fallback }: RequireAuthProps) {
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <LogIn className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Sign in required</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            Please sign in to access this feature and track your job applications.
          </p>
          <Button onClick={login}>
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
        </div>
      )
    );
  }

  return <>{children}</>;
}
