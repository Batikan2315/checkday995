import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // İsteği bul ve kontrol et
    const connectionRequest = await prisma.connectionRequest.findUnique({
      where: { id: params.id },
      include: {
        from: true,
      },
    });

    if (!connectionRequest) {
      return NextResponse.json(
        { error: 'Bağlantı isteği bulunamadı' },
        { status: 404 }
      );
    }

    if (connectionRequest.toId !== user.id) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    // Transaction ile isteği reddet ve bildirim oluştur
    await prisma.$transaction([
      // İsteği güncelle
      prisma.connectionRequest.update({
        where: { id: params.id },
        data: { status: 'REJECTED' },
      }),
      // Bildirim oluştur
      prisma.notification.create({
        data: {
          userId: connectionRequest.fromId,
          type: 'CONNECTION_REQUEST',
          title: 'Bağlantı İsteği Reddedildi',
          message: `${user.name || user.email} bağlantı isteğinizi reddetti`,
          data: {
            userId: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          },
        },
      }),
    ]);

    return NextResponse.json({ message: 'Bağlantı isteği reddedildi' });
  } catch (error) {
    console.error('Bağlantı isteği reddedilirken hata:', error);
    return NextResponse.json(
      { error: 'Bağlantı isteği reddedilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 