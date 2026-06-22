"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  KanbanSquare,
  Wallet,
  Package,
  Images,
  Palette,
  Building2,
  Store,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

const GROUPS = [
  {
    label: "Operação",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/orcamentos", label: "Orçamentos", icon: FileText },
      { href: "/admin/crm", label: "CRM", icon: Users },
      { href: "/admin/producao", label: "Produção", icon: KanbanSquare },
      { href: "/admin/financeiro", label: "Financeiro", icon: Wallet },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { href: "/admin/produtos", label: "Produtos", icon: Package },
      { href: "/admin/portfolio", label: "Portfólio", icon: Images },
      { href: "/admin/catalogo", label: "Categorias & Cores", icon: Palette },
      { href: "/admin/parceiros", label: "Parceiros", icon: Building2 },
      { href: "/admin/loja", label: "Textos da Loja", icon: Store },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

/* Marca: só a coruja, grande, centralizada (sem texto) */
function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/admin"
      onClick={onNavigate}
      className="mb-6 flex items-center justify-center pt-2"
      aria-label="OWL PRINT — Admin"
    >
      <Image
        src="/owl-icon.png"
        alt="OWL PRINT"
        width={200}
        height={247}
        priority
        className="h-auto w-40"
      />
    </Link>
  );
}

function NavContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <Brand onNavigate={onNavigate} />

      <nav className="flex-1 space-y-6">
        {GROUPS.map((g) => (
          <div key={g.label}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-ink/40">
              {g.label}
            </p>
            <div className="space-y-1">
              {g.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onNavigate}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-champagne/15 font-semibold text-leather"
                        : "text-ink/70 hover:bg-leather/5 hover:text-leather"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? "text-champagne" : ""}`} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-6 space-y-1 border-t border-leather/10 pt-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink/60 transition-colors hover:bg-leather/5 hover:text-leather"
        >
          <ExternalLink className="h-4 w-4" /> Ver site
        </Link>
        <a
          href="/api/auth/logout"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink/60 transition-colors hover:bg-leather/5 hover:text-burgundy"
        >
          <LogOut className="h-4 w-4" /> Sair
        </a>
      </div>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream">
      {/* Barra superior (apenas mobile) */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-leather/10 bg-white px-4 lg:hidden print:hidden">
        <Link href="/admin" className="flex items-center" aria-label="OWL PRINT — Admin">
          <Image
            src="/owl-icon.png"
            alt="OWL PRINT"
            width={40}
            height={49}
            className="h-9 w-auto"
          />
        </Link>
        <button onClick={() => setOpen(true)} aria-label="Abrir menu" className="text-ink">
          <Menu />
        </button>
      </header>

      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-leather/10 bg-white p-4 lg:flex print:hidden">
          <NavContent pathname={pathname} />
        </aside>

        {/* Drawer (mobile) */}
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-ink/40"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[82%] flex-col overflow-y-auto border-r border-leather/10 bg-white p-4 shadow-premium">
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="absolute right-3 top-3 text-ink/60 hover:text-ink"
              >
                <X />
              </button>
              <NavContent pathname={pathname} onNavigate={() => setOpen(false)} />
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
