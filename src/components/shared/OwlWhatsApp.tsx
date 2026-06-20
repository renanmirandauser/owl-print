"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Botão flutuante assinatura: NÃO é o botão padrão do WhatsApp.
 * Mascote da coruja segurando um smartphone, balão de mensagem e
 * rastreamento de clique em GA4 + Meta Pixel.
 */
export function OwlWhatsApp() {
  const [open, setOpen] = useState(true);
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const text = encodeURIComponent(
    "Olá! Vim pelo site da OWL PRINT e gostaria de um orçamento."
  );
  const href = `https://wa.me/${phone}?text=${text}`;

  function handleClick() {
    // GA4
    window.gtag?.("event", "whatsapp_click", { location: "floating_owl" });
    // Meta Pixel
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
            className="relative max-w-[220px] rounded-2xl bg-cream px-4 py-3 text-sm text-leather shadow-premium"
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
        aria-label="Falar no WhatsApp com a OWL PRINT"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="grid h-16 w-16 place-items-center rounded-full bg-leather shadow-premium ring-2 ring-champagne animate-float"
      >
        {/* Placeholder do mascote — troque pela arte da coruja em /public/owl-whatsapp.png */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/public/owllogo.png"
          alt="Coruja OWL PRINT"
          className="h-12 w-12 object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </motion.a>
    </div>
  );
}
