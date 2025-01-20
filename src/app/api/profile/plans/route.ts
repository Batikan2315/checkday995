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

    // Kullanıcının oluşturduğu planlar
    const createdPlans = await prisma.plan.findMany({
      where: { userId: user.id },
      include: {
        calendar: true,
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    // Kullanıcının katıldığı planlar
    const participatingPlans = await prisma.plan.findMany({
      where: {
        participants: {
          some: {
            userId: user.id,
            status: 'APPROVED',
          },
        },
      },
      include: {
        calendar: true,
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    // Planları formatla
    const formatPlan = (plan: any) => ({
      id: plan.id,
      title: plan.title,
      description: plan.description,
      startDate: plan.startDate,
      endDate: plan.endDate,
      location: plan.location,
      onlineLink: plan.onlineLink,
      maxParticipants: plan.maxParticipants,
      currentParticipants: plan._count.participants,
      calendar: {
        name: plan.calendar.name,
        color: plan.calendar.color || '#4F46E5',
        professionalCardName: plan.calendar.professionalCard?.name || null,
      },
    });

    return NextResponse.json({
      created: createdPlans.map(formatPlan),
      participating: participatingPlans.map(formatPlan),
    });
  } catch (error) {
    console.error('Planlar getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Planlar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 