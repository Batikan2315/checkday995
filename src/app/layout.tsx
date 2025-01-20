'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { SessionProvider } from 'next-auth/react';
import {
  HomeIcon,
  CalendarIcon,
  UserGroupIcon,
  SparklesIcon,
  UserIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';

const inter = Inter({ subsets: ['latin'] });

function MainLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navigation = [
    { name: 'Keşfet', href: '/discover', icon: MagnifyingGlassIcon },
    { name: 'Profesyoneller', href: '/professionals', icon: UserGroupIcon },
    { name: 'Plan Oluştur', href: '/plans/create', icon: PlusCircleIcon },
    { name: 'Takvim', href: '/calendar', icon: CalendarIcon },
    { name: 'Asistan', href: '/assistant', icon: SparklesIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <Link href={session ? "/discover" : "/"} className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">CheckDay</span>
            </Link>

            {session ? (
              <>
                <nav className="hidden md:flex space-x-8">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                          isActive
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <item.icon className="h-5 w-5 mr-1" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>

                <div className="flex items-center">
                  <Link
                    href="/profile"
                    className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    <UserIcon className="h-5 w-5 mr-1" />
                    Profil
                  </Link>
                </div>

                {/* Mobil Menü */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
                  <div className="grid grid-cols-5 gap-1 px-2 py-2">
                    {navigation.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex flex-col items-center justify-center px-2 py-2 text-xs font-medium ${
                            isActive
                              ? 'text-blue-600'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <item.icon className="h-6 w-6" />
                          <span className="mt-1">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <SessionProvider>
          <MainLayout>{children}</MainLayout>
        </SessionProvider>
      </body>
    </html>
  );
}
