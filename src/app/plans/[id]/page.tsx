'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Plan {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  onlineLink?: string;
  maxParticipants?: number;
  price?: number;
  tags: string[];
  isPublic: boolean;
  userId: string;
  calendarId: string;
  participants: {
    id: string;
    userId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    user: {
      name: string;
      email: string;
    };
  }[];
  user: {
    name: string;
    email: string;
  };
}

export default function PlanDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participationStatus, setParticipationStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch(`/api/plans/${id}`);
        if (!response.ok) {
          throw new Error('Plan bulunamadı');
        }
        const data = await response.json();
        setPlan(data);
        
        // Kullanıcının katılım durumunu kontrol et
        if (session?.user?.email) {
          const participation = data.participants.find(
            (p: any) => p.user.email === session.user.email
          );
          if (participation) {
            setParticipationStatus(participation.status);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlan();
    }
  }, [id, session]);

  const handleParticipate = async () => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch('/api/plans/participate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId: id }),
      });

      if (!response.ok) {
        throw new Error('Katılım isteği gönderilemedi');
      }

      const data = await response.json();
      setParticipationStatus('PENDING');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  const handleParticipationAction = async (participationId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      setActionLoading(true);
      const response = await fetch('/api/plans/manage-participation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participationId, action }),
      });

      if (!response.ok) {
        throw new Error('İşlem gerçekleştirilemedi');
      }

      // Planı yeniden yükle
      const updatedPlanResponse = await fetch(`/api/plans/${id}`);
      if (!updatedPlanResponse.ok) {
        throw new Error('Plan güncellenemedi');
      }
      const updatedPlan = await updatedPlanResponse.json();
      setPlan(updatedPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  }

  if (!plan) {
    return <div className="flex justify-center items-center min-h-screen">Plan bulunamadı</div>;
  }

  const isOwner = session?.user?.email === plan.user.email;
  const canParticipate = !isOwner && !participationStatus;
  const isPending = participationStatus === 'PENDING';
  const isApproved = participationStatus === 'APPROVED';
  const isRejected = participationStatus === 'REJECTED';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-4">{plan.title}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Plan Detayları</h2>
              <p className="text-gray-600">{plan.description}</p>
            </div>

            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Tarih ve Saat</h2>
              <p className="text-gray-600">
                {format(new Date(plan.startDate), 'PPP', { locale: tr })} - {format(new Date(plan.endDate), 'PPP', { locale: tr })}
              </p>
            </div>

            {plan.location && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Konum</h2>
                <p className="text-gray-600">{plan.location}</p>
              </div>
            )}

            {plan.onlineLink && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Online Bağlantı</h2>
                <a href={plan.onlineLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {plan.onlineLink}
                </a>
              </div>
            )}

            {plan.price && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Ücret</h2>
                <p className="text-gray-600">{plan.price} TL</p>
              </div>
            )}

            {plan.tags.length > 0 && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Etiketler</h2>
                <div className="flex flex-wrap gap-2">
                  {plan.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Organizatör</h2>
              <p className="text-gray-600">{plan.user.name}</p>
            </div>

            {plan.maxParticipants && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Katılımcı Limiti</h2>
                <p className="text-gray-600">
                  {plan.participants.filter(p => p.status === 'APPROVED').length} / {plan.maxParticipants}
                </p>
              </div>
            )}

            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Katılım Durumu</h2>
              {isOwner ? (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-gray-600">Bu planın organizatörüsünüz</p>
                </div>
              ) : (
                <div>
                  {canParticipate && (
                    <button
                      onClick={handleParticipate}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Katılmak İstiyorum
                    </button>
                  )}
                  {isPending && (
                    <div className="bg-yellow-100 p-4 rounded-lg">
                      <p className="text-yellow-800">Katılım isteğiniz onay bekliyor</p>
                    </div>
                  )}
                  {isApproved && (
                    <div className="bg-green-100 p-4 rounded-lg">
                      <p className="text-green-800">Katılımınız onaylandı</p>
                    </div>
                  )}
                  {isRejected && (
                    <div className="bg-red-100 p-4 rounded-lg">
                      <p className="text-red-800">Katılım isteğiniz reddedildi</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isOwner && plan.participants.length > 0 && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Katılımcılar</h2>
                <div className="space-y-2">
                  {plan.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div>
                        <p className="font-medium">{participant.user.name}</p>
                        <p className="text-sm text-gray-500">{participant.user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {participant.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleParticipationAction(participant.id, 'APPROVE')}
                              disabled={actionLoading}
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                            >
                              Onayla
                            </button>
                            <button
                              onClick={() => handleParticipationAction(participant.id, 'REJECT')}
                              disabled={actionLoading}
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                              Reddet
                            </button>
                          </>
                        )}
                        {participant.status === 'APPROVED' && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            Onaylandı
                          </span>
                        )}
                        {participant.status === 'REJECTED' && (
                          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                            Reddedildi
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 