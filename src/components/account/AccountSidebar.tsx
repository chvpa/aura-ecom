'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { User, Package, Heart, LogOut } from 'lucide-react';

const navigation = [
  { name: 'Perfil', href: '/cuenta/perfil', icon: User },
  { name: 'Pedidos', href: '/cuenta/pedidos', icon: Package },
  { name: 'Wishlist', href: '/cuenta/wishlist', icon: Heart },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-full md:w-64">
      <div className="space-y-4">
        <div className="pb-4 border-b">
          <h2 className="text-lg font-semibold">Mi Cuenta</h2>
          {user?.email && (
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
          )}
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </aside>
  );
}

