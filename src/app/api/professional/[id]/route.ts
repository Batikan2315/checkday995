import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.email
      ? (await prisma.user.findUnique({
          where: { email: session.user.email },
        }))?.id
      : null;

    const professionalCard = await prisma.professionalCard.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        calendars: {
          where: { isPublic: true },
          include: {
            plans: {
              where: {
                endDate: {
                  gte: new Date(),
                },
                isPublic: true,
              },
              orderBy: {
                startDate: 'asc',
              },
            },
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
    });

    if (!professionalCard) {
      return NextResponse.json(
        { message: 'Profesyonel kart bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcının bu kartı takip edip etmediğini kontrol et
    const isFollowing = userId
      ? await prisma.follower.findFirst({
          where: {
            userId,
            professionalCardId: params.id,
          },
        })
      : false;

    return NextResponse.json({
      professionalCard: {
        ...professionalCard,
        isFollowing: !!isFollowing,
      },
    });
  } catch (error: any) {
    console.error('Profesyonel kart detay hatası:', error);
    return NextResponse.json(
      { message: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
} 