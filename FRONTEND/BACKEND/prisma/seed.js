const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses database seeding...');

  const defaultPassword = 'Password123!';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // 1. Seed Users (4 Role: Admin, Petugas Lab, Petugas Layanan, Petugas Benih)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@brmpdiy.go.id' },
    update: {
      password_hash: hashedPassword,
      role: 'Admin',
    },
    create: {
      nama: 'Administrator BRMP DIY',
      email: 'admin@brmpdiy.go.id',
      password_hash: hashedPassword,
      role: 'Admin',
    },
  });

  const petugasLab = await prisma.user.upsert({
    where: { email: 'petugaslab@brmpdiy.go.id' },
    update: {
      password_hash: hashedPassword,
      role: 'PetugasLab',
    },
    create: {
      nama: 'Petugas Laboratorium',
      email: 'petugaslab@brmpdiy.go.id',
      password_hash: hashedPassword,
      role: 'PetugasLab',
    },
  });

  const petugasLayanan = await prisma.user.upsert({
    where: { email: 'petugaslayanan@brmpdiy.go.id' },
    update: {
      password_hash: hashedPassword,
      role: 'PetugasLayanan',
    },
    create: {
      nama: 'Petugas Layanan & Pengaduan',
      email: 'petugaslayanan@brmpdiy.go.id',
      password_hash: hashedPassword,
      role: 'PetugasLayanan',
    },
  });

  const petugasBenih = await prisma.user.upsert({
    where: { email: 'petugasbenih@brmpdiy.go.id' },
    update: {
      password_hash: hashedPassword,
      role: 'PetugasBenih',
    },
    create: {
      nama: 'Petugas Perbenihan',
      email: 'petugasbenih@brmpdiy.go.id',
      password_hash: hashedPassword,
      role: 'PetugasBenih',
    },
  });

  console.log('✅ Users (4 Role) berhasil di-seed:');
  console.log(`   - Admin: ${adminUser.email} (Password: ${defaultPassword})`);
  console.log(`   - Petugas Lab: ${petugasLab.email} (Password: ${defaultPassword})`);
  console.log(`   - Petugas Layanan: ${petugasLayanan.email} (Password: ${defaultPassword})`);
  console.log(`   - Petugas Benih: ${petugasBenih.email} (Password: ${defaultPassword})`);

  // 2. Seed Benih
  const benih1 = await prisma.benih.create({
    data: {
      nama_benih: 'Padi Inpari 32 HDB',
      deskripsi: 'Benih padi bersertifikat tahan wereng batang coklat dan penyakit hawar daun bakteri.',
      stok: 150,
      gambar_url: 'https://placehold.co/600x400?text=Padi+Inpari+32',
      created_by_id: adminUser.id,
    },
  });

  const benih2 = await prisma.benih.create({
    data: {
      nama_benih: 'Jagung Hibrida Bisi 18',
      deskripsi: 'Benih jagung hibrida potensi hasil tinggi dengan adaptasi lingkungan yang sangat baik.',
      stok: 85,
      gambar_url: 'https://placehold.co/600x400?text=Jagung+Bisi+18',
      created_by_id: adminUser.id,
    },
  });

  console.log('✅ Katalog Benih berhasil di-seed:', [benih1.nama_benih, benih2.nama_benih]);

  // 3. Seed LabTracking
  const lab1 = await prisma.labTracking.upsert({
    where: { kode_tracking: 'LAB-20260819-001' },
    update: {},
    create: {
      kode_tracking: 'LAB-20260819-001',
      nama_pemohon: 'Kelompok Tani Makmur Sejahtera',
      status_uji: 'Proses',
      keterangan: 'Sampel benih padi dalam tahap uji daya berkecambah dan kadar air.',
      petugas_id: petugasLab.id,
      tanggal_masuk: new Date(),
    },
  });

  console.log('✅ Data Lab Tracking berhasil di-seed:', lab1.kode_tracking);

  // 4. Seed Pengaduan
  const pengaduan1 = await prisma.pengaduan.upsert({
    where: { kode_tracking: 'PGD-20260819-A8F2K' },
    update: {},
    create: {
      kode_tracking: 'PGD-20260819-A8F2K',
      nama_pelapor: 'Budi Santoso',
      email_pelapor: 'budisantoso@example.com',
      no_telp_pelapor: '081234567890',
      isi_pengaduan: 'Mohon informasi jadwal ketersediaan benih kedelai untuk musim tanam mendatang di wilayah Sleman.',
      status_tanggapan: 'Diproses',
      tanggapan_petugas: 'Terima kasih atas laporannya. Tim kami sedang melakukan pengecekan stok di gudang dan akan memperbarui informasi segera.',
      ditanggapi_oleh_id: adminUser.id,
      tanggal_tanggapan: new Date(),
    },
  });

  console.log('✅ Contoh Pengaduan berhasil di-seed:', pengaduan1.kode_tracking);
  console.log('🎉 Seeding database selesai!');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
