
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("pages/login.tsx"),
    route('/dashboard', 'pages/dashboard.tsx')

] satisfies RouteConfig;
