import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  title: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: "orange" | "red" | "neutral" | "green";
};

const toneClasses = {
  orange: {
    icon: "bg-primary/10 text-primary ring-primary/20",
    line: "from-brand-orange to-brand-amber",
  },
  red: {
    icon: "bg-secondary/10 text-secondary ring-secondary/20",
    line: "from-brand-red to-brand-orange",
  },
  neutral: {
    icon: "bg-muted text-muted-foreground ring-border",
    line: "from-muted-foreground/40 to-border",
  },
  green: {
    icon: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20",
    line: "from-emerald-500 to-brand-orange",
  },
};

export function MetricCard({
  title,
  value,
  helper,
  icon: Icon,
  tone = "orange",
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="group overflow-hidden p-5 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div
            className={cn(
              "h-1.5 w-16 rounded-full bg-gradient-to-r",
              toneClasses[tone].line,
            )}
          />
          <div className={cn("rounded-lg p-2 ring-1", toneClasses[tone].icon)}>
            <Icon className="h-5 w-5" aria-hidden />
          </div>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <p className="text-xs font-bold uppercase text-muted-foreground">
              {title}
            </p>
            <p className="truncate text-2xl font-black">{value}</p>
            <p className="min-h-8 text-xs leading-4 text-muted-foreground">
              {helper}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
