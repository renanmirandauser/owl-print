"use client";

import { useEffect, useState } from "react";

/**
 * Abertura animada: a coruja se revela de baixo pra cima e o nome surge.
 * Fica por cima da tela por ~2s e some sozinha. Só aparece uma vez por
 * abertura do app (não a cada navegação).
 */
export function SplashOwl() {
  const [fase, setFase] = useState<"entrando" | "saindo" | "fim">("entrando");

  useEffect(() => {
    const t1 = setTimeout(() => setFase("saindo"), 1900);
    const t2 = setTimeout(() => setFase("fim"), 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (fase === "fim") return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cream transition-opacity duration-500"
      style={{ opacity: fase === "saindo" ? 0 : 1 }}
    >
      <div className="owl-clip">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/owl-icon.png" alt="OWL PRINT" className="owl-img" />
      </div>
      <p className="owl-nome font-display">OWL PRINT</p>

      <style jsx>{`
        .owl-clip {
          width: 46vw;
          max-width: 200px;
          overflow: hidden;
          animation: reveal 1.4s cubic-bezier(0.5, 0, 0.2, 1) both;
        }
        .owl-img {
          width: 100%;
          height: auto;
          display: block;
        }
        .owl-nome {
          margin-top: 20px;
          font-weight: 700;
          letter-spacing: 0.25em;
          font-size: 18px;
          color: #15395b;
          opacity: 0;
          animation: nomeIn 0.6s ease-out 1.2s both;
        }
        @keyframes reveal {
          0% {
            clip-path: inset(100% 0 0 0);
            opacity: 0;
          }
          30% {
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
            transform: translateY(6px);
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
