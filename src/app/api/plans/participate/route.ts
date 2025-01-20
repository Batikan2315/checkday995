import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const { planId } = await request.json();
    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID gerekli' },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Planı kontrol et
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        participants: true,
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan bulunamadı' },
        { status: 404 }
      );
    }

    // Plan sahibi katılamaz
    if (plan.userId === user.id) {
      return NextResponse.json(
        { error: 'Kendi planınıza katılamazsınız' },
        { status: 400 }
      );
    }

    // Katılımcı limitini kontrol et
    if (plan.maxParticipants) {
      const approvedParticipants = plan.participants.filter(
        (p) => p.status === 'APPROVED'
      ).length;
      if (approvedParticipants >= plan.maxParticipants) {
        return NextResponse.json(
          { error: 'Plan katılımcı limiti dolmuş' },
          { status: 400 }
        );
      }
    }

    // Daha önce katılım isteği var mı kontrol et
    const existingParticipation = await prisma.planParticipant.findUnique({
      where: {
        planId_userId: {
          planId: plan.id,
          userId: user.id,
        },
      },
    });

    if (existingParticipation) {
      return NextResponse.json(
        { error: 'Zaten katılım isteği gönderilmiş' },
        { status: 400 }
      );
    }

    // Katılım isteği oluştur
    const participation = await prisma.planParticipant.create({
      data: {
        planId: plan.id,
        userId: user.id,
        status: 'PENDING',
      },
    });

    return NextResponse.json(participation);
  } catch (error) {
    console.error('Katılım isteği oluşturulurken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
} 