import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border/80 bg-card/70 px-4 py-4 shadow-panel sm:px-5">
      <div className="enterprise-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="h-1 w-14 rounded-full bg-gradient-to-r from-brand-orange to-brand-red" />
          <h1 className="text-2xl font-black text-foreground sm:text-3xl">
            {title}
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
