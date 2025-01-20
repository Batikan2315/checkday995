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

    // Gelen bağlantı isteklerini getir
    const requests = await prisma.connectionRequest.findMany({
      where: {
        toId: user.id,
        status: 'PENDING',
      },
      include: {
        from: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      requests.map((request) => ({
        id: request.id,
        fromUser: {
          id: request.from.id,
          name: request.from.name,
          email: request.from.email,
          image: request.from.image,
        },
        status: request.status,
        createdAt: request.createdAt,
      }))
    );
  } catch (error) {
    console.error('Bağlantı istekleri getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Bağlantı istekleri getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 