'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhotoIcon } from '@heroicons/react/24/outline';

export default function CreateProfessionalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      category: formData.get('category'),
      description: formData.get('description'),
      address: formData.get('address'),
      phone: formData.get('phone'),
      website: formData.get('website'),
      instagram: formData.get('instagram'),
      tags: formData.get('tags')?.toString().split(',').map(tag => tag.trim()),
    };

    try {
      const response = await fetch('/api/professional/create', {
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

      router.push('/profile');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
          <form onSubmit={handleSubmit} className="px-4 py-6 sm:p-8">
            <div className="space-y-12">
              <div className="border-b border-gray-900/10 pb-12">
                <h2 className="text-base font-semibold leading-7 text-gray-900">
                  Profesyonel Kart Oluştur
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  İşletmenizi veya profesyonel hizmetlerinizi tanıtın.
                </p>

                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  {/* Logo Yükleme */}
                  <div className="col-span-full">
                    <label className="block text-sm font-medium leading-6 text-gray-900">
                      Logo
                    </label>
                    <div className="mt-2 flex items-center gap-x-3">
                      <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <PhotoIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <button
                        type="button"
                        className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        Değiştir
                      </button>
                    </div>
                  </div>

                  {/* İsim */}
                  <div className="sm:col-span-4">
                    <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                      İşletme/Profesyonel Adı
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  {/* Kategori */}
                  <div className="sm:col-span-3">
                    <label htmlFor="category" className="block text-sm font-medium leading-6 text-gray-900">
                      Kategori
                    </label>
                    <div className="mt-2">
                      <select
                        id="category"
                        name="category"
                        required
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      >
                        <option value="">Seçiniz</option>
                        <option value="spor">Spor ve Fitness</option>
                        <option value="sanat">Sanat ve El Sanatları</option>
                        <option value="egitim">Eğitim ve Kurslar</option>
                        <option value="saglik">Sağlık ve Wellness</option>
                        <option value="muzik">Müzik</option>
                        <option value="dans">Dans</option>
                        <option value="diger">Diğer</option>
                      </select>
                    </div>
                  </div>

                  {/* Açıklama */}
                  <div className="col-span-full">
                    <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                      Açıklama
                    </label>
                    <div className="mt-2">
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        required
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  {/* Adres */}
                  <div className="col-span-full">
                    <label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900">
                      Adres
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="address"
                        id="address"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  {/* İletişim Bilgileri */}
                  <div className="sm:col-span-3">
                    <label htmlFor="phone" className="block text-sm font-medium leading-6 text-gray-900">
                      Telefon
                    </label>
                    <div className="mt-2">
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="website" className="block text-sm font-medium leading-6 text-gray-900">
                      Website
                    </label>
                    <div className="mt-2">
                      <input
                        type="url"
                        name="website"
                        id="website"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="instagram" className="block text-sm font-medium leading-6 text-gray-900">
                      Instagram
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="instagram"
                        id="instagram"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  {/* Etiketler */}
                  <div className="col-span-full">
                    <label htmlFor="tags" className="block text-sm font-medium leading-6 text-gray-900">
                      Etiketler
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="tags"
                        id="tags"
                        placeholder="yoga, pilates, meditasyon"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      />
                      <p className="mt-1 text-sm text-gray-500">Virgülle ayırarak birden fazla etiket ekleyebilirsiniz</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-x-6">
              <button
                type="button"
                onClick={() => router.back()}
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
    </div>
  );
} 