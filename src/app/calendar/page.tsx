'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Menu } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const locales = {
  tr: tr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Calendar {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  professionalCardName: string | null;
}

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  calendarId: string;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalendars = async () => {
      try {
        const response = await fetch('/api/calendars');
        if (!response.ok) {
          throw new Error('Takvimler alınamadı');
        }
        const data = await response.json();
        setCalendars(data);
        // İlk takvimi varsayılan olarak seç
        if (data.length > 0) {
          setSelectedCalendar(data[0].id);
        }
      } catch (error) {
        console.error('Takvimler yüklenirken hata:', error);
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('Etkinlikler alınamadı');
        }
        const data = await response.json();
        setEvents(
          data.map((event: any) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
          }))
        );
      } catch (error) {
        console.error('Etkinlikler yüklenirken hata:', error);
      }
    };

    if (status === 'authenticated') {
      Promise.all([fetchCalendars(), fetchEvents()]).finally(() => {
        setLoading(false);
      });
    }
  }, [status]);

  const filteredEvents = events.filter((event) =>
    selectedCalendar === event.calendarId
  );

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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-gray-900">Takvim</h1>
            <Menu as="div" className="relative">
              <Menu.Button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                {calendars.find(cal => cal.id === selectedCalendar)?.name || 'Takvim Seç'}
                <ChevronDownIcon className="ml-2 h-5 w-5" aria-hidden="true" />
              </Menu.Button>
              <Menu.Items className="origin-top-left absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  {calendars.map((calendar) => (
                    <Menu.Item key={calendar.id}>
                      {({ active }) => (
                        <button
                          className={classNames(
                            active ? 'bg-gray-100' : '',
                            'w-full text-left px-4 py-2 text-sm text-gray-900'
                          )}
                          onClick={() => setSelectedCalendar(calendar.id)}
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              checked={selectedCalendar === calendar.id}
                              onChange={() => {}}
                            />
                            <span className="ml-3">
                              {calendar.name}
                              {calendar.professionalCardName && (
                                <span className="text-gray-500">
                                  {' '}
                                  - {calendar.professionalCardName}
                                </span>
                              )}
                            </span>
                          </div>
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Menu>
          </div>
          <Link
            href="/plans/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Yeni Plan Oluştur
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 'calc(100vh - 250px)' }}
            messages={{
              today: 'Bugün',
              previous: 'Önceki',
              next: 'Sonraki',
              month: 'Ay',
              week: 'Hafta',
              day: 'Gün',
              agenda: 'Ajanda',
              date: 'Tarih',
              time: 'Saat',
              event: 'Etkinlik',
              noEventsInRange: 'Bu aralıkta etkinlik yok.',
              showMore: (total) => `+${total} daha`,
            }}
            culture="tr"
            views={['month', 'week', 'day', 'agenda']}
            defaultView="month"
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: event.color,
              },
            })}
          />
        </div>
      </div>
    </div>
  );
} 