"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Botão flutuante assinatura: NÃO é o botão padrão do WhatsApp.
 * Mascote da coruja (logo da marca), balão de mensagem e
 * rastreamento de clique em GA4 + Meta Pixel.
 */
export function OwlWhatsApp() {
  const [open, setOpen] = useState(true);
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511953098258";
  const text = encodeURIComponent(
    "Olá! Vim pelo site da OWL PRINT e gostaria de um orçamento."
  );
  const href = `https://wa.me/${phone}?text=${text}`;

  function handleClick() {
    window.gtag?.("event", "whatsapp_click", { location: "floating_owl" });
    window.fbq?.("track", "Contact", { method: "whatsapp" });
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="relative max-w-[220px] rounded-2xl border border-leather/10 bg-white px-4 py-3 text-sm text-ink shadow-premium"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar mensagem"
              className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-leather text-cream"
            >
              ×
            </button>
            Precisa de um orçamento? Fale comigo no WhatsApp.
          </motion.div>
        )}
      </AnimatePresence>

      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        aria-label="Falar com a OWL PRINT no WhatsApp"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="grid h-16 w-16 place-items-center rounded-full border border-leather/10 bg-white shadow-premium ring-2 ring-champagne animate-float"
      >
        <Image
          src="/owl-icon.png"
          alt="OWL PRINT"
          width={48}
          height={48}
          className="h-11 w-auto object-contain"
        />
      </motion.a>
    </div>
  );
}
