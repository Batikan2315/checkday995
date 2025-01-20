'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendarId: string;
  onSuccess: () => void;
}

export default function CreatePlanModal({
  isOpen,
  onClose,
  calendarId,
  onSuccess,
}: CreatePlanModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      startDate: formData.get('startDate'),
      startTime: formData.get('startTime'),
      endDate: formData.get('endDate'),
      endTime: formData.get('endTime'),
      location: formData.get('location'),
      onlineLink: formData.get('onlineLink'),
      maxParticipants: formData.get('maxParticipants')
        ? parseInt(formData.get('maxParticipants') as string)
        : null,
      price: formData.get('price') ? parseFloat(formData.get('price') as string) : null,
      tags: formData.get('tags')?.toString().split(',').map((tag) => tag.trim()),
      calendarId,
    };

    try {
      const response = await fetch('/api/plans/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Bir hata oluştu');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Kapat</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      Yeni Plan Oluştur
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="mt-6">
                      <div className="space-y-6">
                        {/* Başlık */}
                        <div>
                          <label
                            htmlFor="title"
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            Başlık
                          </label>
                          <div className="mt-2">
                            <input
                              type="text"
                              name="title"
                              id="title"
                              required
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                            />
                          </div>
                        </div>

                        {/* Açıklama */}
                        <div>
                          <label
                            htmlFor="description"
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            Açıklama
                          </label>
                          <div className="mt-2">
                            <textarea
                              id="description"
                              name="description"
                              rows={3}
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                            />
                          </div>
                        </div>

                        {/* Tarih ve Saat */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor="startDate"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Başlangıç Tarihi
                            </label>
                            <div className="mt-2">
                              <input
                                type="date"
                                name="startDate"
                                id="startDate"
                                required
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                              />
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="startTime"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Başlangıç Saati
                            </label>
                            <div className="mt-2">
                              <input
                                type="time"
                                name="startTime"
                                id="startTime"
                                required
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                              />
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="endDate"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Bitiş Tarihi
                            </label>
                            <div className="mt-2">
                              <input
                                type="date"
                                name="endDate"
                                id="endDate"
                                required
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                              />
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="endTime"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Bitiş Saati
                            </label>
                            <div className="mt-2">
                              <input
                                type="time"
                                name="endTime"
                                id="endTime"
                                required
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Konum ve Online Link */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor="location"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Konum
                            </label>
                            <div className="mt-2">
                              <input
                                type="text"
                                name="location"
                                id="location"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                              />
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="onlineLink"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Online Link
                            </label>
                            <div className="mt-2">
                              <input
                                type="url"
                                name="onlineLink"
                                id="onlineLink"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Katılımcı Sayısı ve Fiyat */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor="maxParticipants"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Maksimum Katılımcı Sayısı
                            </label>
                            <div className="mt-2">
                              <input
                                type="number"
                                name="maxParticipants"
                                id="maxParticipants"
                                min="1"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                              />
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="price"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Fiyat (TL)
                            </label>
                            <div className="mt-2">
                              <input
                                type="number"
                                name="price"
                                id="price"
                                min="0"
                                step="0.01"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Etiketler */}
                        <div>
                          <label
                            htmlFor="tags"
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            Etiketler
                          </label>
                          <div className="mt-2">
                            <input
                              type="text"
                              name="tags"
                              id="tags"
                              placeholder="yoga, meditasyon, spor"
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                              Virgülle ayırarak birden fazla etiket ekleyebilirsiniz
                            </p>
                          </div>
                        </div>
                      </div>

                      {error && (
                        <div className="mt-4 rounded-md bg-red-50 p-4">
                          <div className="text-sm text-red-700">{error}</div>
                        </div>
                      )}

                      <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button
                          type="button"
                          onClick={onClose}
                          className="text-sm font-semibold leading-6 text-gray-900"
                        >
                          İptal
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
                        >
                          {loading ? 'Oluşturuluyor...' : 'Oluştur'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 