"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  title: string;
  href: string;
}

const navItems: NavItem[] = [
  { title: "Perfumes", href: "/perfumes" },
  { title: "Marcas", href: "/marcas" },
  { title: "Búsqueda IA", href: "/busqueda-ia" },
  { title: "Comparar", href: "/comparar" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-6">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors",
              isActive
                ? "text-primary"
                : "text-neutral-600 hover:text-primary"
            )}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

