import { handleAuth } from "@auth0/nextjs-auth0";

// Cria /api/auth/login, /logout, /callback, /me automaticamente
export const GET = handleAuth();
