import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.email
      ? (await prisma.user.findUnique({ where: { email: session.user.email } }))?.id
      : null;

    const plan = await prisma.plan.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan bulunamadı' },
        { status: 404 }
      );
    }

    // Eğer plan public değilse ve kullanıcı plan sahibi değilse erişimi engelle
    if (!plan.isPublic && plan.userId !== userId) {
      return NextResponse.json(
        { error: 'Bu plana erişim izniniz yok' },
        { status: 403 }
      );
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Plan detayları getirilirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
} 