import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/_protected.tsx", [
    index("routes/dashboard.tsx"),
    route("new-habit", "routes/newhabit.tsx"),
    route("settings", "routes/settings.tsx"),
  ]),
  layout("routes/auth/layout.tsx", [
    route("welcome", "routes/auth/welcome.tsx"),
  ]),
] satisfies RouteConfig;
