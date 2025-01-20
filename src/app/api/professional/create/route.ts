import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(request: Request) {
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

    const data = await request.json();
    const { name, category, description, address, phone, email, website, instagram, tags } = data;

    // Zorunlu alanları kontrol et
    if (!name || !category || !description) {
      return NextResponse.json(
        { error: 'Lütfen tüm zorunlu alanları doldurun' },
        { status: 400 }
      );
    }

    // Profesyonel kartı oluştur
    const professionalCard = await prisma.professionalCard.create({
      data: {
        name,
        category,
        description,
        address,
        phone,
        email,
        website,
        instagram,
        tags,
        userId: user.id,
      },
    });

    // Kart için otomatik bir takvim oluştur
    const calendar = await prisma.calendar.create({
      data: {
        name: `${name} Takvimi`,
        description: 'Profesyonel kart için otomatik oluşturulan takvim',
        isPublic: true,
        userId: user.id,
        professionalCardId: professionalCard.id,
        color: '#4F46E5', // Varsayılan renk
      },
    });

    return NextResponse.json({
      professionalCard,
      calendar,
    });
  } catch (error) {
    console.error('Profesyonel kart oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'Profesyonel kart oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 