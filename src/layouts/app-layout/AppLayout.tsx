import { motion } from "framer-motion";
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { AppFooter } from "@/components/common/AppFooter";

import { MobileDock } from "./MobileDock";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="grid h-dvh grid-cols-1 grid-rows-[minmax(0,1fr)_28px] overflow-hidden bg-background lg:grid-cols-[auto_minmax(0,1fr)]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="col-start-1 row-start-1 min-h-0 min-w-0 overflow-y-auto lg:col-start-2">
        <Topbar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-[1540px] px-4 pb-32 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <MobileDock />
      <AppFooter sidebarCollapsed={sidebarCollapsed} />
    </div>
  );
}
