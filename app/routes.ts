import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  route("login", "pages/login.tsx"),
  
  layout("layouts/landing-page.tsx", [
    index("pages/home.tsx"),
  ]),
  
  layout("layouts/dashboard.tsx", [
    route("dashboard", "pages/dashboard.tsx"),
    route("dashboard/upload-video", "pages/upload-video.tsx"),
    route("dashboard/upload-streaming", "pages/upload-streaming.tsx"),

    // --- MUDANÇAS AQUI ---

    // 1. CORRIGIDO: A rota /dashboard/video/:id (Highlights)
    // agora aponta para o seu NOVO ficheiro VideoDetails.tsx
    route("dashboard/video/:id", "pages/VideoDetails.tsx"),

    // 2. NOVO: A rota /dashboard/exam/:id (Pasta)
    // agora aponta para o seu ficheiro record.tsx (que agora é a lista de vídeos)
    route("dashboard/exam/:id", "pages/record.tsx"),
  ]),
] satisfies RouteConfig;