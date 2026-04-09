import { Link, Outlet, type UIMatch } from "react-router";
import { requireAuth } from "../lib/auth";
import type { Route } from "./+types/_protected";
import { useMatches } from "react-router";
import type { RouteHandle } from "~/types";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAuth(request);
}

export default function ProtectedLayout() {
  const matches = useMatches() as UIMatch<unknown, RouteHandle>[];
  const currMatch = matches[matches.length - 1];
  const title = currMatch.handle?.title;
  const parent = currMatch.handle?.parent;
  return (
    <>
      <header className="pl-4 pt-2 pb-2 pr-4 flex flex-row gap-3 font-mono text-primary">
        {parent && (
          <Link
            to={parent}
            className="text-xl px-1 cursor-pointer focus:outline focus:outline-primary"
          >
            &larr;
          </Link>
        )}
        {title === "Dashboard" && (
          <Link
            to="/settings"
            className="text-xl px-1 cursor-pointer focus:outline focus:outline-primary"
          >
            &#8942;
          </Link>
        )}
        <h1 className="text-lg">{title ?? ""}</h1>
      </header>
      <Outlet />
    </>
  );
}
