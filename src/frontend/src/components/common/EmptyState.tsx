import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  illustration?: boolean;
}

export default function EmptyState({ title, description, action, illustration = false }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {illustration && (
        <img
          src="/assets/generated/empty-tracker-illustration.dim_1200x800.png"
          alt="Empty state"
          className="w-full max-w-md mb-8 opacity-80"
        />
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">{description}</p>
      {action}
    </div>
  );
}
