import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  route("login", "pages/login.tsx"),
  route("dashboard", "pages/dashboard.tsx"),
  layout("layouts/layout.tsx", [
    index("pages/home.tsx"),
    route("upload-video", "pages/upload-video.tsx"),
    route("upload-streaming", "pages/upload-streaming.tsx"),
  ]),
] satisfies RouteConfig;
