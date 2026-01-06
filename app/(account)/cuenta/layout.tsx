import { RequireAuth } from '@/components/auth/RequireAuth';
import { AccountSidebar } from '@/components/account/AccountSidebar';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <AccountSidebar />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}

