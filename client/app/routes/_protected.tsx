import { Outlet } from "react-router";
import { requireAuth } from "../lib/auth";
import type { Route } from "./+types/_protected";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAuth(request);
}

export default function ProtectedLayout() {
  return <Outlet />;
}
