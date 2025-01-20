import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../auth/[...nextauth]/route';

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

    const {
      title,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      location,
      onlineLink,
      maxParticipants,
      price,
      tags,
      calendarId,
      visibility,
    } = await request.json();

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        personalCalendar: true,
        managedCalendars: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Takvimi kontrol et
    const calendar = await prisma.calendar.findUnique({
      where: { id: calendarId },
    });

    if (!calendar) {
      return NextResponse.json(
        { message: 'Takvim bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcının bu takvimde plan oluşturma yetkisi var mı kontrol et
    const hasPermission =
      calendar.userId === user.id || // Kişisel takvim
      user.managedCalendars.some((c) => c.id === calendar.id); // Yönetilen takvim

    if (!hasPermission) {
      return NextResponse.json(
        { message: 'Bu takvimde plan oluşturma yetkiniz yok' },
        { status: 403 }
      );
    }

    // Başlangıç ve bitiş tarihlerini birleştir
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    // Planı oluştur
    const plan = await prisma.plan.create({
      data: {
        title,
        description,
        startDate: startDateTime,
        endDate: endDateTime,
        location,
        onlineLink,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        price: price ? parseFloat(price) : null,
        tags,
        visibility,
        calendarId,
        creatorId: user.id,
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error('Plan oluşturma hatası:', error);
    return NextResponse.json(
      { message: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
} 