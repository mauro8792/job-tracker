"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Kanban,
  CheckSquare,
  BarChart3,
  FileText,
  Globe,
  Rocket,
  X,
  BookOpen,
  Sparkles,
  ScrollText,
  LogOut,
  HelpCircle,
  GraduationCap,
  PieChart,
  Users,
  Newspaper,
  CalendarPlus,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/postulaciones", label: "Postulaciones", icon: Kanban },
  { href: "/calendar-import", label: "Calendario", icon: CalendarPlus },
  { href: "/platforms", label: "Plataformas", icon: Globe },
  { href: "/checklist", label: "Checklist diaria", icon: CheckSquare },
  { href: "/progress", label: "Progreso", icon: BarChart3 },
  { href: "/analytics", label: "Progreso", icon: PieChart },
  { href: "/cv", label: "Mi CV", icon: ScrollText },
  { href: "/questions", label: "Preguntas", icon: HelpCircle },
  { href: "/learning", label: "Learning Path", icon: GraduationCap },
  { href: "/community", label: "Comunidad", icon: Users },
  { href: "/feed", label: "Feed & bolsa", icon: Newspaper },
  { href: "/resources", label: "Recursos", icon: BookOpen },
  { href: "/pitch", label: "Presentación", icon: Sparkles },
  { href: "/templates", label: "Templates", icon: FileText },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 z-40 flex h-full w-64 flex-col border-r border-border bg-surface transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-text">DevJobTracker</span>
          </Link>
          <button onClick={onClose} className="md:hidden text-text-muted hover:text-text">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "text-text-muted hover:bg-surface-light hover:text-text"
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border px-3 py-3 space-y-2">
          {user && (
            <Link
              href="/profile"
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-surface-light ${
                pathname === "/profile" ? "bg-primary/15" : ""
              }`}
            >
              {user.avatar ? (
                <img src={user.avatar} alt="" className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text">{user.firstName} {user.lastName}</p>
                <p className="truncate text-[11px] text-text-muted">
                  {user.plan === "trial"
                    ? "Plan Trial"
                    : user.plan === "pro"
                      ? "Plan Pro"
                      : "Plan Free"}
                  {user.hasActiveBonusAccess ? " · bonus" : ""}
                </p>
              </div>
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Salir
          </button>
          <p className="text-[10px] text-text-muted text-center">
            DevJobTracker v0.1
          </p>
        </div>
      </aside>
    </>
  );
}
