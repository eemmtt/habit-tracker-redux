import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/_protected.tsx", [
    index("routes/home.tsx"),
    route("new-habit", "routes/newhabit.tsx"),
    route("settings", "routes/settings.tsx"),
    route("habit/:id", "routes/habit.tsx"),
    route("sticker/:id", "routes/sticker.tsx"),
  ]),
  layout("routes/auth/layout.tsx", [
    route("welcome", "routes/auth/welcome.tsx"),
  ]),
] satisfies RouteConfig;
