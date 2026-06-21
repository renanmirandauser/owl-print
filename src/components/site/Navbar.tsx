"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "/", label: "Início" },
  { href: "/produtos", label: "Produtos" },
  { href: "/loja", label: "Loja" },
  { href: "/como-funciona", label: "Como Funciona" },
  { href: "/portfolio", label: "Portfólio" },
  { href: "/sobre", label: "Sobre Nós" },
  { href: "/contato", label: "Contato" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-leather/10 bg-cream/90 backdrop-blur supports-[backdrop-filter]:bg-cream/80">
      <nav className="container flex h-16 items-center justify-between md:h-20">
        <Link href="/" className="flex items-center" aria-label="OWL PRINT — Início">
          <Image
            src="/owllogo.png"
            priority
            className="h-9 w-auto md:h-11"
          />
        </Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-sm font-medium text-ink/70 transition-colors hover:text-champagne"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link href="/contato" className="hidden btn-gold !py-2 !px-4 text-sm lg:inline-flex">
          Solicitar Orçamento
        </Link>

        <button
          className="text-ink lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-leather/10 bg-cream lg:hidden">
          <ul className="container flex flex-col gap-1 py-4">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-2 py-2.5 text-ink/80 transition-colors hover:bg-leather/5 hover:text-champagne"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <Link
              href="/contato"
              onClick={() => setOpen(false)}
              className="btn-gold mt-2 !py-2.5"
            >
              Solicitar Orçamento
            </Link>
          </ul>
        </div>
      )}
    </header>
  );
}
