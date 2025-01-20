import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const data = await request.json();

    // Zorunlu alanları kontrol et
    if (!data.title || !data.startDate || !data.startTime || !data.endDate || !data.endTime || !data.calendarId) {
      return NextResponse.json(
        { message: 'Lütfen tüm zorunlu alanları doldurun' },
        { status: 400 }
      );
    }

    // Takvimin varlığını ve kullanıcının yetkisini kontrol et
    const calendar = await prisma.calendar.findUnique({
      where: { id: data.calendarId },
      include: {
        professionalCard: true,
      },
    });

    if (!calendar) {
      return NextResponse.json(
        { message: 'Takvim bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcının bu takvime plan ekleme yetkisi var mı kontrol et
    if (calendar.userId !== user.id) {
      return NextResponse.json(
        { message: 'Bu takvime plan ekleme yetkiniz yok' },
        { status: 403 }
      );
    }

    // Tarih ve saatleri birleştir
    const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
    const endDateTime = new Date(`${data.endDate}T${data.endTime}`);

    // Tarihlerin geçerliliğini kontrol et
    if (startDateTime >= endDateTime) {
      return NextResponse.json(
        { message: 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır' },
        { status: 400 }
      );
    }

    if (startDateTime < new Date()) {
      return NextResponse.json(
        { message: 'Geçmiş bir tarih seçemezsiniz' },
        { status: 400 }
      );
    }

    // Planı oluştur
    const plan = await prisma.plan.create({
      data: {
        title: data.title,
        description: data.description || null,
        startDate: startDateTime,
        endDate: endDateTime,
        location: data.location || null,
        onlineLink: data.onlineLink || null,
        maxParticipants: data.maxParticipants || null,
        price: data.price || null,
        tags: data.tags || [],
        isPublic: true,
        userId: user.id,
        calendarId: data.calendarId,
      },
    });

    return NextResponse.json(
      {
        message: 'Plan başarıyla oluşturuldu',
        plan,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Plan oluşturma hatası:', error);
    return NextResponse.json(
      { message: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
} 