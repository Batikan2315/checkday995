'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Tab } from '@headlessui/react';
import {
  MapPinIcon,
  PhoneIcon,
  GlobeAltIcon,
  CalendarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import CreatePlanModal from './create-plan-modal';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface Calendar {
  id: string;
  name: string;
  description: string;
  plans: Plan[];
}

interface Plan {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  onlineLink: string;
  maxParticipants: number;
  price: number;
  tags: string[];
}

interface ProfessionalCard {
  id: string;
  name: string;
  category: string;
  description: string;
  address?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  tags: string[];
  userId: string;
  user: {
    name: string;
    email: string;
  };
  calendars: Calendar[];
  _count: {
    followers: number;
  };
  isFollowing: boolean;
}

export default function ProfessionalCardPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: session } = useSession();
  const [card, setCard] = useState<ProfessionalCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isCreatePlanModalOpen, setIsCreatePlanModalOpen] = useState(false);

  useEffect(() => {
    fetchCard();
  }, [id]);

  const fetchCard = async () => {
    try {
      const response = await fetch(`/api/professional/${id}`);
      if (!response.ok) {
        throw new Error('Profesyonel kart yüklenemedi');
      }
      const data = await response.json();
      setCard(data.professionalCard);
      setIsFollowing(data.professionalCard.isFollowing);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    setFollowLoading(true);
    try {
      const response = await fetch(
        `/api/professional/${isFollowing ? 'unfollow' : 'follow'}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ professionalCardId: id }),
        }
      );

      if (!response.ok) {
        throw new Error('İşlem başarısız oldu');
      }

      setIsFollowing(!isFollowing);
      if (card) {
        setCard({
          ...card,
          _count: {
            ...card._count,
            followers: card._count.followers + (isFollowing ? -1 : 1),
          },
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFollowLoading(false);
    }
  };

  const calendar = card?.calendars[0];
  const upcomingPlans = calendar?.plans.filter(
    (plan) => new Date(plan.endDate) >= new Date()
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">{error || 'Profesyonel kart bulunamadı'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Üst Bilgi */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-500">
                  {card.name.charAt(0)}
                </span>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">{card.name}</h1>
                <p className="text-sm text-gray-500">{card.category}</p>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-5 w-5 text-gray-400" />
                    <span className="ml-1 text-sm text-gray-500">
                      {card._count.followers} Takipçi
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={classNames(
                'rounded-md px-3.5 py-2.5 text-sm font-semibold shadow-sm',
                isFollowing
                  ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  : 'bg-blue-600 text-white hover:bg-blue-500',
                followLoading ? 'opacity-50 cursor-not-allowed' : ''
              )}
            >
              {followLoading
                ? 'İşleniyor...'
                : isFollowing
                ? 'Takibi Bırak'
                : 'Takip Et'}
            </button>
          </div>

          <p className="mt-4 text-gray-600">{card.description}</p>

          {/* İletişim Bilgileri */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {card.address && (
              <div className="flex items-center text-gray-500">
                <MapPinIcon className="h-5 w-5 mr-2" />
                <span>{card.address}</span>
              </div>
            )}
            {card.phone && (
              <div className="flex items-center text-gray-500">
                <PhoneIcon className="h-5 w-5 mr-2" />
                <a href={`tel:${card.phone}`} className="hover:text-blue-600">
                  {card.phone}
                </a>
              </div>
            )}
            {card.website && (
              <div className="flex items-center text-gray-500">
                <GlobeAltIcon className="h-5 w-5 mr-2" />
                <a
                  href={card.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600"
                >
                  {card.website}
                </a>
              </div>
            )}
            {card.instagram && (
              <div className="flex items-center text-gray-500">
                <svg
                  className="h-5 w-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <a
                  href={`https://instagram.com/${card.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600"
                >
                  @{card.instagram}
                </a>
              </div>
            )}
          </div>

          {/* Etiketler */}
          {card.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Sekmeler */}
        <div className="mt-6">
          <Tab.Group>
            <Tab.List className="flex space-x-4 border-b border-gray-200">
              <Tab
                className={({ selected }) =>
                  classNames(
                    'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
                    selected
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  )
                }
              >
                <CalendarIcon className="h-5 w-5 mr-2 inline-block" />
                Takvim
              </Tab>
            </Tab.List>
            <Tab.Panels className="mt-6">
              <Tab.Panel>
                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
                  {/* Plan Oluşturma Butonu */}
                  {card?.userId === session?.user?.email && (
                    <div className="mb-6">
                      <button
                        type="button"
                        onClick={() => setIsCreatePlanModalOpen(true)}
                        className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      >
                        <CalendarIcon className="h-5 w-5 mr-2" />
                        Yeni Plan Oluştur
                      </button>
                    </div>
                  )}

                  {/* Planlar */}
                  {upcomingPlans && upcomingPlans.length > 0 ? (
                    <div className="space-y-6">
                      {upcomingPlans.map((plan) => (
                        <div
                          key={plan.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {plan.title}
                            </h3>
                            {plan.description && (
                              <p className="mt-1 text-sm text-gray-500">
                                {plan.description}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <CalendarIcon className="h-5 w-5 mr-1" />
                                <time dateTime={plan.startDate}>
                                  {new Date(plan.startDate).toLocaleString('tr-TR', {
                                    dateStyle: 'long',
                                    timeStyle: 'short',
                                  })}
                                </time>
                              </div>
                              {plan.location && (
                                <div className="flex items-center">
                                  <MapPinIcon className="h-5 w-5 mr-1" />
                                  {plan.location}
                                </div>
                              )}
                              {plan.maxParticipants && (
                                <div className="flex items-center">
                                  <UserGroupIcon className="h-5 w-5 mr-1" />
                                  {plan.maxParticipants} kişi
                                </div>
                              )}
                            </div>
                            {plan.tags.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {plan.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="mt-4 sm:mt-0 sm:ml-6 flex items-center gap-4">
                            {plan.price && (
                              <span className="text-lg font-medium text-gray-900">
                                {plan.price} TL
                              </span>
                            )}
                            <button
                              type="button"
                              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            >
                              Katıl
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center">
                      Yaklaşan etkinlik bulunmuyor
                    </p>
                  )}
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>

      {/* Plan Oluşturma Modalı */}
      {calendar && (
        <CreatePlanModal
          isOpen={isCreatePlanModalOpen}
          onClose={() => setIsCreatePlanModalOpen(false)}
          calendarId={calendar.id}
          onSuccess={fetchCard}
        />
      )}
    </div>
  );
} 