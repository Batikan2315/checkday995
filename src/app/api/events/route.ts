import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Bu işlem için giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcının görebileceği tüm planları getir
    const plans = await prisma.plan.findMany({
      where: {
        OR: [
          // Kullanıcının kendi planları
          { userId: user.id },
          // Katıldığı planlar
          {
            participants: {
              some: {
                userId: user.id,
                status: 'APPROVED',
              },
            },
          },
          // Takip ettiği profesyonel kartların public planları
          {
            calendar: {
              professionalCard: {
                followers: {
                  some: {
                    userId: user.id,
                  },
                },
              },
              isPublic: true,
            },
            isPublic: true,
          },
        ],
      },
      include: {
        calendar: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    // Planları takvim formatına dönüştür
    const events = plans.map(plan => ({
      id: plan.id,
      title: plan.title,
      start: plan.startDate,
      end: plan.endDate,
      calendarId: plan.calendarId,
      calendarName: plan.calendar.name,
      color: '#4F46E5',
      professionalCardName: plan.calendar.professionalCardId ? 'Profesyonel Etkinlik' : null,
    }));

    return NextResponse.json(events);
  } catch (error) {
    console.error('Etkinlikler getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Etkinlikler getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 