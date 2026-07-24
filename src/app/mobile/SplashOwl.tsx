"use client";

import { useEffect, useState } from "react";

/**
 * Abertura animada: a coruja se revela de baixo pra cima sobre o azul da marca,
 * emendando com a splash nativa do app (mesmo fundo), e some com um fade.
 *
 * Para ajustar o ritmo, mexa só nestes três números (em milissegundos):
 */
const DURACAO_REVELACAO = 2600;     // quanto tempo a coruja leva pra se revelar
const ESPERA_ANTES_DE_SAIR = 3400;  // quando começa o fade de saída
const FADE = 800;                   // duração do fade

export function SplashOwl() {
  const [fase, setFase] = useState<"entrando" | "saindo" | "fim">("entrando");

  useEffect(() => {
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
