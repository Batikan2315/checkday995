'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { Tab } from '@headlessui/react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  image: string | null;
  stats: {
    professionalCardsCount: number;
    followingCardsCount: number;
    plansCount: number;
    participatingPlansCount: number;
    calendarsCount: number;
  };
}

interface Plan {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string | null;
  onlineLink: string | null;
  maxParticipants: number;
  currentParticipants: number;
  calendar: {
    name: string;
    color: string;
    professionalCardName: string | null;
  };
}

interface ProfessionalCard {
  id: string;
  name: string;
  category: string;
  description: string;
  followersCount: number;
  calendarsCount: number;
  calendars: Array<{
    id: string;
    name: string;
    isPublic: boolean;
  }>;
}

interface Connection {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface ConnectionRequest {
  id: string;
  fromUser: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plans, setPlans] = useState<{ created: Plan[]; participating: Plan[] }>({
    created: [],
    participating: [],
  });
  const [cards, setCards] = useState<{ managed: ProfessionalCard[]; followed: ProfessionalCard[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) {
          throw new Error('Profil bilgileri alınamadı');
        }
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Profil bilgileri yüklenirken hata:', error);
        setError('Profil bilgileri yüklenemedi');
      }
    };

    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/profile/plans');
        if (!response.ok) {
          throw new Error('Planlar alınamadı');
        }
        const data = await response.json();
        setPlans({
          created: data.created || [],
          participating: data.participating || [],
        });
      } catch (error) {
        console.error('Planlar yüklenirken hata:', error);
        setError('Planlar yüklenemedi');
      }
    };

    const fetchCards = async () => {
      try {
        const response = await fetch('/api/profile/cards');
        if (!response.ok) {
          throw new Error('Profesyonel kartlar alınamadı');
        }
        const data = await response.json();
        setCards(data);
      } catch (err) {
        console.error('Profesyonel kartlar yüklenirken hata:', err);
      }
    };

    const fetchConnections = async () => {
      try {
        const [connectionsResponse, requestsResponse] = await Promise.all([
          fetch('/api/profile/connections'),
          fetch('/api/profile/connections/requests'),
        ]);

        if (!connectionsResponse.ok) {
          throw new Error('Bağlantılar alınamadı');
        }

        if (!requestsResponse.ok) {
          throw new Error('Bağlantı istekleri alınamadı');
        }

        const connectionsData = await connectionsResponse.json();
        const requestsData = await requestsResponse.json();

        setConnections(connectionsData);
        setConnectionRequests(requestsData);
      } catch (error) {
        console.error('Bağlantılar yüklenirken hata:', error);
        setError('Bağlantılar yüklenemedi');
      }
    };

    if (status === 'authenticated') {
      Promise.all([fetchProfile(), fetchPlans(), fetchCards(), fetchConnections()]).finally(() => {
        setLoading(false);
      });
    }
  }, [status]);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/profile/connections/requests/${requestId}/accept`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('İstek kabul edilirken bir hata oluştu');
      }

      // Bağlantı isteklerini ve bağlantıları güncelle
      const [connectionsResponse, requestsResponse] = await Promise.all([
        fetch('/api/profile/connections'),
        fetch('/api/profile/connections/requests'),
      ]);

      if (!connectionsResponse.ok || !requestsResponse.ok) {
        throw new Error('Veriler güncellenirken bir hata oluştu');
      }

      const connectionsData = await connectionsResponse.json();
      const requestsData = await requestsResponse.json();

      setConnections(connectionsData);
      setConnectionRequests(requestsData);
    } catch (error) {
      console.error('Bağlantı isteği kabul edilirken hata:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/profile/connections/requests/${requestId}/reject`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('İstek reddedilirken bir hata oluştu');
      }

      // Bağlantı isteklerini güncelle
      const requestsResponse = await fetch('/api/profile/connections/requests');
      if (!requestsResponse.ok) {
        throw new Error('Veriler güncellenirken bir hata oluştu');
      }

      const requestsData = await requestsResponse.json();
      setConnectionRequests(requestsData);
    } catch (error) {
      console.error('Bağlantı isteği reddedilirken hata:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-600">
              Bu sayfayı görüntülemek için giriş yapmalısınız.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-red-600">
              {error || 'Profil bilgileri yüklenemedi'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              {profile?.image ? (
                <Image
                  src={profile.image}
                  alt={profile.name || ''}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              ) : (
                <UserCircleIcon className="h-16 w-16 text-gray-400" />
              )}
              <div className="ml-4">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {profile?.name || 'İsimsiz Kullanıcı'}
                </h1>
                <p className="text-sm text-gray-500">{profile?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Çıkış Yap
            </button>
          </div>

          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
              <Tab
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white text-blue-700 shadow'
                      : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                  )
                }
              >
                Planlarım
              </Tab>
              <Tab
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white text-blue-700 shadow'
                      : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                  )
                }
              >
                Katıldığım Planlar
              </Tab>
              <Tab
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white text-blue-700 shadow'
                      : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                  )
                }
              >
                Bağlantılarım ({connections.length})
                {connectionRequests.length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {connectionRequests.length}
                  </span>
                )}
              </Tab>
            </Tab.List>
            <Tab.Panels className="mt-2">
              <Tab.Panel className="rounded-xl bg-white p-3">
                {plans.created.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    Henüz plan oluşturmamışsınız.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {plans.created.map((plan) => (
                      <div
                        key={plan.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <h3 className="text-lg font-medium text-gray-900">
                          {plan.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {plan.description}
                        </p>
                        <div className="mt-2 text-sm text-gray-500">
                          <p>
                            {format(new Date(plan.startDate), 'PPP', {
                              locale: tr,
                            })}
                          </p>
                          <p>
                            Katılımcılar: {plan.currentParticipants}/
                            {plan.maxParticipants}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Tab.Panel>
              <Tab.Panel className="rounded-xl bg-white p-3">
                {plans.participating.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    Henüz bir plana katılmamışsınız.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {plans.participating.map((plan) => (
                      <div
                        key={plan.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <h3 className="text-lg font-medium text-gray-900">
                          {plan.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {plan.description}
                        </p>
                        <div className="mt-2 text-sm text-gray-500">
                          <p>
                            {format(new Date(plan.startDate), 'PPP', {
                              locale: tr,
                            })}
                          </p>
                          <p>
                            Katılımcılar: {plan.currentParticipants}/
                            {plan.maxParticipants}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Tab.Panel>
              <Tab.Panel className="rounded-xl bg-white p-3">
                {connectionRequests.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Bekleyen İstekler
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {connectionRequests.map((request) => (
                        <div
                          key={request.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            {request.fromUser.image ? (
                              <Image
                                src={request.fromUser.image}
                                alt={request.fromUser.name || ''}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            ) : (
                              <UserCircleIcon className="h-10 w-10 text-gray-400" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {request.fromUser.name || request.fromUser.email}
                              </p>
                              <p className="text-sm text-gray-500">
                                {format(new Date(request.createdAt), 'PPP', {
                                  locale: tr,
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAcceptRequest(request.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            >
                              Kabul Et
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                              Reddet
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {connections.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    Henüz bağlantınız bulunmuyor.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {connections.map((connection) => (
                      <div
                        key={connection.id}
                        className="flex items-center space-x-3 p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        {connection.image ? (
                          <Image
                            src={connection.image}
                            alt={connection.name || ''}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <UserCircleIcon className="h-10 w-10 text-gray-400" />
                        )}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {connection.name || connection.email}
                          </h3>
                          <p className="text-sm text-gray-500">{connection.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
} 