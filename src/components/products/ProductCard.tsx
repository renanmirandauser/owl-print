"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CATEGORY_LABEL, type ProductCategory } from "@/types";
import { track } from "@/components/analytics/Analytics";

export interface ProductCardProps {
  slug: string;
  name: string;
  category: ProductCategory;
  image?: string;
  href?: string;
}

export function ProductCard({ slug, name, category, image, href }: ProductCardProps) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group overflow-hidden rounded-xl border border-premium/20 bg-white shadow-sm"
    >
      <Link
        href={href ?? `/produtos/${slug}`}
        onClick={() => track("product_view", { slug, category })}
        className="block"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-cream">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width:768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl text-premium/40">
              🦉
            </div>
          )}
        </div>

        <div className="p-4">
          <span className="text-xs uppercase tracking-wider text-champagne">
            {CATEGORY_LABEL[category] ?? category}
          </span>
          <h3 className="mt-1 font-display text-lg text-leather">{name}</h3>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-premium transition-colors group-hover:text-burgundy">
            Ver produto <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
