import type { PropsWithChildren } from "react";

import { AppLogo } from "@/components/common/AppLogo";
import { AppFooter } from "@/components/common/AppFooter";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <main className="dark grid h-dvh grid-cols-1 grid-rows-[minmax(0,1fr)_28px] overflow-hidden bg-brand-black text-white lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative col-start-1 row-start-1 hidden overflow-hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=85"
          alt="Palco de evento com iluminacao"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/52 to-brand-orange/40" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <AppLogo />
          <div className="max-w-xl space-y-4">
            <p className="text-sm font-semibold uppercase text-brand-amber">
              NAGY EVENTOS
            </p>
            <h1 className="text-5xl font-black leading-tight">
              Transformando eventos em experiencias.
            </h1>
            <p className="text-base text-white/78">
              Operacao, agenda, financeiro e estoque em uma plataforma premium
              para locacao de equipamentos.
            </p>
          </div>
        </div>
      </section>
      <section className="col-start-1 row-start-1 flex min-h-0 flex-col overflow-y-auto bg-background text-foreground lg:col-start-2">
        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8">
          {children}
        </div>
      </section>
      <AppFooter />
    </main>
  );
}
