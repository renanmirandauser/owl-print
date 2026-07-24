import { getSession } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";
import { listClientOptions } from "@/actions/clients";
import { listProductOptions } from "@/actions/products";
import { MobileQuoteClient } from "./MobileQuoteClient";

export const dynamic = "force-dynamic";

export default async function MobileQuotePage() {
  const session = await getSession();
  if (!session?.user) redirect("/api/auth/login?returnTo=/mobile");

  const [clients, products] = await Promise.all([
    listClientOptions(),
    listProductOptions(),
  ]);

  const vendedor =
    (session.user.name as string) || (session.user.email as string) || "OWL PRINT";

  return <MobileQuoteClient clients={clients} products={products} vendedor={vendedor} />;
}
