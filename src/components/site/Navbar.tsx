"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Image from "next/image";

const LINKS = [
  { href: "/", label: "Início" },
  { href: "/produtos", label: "Produtos" },
  { href: "/como-funciona", label: "Como Funciona" },
  { href: "/portfolio", label: "Portfólio" },
  { href: "/sobre", label: "Sobre Nós" },
  { href: "/contato", label: "Contato" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-champagne/20 bg-leather/95 backdrop-blur">
      <nav className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center">
         <Image
           src="/owllogo.png" 
           alt="OWL PRINT"
           width={220}
           height={70}
           priority
         />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-sm text-cream/80 transition-colors hover:text-champagne"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link href="/contato" className="hidden btn-gold !py-2 !px-4 md:inline-flex">
          Solicitar Orçamento
        </Link>

        <button
          className="text-cream md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-champagne/20 bg-leather md:hidden">
          <ul className="container flex flex-col gap-1 py-4">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-cream/80 hover:text-champagne"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <Link href="/contato" className="btn-gold mt-2 !py-2">
              Solicitar Orçamento
            </Link>
          </ul>
        </div>
      )}
    </header>
  );
}
