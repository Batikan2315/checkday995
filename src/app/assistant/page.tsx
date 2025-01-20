'use client';

import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { SparklesIcon, BookmarkIcon } from '@heroicons/react/24/outline';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AssistantPage() {
  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = [
    { name: 'AI Önerileri', icon: SparklesIcon },
    { name: 'Kaydedilenler', icon: BookmarkIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Asistan</h1>
        </div>

        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-4 border-b border-gray-200">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  classNames(
                    'group inline-flex items-center px-1 py-4 border-b-2 font-medium text-sm',
                    selected
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )
                }
              >
                <tab.icon className="mr-2 h-5 w-5" aria-hidden="true" />
                {tab.name}
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels className="mt-6">
            {/* AI Önerileri */}
            <Tab.Panel>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Örnek Öneri Kartı */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <SparklesIcon className="h-5 w-5 text-blue-500" />
                      <span className="ml-2 text-sm font-medium text-blue-600">Öneri</span>
                    </div>
                    <span className="text-xs text-gray-500">Bugün</span>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    Yoga ile Güne Başlangıç
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Geçmiş aktivitelerinize göre, bu yoga dersi ilginizi çekebilir.
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
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">150 TL</span>
                    <div className="flex space-x-2">
                      <button className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        Kaydet
                      </button>
                      <button className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                        İncele
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Tab.Panel>

            {/* Kaydedilenler */}
            <Tab.Panel>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white shadow rounded-lg p-6">
                  <p className="text-gray-500 text-center">Henüz kaydedilen plan yok</p>
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
} 