'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

interface ProfessionalCard {
  id: string;
  name: string;
  category: string;
  description: string;
  followersCount: number;
  isFollowing: boolean;
}

export default function ProfessionalsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('managed');
  const [managedCards, setManagedCards] = useState<ProfessionalCard[]>([]);
  const [followedCards, setFollowedCards] = useState<ProfessionalCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const [managedRes, followedRes] = await Promise.all([
          fetch('/api/professional/managed'),
          fetch('/api/professional/followed'),
        ]);

        if (managedRes.ok && followedRes.ok) {
          const managed = await managedRes.json();
          const followed = await followedRes.json();
          setManagedCards(managed);
          setFollowedCards(followed);
        }
      } catch (error) {
        console.error('Kartlar yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchCards();
    }
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Bu sayfayı görüntülemek için giriş yapmalısınız.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profesyonel Kartlar</h1>
          <p className="mt-2 text-sm text-gray-700">
            Profesyonel kartlarınızı yönetin ve takip ettiklerinizi görüntüleyin
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/professionals/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Yeni Kart Oluştur
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('managed')}
              className={`${
                activeTab === 'managed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Yönettiğim Kartlar
            </button>
            <button
              onClick={() => setActiveTab('followed')}
              className={`${
                activeTab === 'followed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Takip Ettiklerim
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="mt-8 text-center">
            <p className="text-gray-500">Yükleniyor...</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(activeTab === 'managed' ? managedCards : followedCards).map((card) => (
              <div
                key={card.id}
                className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
              >
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">{card.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{card.category}</p>
                  <p className="mt-3 text-sm text-gray-700">{card.description}</p>
                </div>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500">
                        {card.followersCount} Takipçi
                      </span>
                    </div>
                    <Link
                      href={`/professionals/${card.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      Detayları Gör
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 