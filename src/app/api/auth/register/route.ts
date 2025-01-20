import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { username, name, email, password } = await request.json();

    if (!username || !name || !email || !password) {
      return NextResponse.json(
        { error: 'Tüm alanlar gerekli' },
        { status: 400 }
      );
    }

    // Kullanıcı adı formatını kontrol et
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: 'Kullanıcı adı 3-20 karakter arasında olmalı ve sadece harf, rakam ve alt çizgi içerebilir' },
        { status: 400 }
      );
    }

    // E-posta formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçersiz e-posta formatı' },
        { status: 400 }
      );
    }

    // Kullanıcı adı kullanımda mı kontrol et
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Bu kullanıcı adı zaten kullanımda' },
        { status: 400 }
      );
    }

    // E-posta kullanımda mı kontrol et
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kullanımda' },
        { status: 400 }
      );
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 12);

    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        username,
        name,
        email,
        password: hashedPassword,
      },
    });

    // Kişisel takvim oluştur
    await prisma.calendar.create({
      data: {
        name: 'Kişisel Takvim',
        description: 'Kişisel planlarınız için takvim',
        userId: user.id,
        isPublic: false,
      },
    });

    return NextResponse.json({
      message: 'Kayıt başarılı',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Kayıt olurken hata:', error);
    return NextResponse.json(
      { error: 'Kayıt olurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 