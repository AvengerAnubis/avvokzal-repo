import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  /** Прокси API-запросов на backend через сервер Next.js
   *
   * Устраняет CORS: браузер отправляет запросы на ТОТ ЖЕ домен,
   * а Next.js проксирует их на backend на серверной стороне.
   *
   * Настройка:
   *   - Vercel (production):
   *       API_BACKEND_URL=https://avvokzal-repo-api.vercel.app
   *       NEXT_PUBLIC_API_URL=/api
   *   - Localhost (dev):
   *       NEXT_PUBLIC_API_URL=http://localhost:3001/api
   *       (API_BACKEND_URL не задан → rewrites отключены)
   */
  async rewrites() {
    const backendUrl = process.env.API_BACKEND_URL;

    if (!backendUrl) {
      return []; // dev-режим: запросы идут напрямую, rewrites не нужны
    }

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
