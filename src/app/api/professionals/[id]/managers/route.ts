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

    const { email } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        connections: {
          include: {
            connectedUser: true,
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

    // Profesyonel kartı kontrol et
    const professionalCard = await prisma.professionalCard.findUnique({
      where: { id: params.id },
    });

    if (!professionalCard) {
      return NextResponse.json(
        { error: 'Profesyonel kart bulunamadı' },
        { status: 404 }
      );
    }

    // Kartın sahibi olduğunu kontrol et
    if (professionalCard.userId !== user.id) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    // Eklenecek kullanıcıyı bul
    const managerUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!managerUser) {
      return NextResponse.json(
        { error: 'Eklenecek kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcının bağlantılarında olup olmadığını kontrol et
    const isConnection = user.connections.some(
      (connection) => connection.connectedUser.id === managerUser.id
    );

    if (!isConnection) {
      return NextResponse.json(
        { error: 'Sadece bağlantılarınızı yönetici olarak ekleyebilirsiniz' },
        { status: 403 }
      );
    }

    // Yönetici olarak ekle
    const manager = await prisma.professionalCardManager.create({
      data: {
        professionalCardId: params.id,
        userId: managerUser.id,
      },
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
    });

    return NextResponse.json({
      id: manager.user.id,
      name: manager.user.name,
      email: manager.user.email,
      image: manager.user.image,
    });
  } catch (error) {
    console.error('Yönetici eklenirken hata:', error);
    return NextResponse.json(
      { error: 'Yönetici eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 