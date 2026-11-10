-- ============================================================
-- E-Commerce Seed Data (12 dummy products)
-- Run after 01_schema.sql in Supabase Dashboard > SQL Editor
-- Fixed UUIDs make this script safe to re-run (ON CONFLICT DO NOTHING).
-- ============================================================

insert into public.products (id, name, description, price, image_url, category, stock)
values
  -- Elektronik (4)
  (
    '11111111-1111-1111-1111-111111111101',
    'iPhone 15 Pro',
    'Smartphone flagship Apple dengan chip A17 Pro, kamera 48MP, dan bodi titanium.',
    18999000,
    'https://picsum.photos/seed/iphone15pro/400/400',
    'Elektronik',
    25
  ),
  (
    '11111111-1111-1111-1111-111111111102',
    'Samsung Galaxy S24',
    'Smartphone Android premium dengan layar Dynamic AMOLED dan Galaxy AI.',
    14999000,
    'https://picsum.photos/seed/galaxys24/400/400',
    'Elektronik',
    30
  ),
  (
    '11111111-1111-1111-1111-111111111103',
    'MacBook Air M3',
    'Laptop tipis ringan dengan chip Apple M3, cocok untuk produktivitas dan kreativitas.',
    16499000,
    'https://picsum.photos/seed/macbookairm3/400/400',
    'Elektronik',
    15
  ),
  (
    '11111111-1111-1111-1111-111111111104',
    'Sony WH-1000XM5',
    'Headphone wireless dengan noise cancelling terbaik dan baterai tahan lama.',
    4999000,
    'https://picsum.photos/seed/sonywh1000xm5/400/400',
    'Elektronik',
    50
  ),

  -- Fashion (4)
  (
    '22222222-2222-2222-2222-222222222201',
    'Kaos Polos Premium',
    'Kaos katun combed 30s yang nyaman dan adem untuk pemakaian harian.',
    99000,
    'https://picsum.photos/seed/kaospolos/400/400',
    'Fashion',
    120
  ),
  (
    '22222222-2222-2222-2222-222222222202',
    'Kemeja Flanel',
    'Kemeja flanel motif kotak-kotak dengan bahan lembut, cocok untuk gaya kasual.',
    189000,
    'https://picsum.photos/seed/kemejaflanel/400/400',
    'Fashion',
    80
  ),
  (
    '22222222-2222-2222-2222-222222222203',
    'Jaket Denim',
    'Jaket denim unisex dengan potongan klasik dan jahitan kuat.',
    349000,
    'https://picsum.photos/seed/jaketdenim/400/400',
    'Fashion',
    60
  ),
  (
    '22222222-2222-2222-2222-222222222204',
    'Sneakers Canvas',
    'Sepatu sneakers canvas ringan dengan sol karet anti-slip.',
    299000,
    'https://picsum.photos/seed/sneakerscanvas/400/400',
    'Fashion',
    75
  ),

  -- Buku (4)
  (
    '33333333-3333-3333-3333-333333333301',
    'Laskar Pelangi',
    'Novel karya Andrea Hirata tentang perjuangan anak-anak Belitung menempuh pendidikan.',
    85000,
    'https://picsum.photos/seed/laskarpelangi/400/400',
    'Buku',
    100
  ),
  (
    '33333333-3333-3333-3333-333333333302',
    'Bumi Manusia',
    'Novel sejarah karya Pramoedya Ananta Toer, bagian pertama Tetralogi Buru.',
    120000,
    'https://picsum.photos/seed/bumimanusia/400/400',
    'Buku',
    90
  ),
  (
    '33333333-3333-3333-3333-333333333303',
    'Atomic Habits',
    'Buku pengembangan diri karya James Clear tentang membangun kebiasaan kecil.',
    135000,
    'https://picsum.photos/seed/atomichabits/400/400',
    'Buku',
    110
  ),
  (
    '33333333-3333-3333-3333-333333333304',
    'Clean Code',
    'Panduan menulis kode yang bersih dan mudah dipelihara karya Robert C. Martin.',
    250000,
    'https://picsum.photos/seed/cleancode/400/400',
    'Buku',
    40
  )
on conflict (id) do nothing;
