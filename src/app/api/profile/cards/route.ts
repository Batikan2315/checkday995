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

    // Kullanıcının oluşturduğu ve takip ettiği kartları getir
    const [managedCards, followedCards] = await Promise.all([
      // Yönetilen kartlar
      prisma.professionalCard.findMany({
        where: { userId: user.id },
        include: {
          _count: {
            select: {
              followers: true,
              calendars: true,
            },
          },
          calendars: {
            select: {
              id: true,
              name: true,
              isPublic: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      // Takip edilen kartlar
      prisma.professionalCard.findMany({
        where: {
          followers: {
            some: {
              userId: user.id,
            },
          },
        },
        include: {
          _count: {
            select: {
              followers: true,
              calendars: true,
            },
          },
          calendars: {
            where: { isPublic: true },
            select: {
              id: true,
              name: true,
              isPublic: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Kartları formatla
    const formatCard = (card: any) => ({
      id: card.id,
      name: card.name,
      category: card.category,
      description: card.description,
      address: card.address,
      phone: card.phone,
      email: card.email,
      website: card.website,
      instagram: card.instagram,
      followersCount: card._count.followers,
      calendarsCount: card._count.calendars,
      calendars: card.calendars,
    });

    return NextResponse.json({
      managed: managedCards.map(formatCard),
      followed: followedCards.map(formatCard),
    });
  } catch (error) {
    console.error('Profesyonel kartlar listelenirken hata:', error);
    return NextResponse.json(
      { error: 'Profesyonel kartlar listelenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 