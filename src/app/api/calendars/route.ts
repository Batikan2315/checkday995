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

    // Kullanıcının kişisel takvimlerini ve takip ettiği profesyonel kartların takvimlerini getir
    const calendars = await prisma.calendar.findMany({
      where: {
        OR: [
          // Kişisel takvimler
          { userId: user.id },
          // Takip edilen profesyonel kartların takvimleri
          {
            professionalCard: {
              followers: {
                some: {
                  userId: user.id,
                },
              },
            },
            isPublic: true,
          },
        ],
      },
      include: {
        professionalCard: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Takvimleri formatla
    const formattedCalendars = calendars.map(calendar => ({
      id: calendar.id,
      name: calendar.name,
      description: calendar.description,
      isPublic: calendar.isPublic,
      professionalCardName: calendar.professionalCard?.name || null,
    }));

    return NextResponse.json(formattedCalendars);
  } catch (error) {
    console.error('Takvimler listelenirken hata:', error);
    return NextResponse.json(
      { error: 'Takvimler listelenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 