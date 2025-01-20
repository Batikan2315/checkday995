'use client';

import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function DiscoverPage() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { name: 'Öne Çıkanlar' },
    { name: 'Yaklaşan Planlar' },
    { name: 'Profesyonel Kartlar' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Arama */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full rounded-lg border-0 py-3 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Plan veya profesyonel kart ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Sekmeler */}
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-4 border-b border-gray-200">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  classNames(
                    'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
                    selected
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  )
                }
              >
                {tab.name}
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels className="mt-6">
            {/* Öne Çıkanlar */}
            <Tab.Panel>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Örnek Plan Kartı */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 font-medium">U</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Kullanıcı Adı</p>
                          <p className="text-xs text-gray-500">2 saat önce</p>
                        </div>
                      </div>
                      <button className="text-blue-600 text-sm font-medium hover:text-blue-500">
                        Takip Et
                      </button>
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Yoga Dersi</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Haftasonu yoga dersi ile güne enerjik başlayın.
                    </p>
                    <div className="mt-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <span>25 Ocak 2024, 10:00</span>
                        <span className="mx-2">•</span>
                        <span>Online</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-2">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        spor
                      </span>
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        yoga
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">150 TL</span>
                      <button className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                        Katıl
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Tab.Panel>

            {/* Yaklaşan Planlar */}
            <Tab.Panel>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white shadow rounded-lg p-6">
                  <p className="text-gray-500 text-center">Yaklaşan plan bulunamadı</p>
                </div>
              </div>
            </Tab.Panel>

            {/* Profesyonel Kartlar */}
            <Tab.Panel>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Örnek Profesyonel Kart */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 font-medium">YS</span>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">Yoga Stüdyosu</h3>
                        <p className="text-sm text-gray-500">Spor ve Sağlık</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-500">
                      Profesyonel eğitmenler eşliğinde yoga ve meditasyon dersleri.
                    </p>
                    <div className="mt-4 flex items-center space-x-2">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        yoga
                      </span>
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        meditasyon
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>4.8</span>
                        <div className="flex items-center">
                          {[0, 1, 2, 3, 4].map((rating) => (
                            <svg
                              key={rating}
                              className="h-4 w-4 text-yellow-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 15.585l-6.327 3.323 1.209-7.037L.172 7.207l7.046-1.024L10 0l2.782 6.183 7.046 1.024-4.71 4.664 1.209 7.037L10 15.585z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ))}
                        </div>
                        <span>(128)</span>
                      </div>
                      <button className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                        Takip Et
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
} 