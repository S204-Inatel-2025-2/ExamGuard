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
    route("dashboard/video/:id", "pages/record.tsx"),
  ]),
] satisfies RouteConfig;
