import './globals.css';
import Navbar from '@/components/navbar';

export const metadata = {
  title: 'TopPlate - Multi-Tenant SaaS Restaurant Platform',
  description: 'Enterprise Multi-Tenant Restaurant Management, POS, KDS & Digital Ordering',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
