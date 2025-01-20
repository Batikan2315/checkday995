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

    // Takip kaydını bul ve sil
    const follower = await prisma.follower.findFirst({
      where: {
        userId: user.id,
        professionalCardId,
      },
    });

    if (!follower) {
      return NextResponse.json(
        { message: 'Bu profesyonel kartı zaten takip etmiyorsunuz' },
        { status: 400 }
      );
    }

    // Takipçi ve following kayıtlarını sil
    await Promise.all([
      prisma.follower.delete({
        where: { id: follower.id },
      }),
      prisma.following.deleteMany({
        where: {
          userId: user.id,
          professionalCardId,
        },
      }),
    ]);

    return NextResponse.json(
      { message: 'Profesyonel kart takipten çıkarıldı' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Takipten çıkma hatası:', error);
    return NextResponse.json(
      { message: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
} 