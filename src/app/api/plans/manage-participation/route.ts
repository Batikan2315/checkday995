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

    const { participationId, action } = await request.json();
    if (!participationId || !action) {
      return NextResponse.json(
        { error: 'Katılım ID ve aksiyon gerekli' },
        { status: 400 }
      );
    }

    if (action !== 'APPROVE' && action !== 'REJECT') {
      return NextResponse.json(
        { error: 'Geçersiz aksiyon' },
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

    // Katılım isteğini bul
    const participation = await prisma.planParticipant.findUnique({
      where: { id: participationId },
      include: {
        plan: true,
      },
    });

    if (!participation) {
      return NextResponse.json(
        { error: 'Katılım isteği bulunamadı' },
        { status: 404 }
      );
    }

    // Plan sahibi olup olmadığını kontrol et
    if (participation.plan.userId !== user.id) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    // Katılımcı limitini kontrol et
    if (action === 'APPROVE' && participation.plan.maxParticipants) {
      const approvedParticipants = await prisma.planParticipant.count({
        where: {
          planId: participation.planId,
          status: 'APPROVED',
        },
      });

      if (approvedParticipants >= participation.plan.maxParticipants) {
        return NextResponse.json(
          { error: 'Plan katılımcı limiti dolmuş' },
          { status: 400 }
        );
      }
    }

    // Katılım durumunu güncelle
    const updatedParticipation = await prisma.planParticipant.update({
      where: { id: participationId },
      data: {
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      },
    });

    return NextResponse.json(updatedParticipation);
  } catch (error) {
    console.error('Katılım isteği güncellenirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
} 