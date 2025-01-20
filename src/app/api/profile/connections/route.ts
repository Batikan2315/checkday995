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
      include: {
        connections: {
          include: {
            connectedUser: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        connectedTo: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Hem gönderilen hem alınan bağlantıları birleştir
    const connections = [
      ...user.connections.map((connection) => ({
        id: connection.connectedUser.id,
        name: connection.connectedUser.name,
        email: connection.connectedUser.email,
        image: connection.connectedUser.image,
      })),
      ...user.connectedTo.map((connection) => ({
        id: connection.user.id,
        name: connection.user.name,
        email: connection.user.email,
        image: connection.user.image,
      })),
    ];

    return NextResponse.json(connections);
  } catch (error) {
    console.error('Bağlantılar getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Bağlantılar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Bu işlem için giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const { email } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const connectedUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!connectedUser) {
      return NextResponse.json(
        { error: 'Bağlanılacak kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Önce bağlantı isteği oluştur
    const connectionRequest = await prisma.connectionRequest.create({
      data: {
        fromId: user.id,
        toId: connectedUser.id,
        status: 'PENDING',
      },
    });

    // Bildirim oluştur
    await prisma.notification.create({
      data: {
        userId: connectedUser.id,
        type: 'CONNECTION_REQUEST',
        title: 'Yeni Bağlantı İsteği',
        message: `${user.name || user.email} size bağlantı isteği gönderdi`,
        data: {
          requestId: connectionRequest.id,
          fromUser: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Bağlantı isteği gönderildi',
      requestId: connectionRequest.id,
    });
  } catch (error) {
    console.error('Bağlantı isteği gönderilirken hata:', error);
    return NextResponse.json(
      { error: 'Bağlantı isteği gönderilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 