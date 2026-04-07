import type { RouteHandle } from "~/types";
import type { Route } from "./+types/settings";
import LogoutButton from "~/ui/LogoutButton";

export const handle: RouteHandle = { title: "Settings", parent: "/" };

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Settings" },
    { name: "description", content: "Sticky settings" },
  ];
}

export default function Settings() {
  return (
    <main className="p-4">
      <LogoutButton />
    </main>
  );
}
