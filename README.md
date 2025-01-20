# CheckDay

CheckDay, kullanıcıların sağlık, kişisel planlama ve sosyal bağlantılarını yönetebilecekleri bir web platformudur.

## Özellikler

- Kullanıcı kaydı ve kimlik doğrulama
- Takvim yönetimi
- Plan oluşturma ve katılım
- Profesyonel kart oluşturma ve takip
- Sosyal bağlantılar ve etkileşimler

## Kurulum

1. Repository'yi klonlayın:
```bash
git clone https://github.com/yourusername/checkday.git
cd checkday
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyasını oluşturun ve gerekli değişkenleri ekleyin:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/mydb"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

4. Veritabanını oluşturun:
```bash
npx prisma db push
```

5. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

## Teknolojiler

- Next.js
- TypeScript
- Prisma
- PostgreSQL
- Tailwind CSS
- NextAuth.js

## Katkıda Bulunma

1. Bu repository'yi fork edin
2. Feature branch'i oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun
