// app/(dashboard)/broker/[brokerId]/layout.tsx
import { ReactNode } from 'react';

interface BrokerLayoutProps {
  children: ReactNode;
}

export default function BrokerLayout({ children }: BrokerLayoutProps) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
