import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const { professionalCardId } = await request.json();

    if (!professionalCardId) {
      return NextResponse.json(
        { message: 'Profesyonel kart ID\'si gerekli' },
        { status: 400 }
      );
    }

    // Profesyonel kartın varlığını kontrol et
    const professionalCard = await prisma.professionalCard.findUnique({
      where: { id: professionalCardId },
    });

    if (!professionalCard) {
      return NextResponse.json(
        { message: 'Profesyonel kart bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcının kendisini takip etmesini engelle
    if (professionalCard.userId === user.id) {
      return NextResponse.json(
        { message: 'Kendinizi takip edemezsiniz' },
        { status: 400 }
      );
    }

    // Zaten takip ediyor mu kontrol et
    const existingFollower = await prisma.follower.findFirst({
      where: {
        userId: user.id,
        professionalCardId,
      },
    });

    if (existingFollower) {
      return NextResponse.json(
        { message: 'Bu profesyonel kartı zaten takip ediyorsunuz' },
        { status: 400 }
      );
    }

    // Takipçi oluştur
    const follower = await prisma.follower.create({
      data: {
        userId: user.id,
        professionalCardId,
      },
    });

    // Following kaydı oluştur
    const following = await prisma.following.create({
      data: {
        userId: user.id,
        professionalCardId,
      },
    });

    return NextResponse.json(
      {
        message: 'Profesyonel kart başarıyla takip edildi',
        follower,
        following,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Takip etme hatası:', error);
    return NextResponse.json(
      { message: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
} 