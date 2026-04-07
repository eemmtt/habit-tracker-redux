import type { RouteHandle } from "~/types";
import { useParams } from "react-router";
import type { Route } from "./+types/sticker";

export const handle: RouteHandle = { title: "Sticker Details", parent: "/" };

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sticker Details" },
    { name: "description", content: "Sticker details" },
  ];
}

export default function Sticker() {
  const { id } = useParams();
  return (
    <main className="p-4">
      <h1>{id}</h1>
      <p>Todo: display sticker details</p>
    </main>
  );
}
