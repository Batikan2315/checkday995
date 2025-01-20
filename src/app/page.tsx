'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { CalendarIcon, UserGroupIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/discover');
    }
  }, [session, router]);

  const features = [
    {
      name: 'Etkinlik Planlama',
      description: 'Kişisel ve profesyonel etkinliklerinizi kolayca planlayın ve yönetin.',
      icon: CalendarIcon,
    },
    {
      name: 'Profesyonel Kartlar',
      description: 'Hizmetlerinizi tanıtın ve müşterilerinizle etkileşime geçin.',
      icon: UserGroupIcon,
    },
    {
      name: 'AI Asistan',
      description: 'Yapay zeka destekli asistanımızla etkinlik önerileri alın.',
      icon: SparklesIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-4xl py-32">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Planlarınızı Yönetmenin En İyi Yolu
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-100">
              CheckDay ile etkinliklerinizi planlayın, takviminizi yönetin ve profesyonel kartınızla
              hizmetlerinizi tanıtın. Tek platform üzerinden tüm ihtiyaçlarınızı karşılayın.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/register"
                className="rounded-md bg-white px-6 py-3 text-lg font-semibold text-blue-600 shadow-sm hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Hemen Başla
              </Link>
              <Link
                href="/login"
                className="text-lg font-semibold leading-6 text-white hover:text-gray-100"
              >
                Giriş Yap <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Daha Fazla Özellik</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              CheckDay ile Neler Yapabilirsiniz?
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Etkinlik planlama ve yönetimini kolaylaştıran özelliklerle tanışın.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <feature.icon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Hemen Başlayın
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-100">
              CheckDay ile planlarınızı yönetmeye ve profesyonel kartınızı oluşturmaya başlayın.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/register"
                className="rounded-md bg-white px-6 py-3 text-lg font-semibold text-blue-600 shadow-sm hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Ücretsiz Hesap Oluştur
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
