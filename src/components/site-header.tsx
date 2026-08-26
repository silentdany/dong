import { Link } from "@tanstack/react-router";
import { copy } from "@/lib/copy";

const navClass =
  "flex h-11 items-center px-3 transition-colors duration-150 hover:text-fg";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between gap-3 pt-[max(1rem,env(safe-area-inset-top))]">
      <Link to="/" className="flex items-center gap-2 py-1.5 text-sm font-semibold tracking-tight text-fg">
        <span className="text-[1.35rem] leading-none" aria-hidden>
          {copy.logo}
        </span>
        {copy.siteName}
      </Link>
      <nav className="flex items-center text-sm">
        <Link
          to="/today"
          className={navClass}
          activeProps={{ className: "text-fg" }}
          inactiveProps={{ className: "text-muted" }}
          activeOptions={{ exact: true }}
        >
          {copy.today}
        </Link>
        <span className="text-subtle" aria-hidden>
          /
        </span>
        <Link
          to="/rules"
          className={navClass}
          activeProps={{ className: "text-fg" }}
          inactiveProps={{ className: "text-muted" }}
          activeOptions={{ exact: true }}
        >
          {copy.rulesNav}
        </Link>
        <span className="text-subtle" aria-hidden>
          /
        </span>
        <Link
          to="/about"
          className={navClass}
          activeProps={{ className: "text-fg" }}
          inactiveProps={{ className: "text-muted" }}
          activeOptions={{ exact: true }}
        >
          {copy.aboutNav}
        </Link>
      </nav>
    </header>
  );
}
