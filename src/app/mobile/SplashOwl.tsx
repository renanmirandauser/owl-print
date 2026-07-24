"use client";

import { useEffect, useState } from "react";

/**
 * Abertura animada, emendada com a splash NATIVA do app.
 *
 * Como funciona sem piscada e sem tela preta:
 * - A splash nativa (azul) fica na tela e NÃO some sozinha
 *   (launchAutoHide: false no capacitor.config.json).
 * - Este componente aparece POR CIMA, no mesmo azul, e só então
 *   manda a nativa sumir. Como o fundo é idêntico, a troca é invisível.
 * - No fim, faz fade e desaparece, revelando a tela de orçamento.
 *
 * Ritmo — mexa só nestes números (em milissegundos):
 */
const DURACAO_REVELACAO = 2400;     // a coruja se revelando de baixo pra cima
const ESPERA_ANTES_DE_SAIR = 3200;  // tempo total antes do fade
const FADE = 700;                   // duração do fade de saída

export function SplashOwl() {
  const [fase, setFase] = useState<"entrando" | "saindo" | "fim">("entrando");

  useEffect(() => {
    // Assim que a animação React está na tela, esconde a splash nativa.
    // Import dinâmico: se o plugin não existir (ex.: rodando no navegador),
    // simplesmente ignora, sem quebrar.
    (async () => {
      try {
        const mod = await import("@capacitor/splash-screen");
        await mod.SplashScreen.hide();
      } catch {
        /* fora do app (navegador) — não há splash nativa pra esconder */
      }
    })();

    const t1 = setTimeout(() => setFase("saindo"), ESPERA_ANTES_DE_SAIR);
    const t2 = setTimeout(() => setFase("fim"), ESPERA_ANTES_DE_SAIR + FADE);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (fase === "fim") return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{
        background: "#15395b",
        opacity: fase === "saindo" ? 0 : 1,
        transition: `opacity ${FADE}ms ease`,
      }}
    >
      <div className="owl-clip">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/owl-icon.png" alt="OWL PRINT" className="owl-img" />
      </div>
      <p className="owl-nome font-display">OWL PRINT</p>

      <style jsx>{`
        .owl-clip {
          width: 52vw;
          max-width: 230px;
          overflow: hidden;
          animation: reveal ${DURACAO_REVELACAO}ms cubic-bezier(0.5, 0, 0.2, 1) both;
        }
        .owl-img {
          width: 100%;
          height: auto;
          display: block;
        }
        .owl-nome {
          margin-top: 22px;
          font-weight: 700;
          letter-spacing: 0.28em;
          font-size: 19px;
          color: #f7f5ef;
          opacity: 0;
          animation: nomeIn 0.7s ease-out ${DURACAO_REVELACAO - 300}ms both;
        }
        @keyframes reveal {
          0% {
            clip-path: inset(100% 0 0 0);
            opacity: 0;
          }
          25% {
            opacity: 1;
          }
          100% {
            clip-path: inset(0 0 0 0);
            opacity: 1;
          }
        }
        @keyframes nomeIn {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .owl-clip,
          .owl-nome {
            animation: none;
            opacity: 1;
            clip-path: none;
          }
        }
      `}</style>
    </div>
  );
}
