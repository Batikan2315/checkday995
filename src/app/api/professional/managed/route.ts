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

    // Kullanıcının yönettiği kartları getir
    const professionalCards = await prisma.professionalCard.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { followers: true },
        },
        calendars: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Takipçi sayısını ekleyerek kartları formatla
    const formattedCards = professionalCards.map(card => ({
      id: card.id,
      name: card.name,
      category: card.category,
      description: card.description,
      followersCount: card._count.followers,
      calendars: card.calendars,
    }));

    return NextResponse.json(formattedCards);
  } catch (error) {
    console.error('Profesyonel kartlar listelenirken hata:', error);
    return NextResponse.json(
      { error: 'Profesyonel kartlar listelenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 