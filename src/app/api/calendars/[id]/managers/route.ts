import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// Yöneticileri listele
export async function GET(
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

    const calendar = await prisma.calendar.findUnique({
      where: { id: params.id },
      include: {
        managers: {
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

    if (!calendar) {
      return NextResponse.json(
        { error: 'Takvim bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      calendar.managers.map((manager) => ({
        id: manager.user.id,
        name: manager.user.name,
        email: manager.user.email,
        image: manager.user.image,
      }))
    );
  } catch (error) {
    console.error('Yöneticiler listelenirken hata:', error);
    return NextResponse.json(
      { error: 'Yöneticiler listelenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Yönetici ekle
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

    // Takvimi kontrol et
    const calendar = await prisma.calendar.findUnique({
      where: { id: params.id },
      include: {
        professionalCard: true,
      },
    });

    if (!calendar) {
      return NextResponse.json(
        { error: 'Takvim bulunamadı' },
        { status: 404 }
      );
    }

    // Takvimin sahibi veya profesyonel kartın yöneticisi olduğunu kontrol et
    const isProfessionalCardManager = calendar.professionalCard
      ? await prisma.professionalCardManager.findFirst({
          where: {
            professionalCardId: calendar.professionalCard.id,
            userId: user.id,
          },
        })
      : false;

    if (calendar.userId !== user.id && !isProfessionalCardManager) {
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
    const manager = await prisma.calendarManager.create({
      data: {
        calendarId: params.id,
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