import Link from "next/link";
import { LayoutDashboard, FileText, Users, KanbanSquare, Wallet, Package, Images } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orcamentos", label: "Orçamentos", icon: FileText },
  { href: "/admin/crm", label: "CRM", icon: Users },
  { href: "/admin/producao", label: "Produção", icon: KanbanSquare },
  { href: "/admin/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/portfolio", label: "Portfólio", icon: Images },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-premium/10 bg-leather p-4 md:flex print:hidden">
        <Link href="/admin" className="mb-8 px-2 font-display text-xl font-bold text-champagne">
          OWL PRINT
        </Link>
        <nav className="space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-cream/80 transition-colors hover:bg-premium hover:text-champagne"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <a
          href="/api/auth/logout"
          className="mt-auto px-3 py-2 text-xs text-cream/50 hover:text-cream"
        >
          Sair
        </a>
      </aside>
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
