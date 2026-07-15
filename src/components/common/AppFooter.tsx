import { motion } from "framer-motion";

const instagramUrl = "https://www.instagram.com/fox.solucoes.art/";

function InstagramLink() {
  return (
    <a
      href={instagramUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-foreground/80 transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Abrir perfil da FOX Solucoes no Instagram"
    >
      @fox.solucoes.art
    </a>
  );
}

export function AppFooter({
  sidebarCollapsed,
}: {
  sidebarCollapsed?: boolean;
}) {
  const hasSidebar = typeof sidebarCollapsed === "boolean";

  return (
    <footer className="relative z-50 col-span-full row-start-2 h-7 border-t border-border/50 bg-background text-[11px] font-normal text-muted-foreground">
      {hasSidebar ? (
        <div
          className="pointer-events-none absolute inset-0 hidden lg:flex"
          aria-hidden
        >
          <motion.div
            animate={{ width: sidebarCollapsed ? 88 : 288 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="h-full shrink-0 border-r border-border/80 bg-card/95"
          />
          <div className="h-full min-w-0 flex-1 bg-background/95" />
        </div>
      ) : null}

      <div className="absolute inset-0 flex items-center justify-center px-3 text-center backdrop-blur-md">
        <p className="hidden whitespace-nowrap sm:block">
          Versão {__APP_VERSION__} <span aria-hidden>•</span> © Todos os
          direitos reservados à <InstagramLink />
        </p>
        <p className="whitespace-nowrap sm:hidden">
          {__APP_VERSION__} <span aria-hidden>•</span> <InstagramLink />
        </p>
      </div>
    </footer>
  );
}
