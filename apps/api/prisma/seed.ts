import {
  Category,
  Inventory,
  PrismaClient,
  Product,
  Store,
  User,
  ValueType,
  Voucher,
  VoucherType,
} from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { add } from 'date-fns/add';
import { config } from 'dotenv';
import { resolve } from 'path';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();
const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
});

async function SEED_SUPER_ADMIN() {
  const ctx = await auth.$context;

  const superemail = 'super.gogrocery@mailinator.com';
  const superpassword = '@Password123';
  const supername = 'Super Admin Gogrocery';

  const superadmin = await prisma.user.create({
    data: {
      email: superemail,
      emailVerified: true,
      name: supername,
      role: 'SUPER',
      signupMethod: {
        set: ['CREDENTIAL'],
      },
    },
  });

  await prisma.account.create({
    data: {
      accountId: superadmin.id,
      userId: superadmin.id,
      providerId: 'credential',
      password: await ctx.password.hash(superpassword),
    },
  });

  return { superId: superadmin.id };
}

async function SEED_STORE_ADMIN() {
  const datas = [
    {
      email: 'john.gogrocery@mailinator.com',
      name: 'John Doe',
    },
    {
      email: 'alice.gogrocery@mailinator.com',
      name: 'Alice Chan',
    },
    {
      email: 'edward.gogrocery@mailinator.com',
      name: 'Edward JS',
    },
    {
      email: 'theflash.gogrocery@mailinator.com',
      name: 'The Flash',
    },
    {
      email: 'thebatman.gogrocery@mailinator.com',
      name: 'The Batman',
    },
    {
      email: 'sherri.gogrocery@mailinator.com',
      name: 'Sherri Hammond',
    },
    {
      email: 'thehash.gogrocery@mailinator.com',
      name: 'The Hash Slinging Slasher',
    },
    {
      email: 'jeromy.gogrocery@mailinator.com',
      name: 'Jeromy Gibson',
    },
    {
      email: 'tamera.gogrocery@mailinator.com',
      name: 'Tamera Odonnell',
    },
    {
      email: 'bert.gogrocery@mailinator.com',
      name: 'Bert Mcneil',
    },
    {
      email: 'arthur.gogrocery@mailinator.com',
      name: 'Arthur Wallace',
    },
  ];

  const ctx = await auth.$context;

  const admins: User[] = [];
  for (const data of datas) {
    const admin = await prisma.user.create({
      data: {
        email: data.email,
        emailVerified: true,
        name: data.name,
        role: 'ADMIN',
        signupMethod: {
          set: ['CREDENTIAL'],
        },
      },
    });
    await prisma.account.create({
      data: {
        accountId: admin.id,
        userId: admin.id,
        providerId: 'credential',
        password: await ctx.password.hash('@Password123'),
      },
    });
    admins.push(admin);
  }

  return admins;
}

async function SEED_USER() {
  const datas = [
    {
      email: 'luffy.gogrocery@mailinator.com',
      name: 'Monkey D Luffy',
    },
    {
      email: 'naruto.gogrocery@mailinator.com',
      name: 'Uzumaki Naruto',
    },
  ];

  const genReffCode = async () => {
    for (let attempt = 0; attempt < 10; attempt++) {
      const code = `REFFCODE-${uuid().replace(/-/g, '').substring(0, 10).toUpperCase()}`;
      const exist = await prisma.user.findUnique({
        where: {
          referralCode: code,
        },
      });
      if (!exist) {
        return code;
      }
    }
    throw new Error('Failed to generate a unique referral code.');
  };

  const ctx = await auth.$context;

  const users: User[] = [];
  for (const data of datas) {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        emailVerified: true,
        name: data.name,
        role: 'USER',
        signupMethod: {
          set: ['CREDENTIAL'],
        },
        referralCode: await genReffCode(),
      },
    });
    await prisma.account.create({
      data: {
        accountId: user.id,
        userId: user.id,
        providerId: 'credential',
        password: await ctx.password.hash('@Password123'),
      },
    });
    users.push(user);
  }

  return users;
}

async function SEED_PRODUCT_CATEGORY() {
  // NOTE: if you change the order, please also change the order too on
  // product seed!
  const datas = [
    {
      name: 'Buah',
      image: '/product-categories/fruits.png',
    },
    {
      name: 'Sayuran',
      image: '/product-categories/vegetables.png',
    },
    {
      name: 'Daging & Seafood',
      image: '/product-categories/meat-and-fish.png',
    },
    {
      name: 'Minuman',
      image: '/product-categories/beverages.png',
    },
    {
      name: 'Makanan Ringan',
      image: '/product-categories/snacks.png',
    },
    {
      name: 'Kebutuhan Dapur',
      image: '/product-categories/kitchen-essentials.png',
    },
    {
      name: 'Ibu & Anak',
      image: '/product-categories/mom-and-baby.png',
    },
    {
      name: 'Kebutuhan Rumah',
      image: '/product-categories/household.png',
    },
    {
      name: 'Perawatan Diri',
      image: '/product-categories/personal-care.png',
    },
    {
      name: 'Lifestyle',
      image: '/product-categories/lifestyle.png',
    },
    {
      name: 'Kesehatan & Kebugaran',
      image: '/product-categories/health-and-wellness.png',
    },
    {
      name: 'Perlengkapan Hewan',
      image: '/product-categories/pet-supplies.png',
    },
  ];

  let result: Category[] = [];
  for (const data of datas) {
    const category = await prisma.category.create({
      data: {
        name: data.name,
        image: data.image,
      },
    });
    result.push(category);
  }
  return result;
}

async function SEED_PRODUCT(categories: Category[]) {
  const [
    buah,
    sayuran,
    daging_seafood,
    minuman,
    makanan_ringan,
    kebutuhan_dapur,
    ibu_anak,
    kebutuhan_rumah,
    perawatan_diri,
    lifestyle,
    kesehatan_kebugaran,
    perlengkapan_hewan,
  ] = categories;

  const genSKU = async () => {
    for (let attempt = 0; attempt < 10; attempt++) {
      const sku = uuid().trim().toUpperCase().slice(0, 18);
      const exist = await prisma.product.findUnique({
        where: {
          sku: sku,
        },
      });
      if (!exist) {
        return sku;
      }
    }

    throw new Error('Failed to generate a unique SKU code.');
  };

  const datas: {
    name: string;
    description: string;
    price: number;
    weight: number;
    categoryId: string;
    images: string[];
  }[] = [
    /* -------------------------- Buah buahan ------------------------- */
    {
      name: 'Buah Naga Merah',
      description:
        'Buah naga dengan daging buah berwarna merah. Rasanya ringan cenderung manis. Teksturnya lembut. Cocok untuk camilan atau bekal. Dapat diolah menjadi jus atau digunakan sebagai pewarna merah alami dalam kreasi makanan atau kue.',
      price: 20000,
      weight: 1,
      categoryId: buah.id,
      images: [
        '/product/buah/buah-naga-01.webp',
        '/product/buah/buah-naga-02.webp',
      ],
    },
    {
      name: 'Pisang Cavendish',
      description:
        'Pisang cavendish memiliki tekstur yang lembut dan rasanya manis. Cocok untuk sarapan, bekal, atau sebagai topping smoothies dan makanan lainnya. Kulit pisang cenderung kuning mulus, namun ada juga yang memiliki sedikit bercak hitam. Produk ini dapat digunakan sebagai menu MPASI. Tunggu 2-3 hari agar matang sempurna.',
      price: 10000,
      weight: 1,
      categoryId: buah.id,
      images: [
        '/product/buah/pisang-candevish-01.webp',
        '/product/buah/pisang-candevish-02.webp',
      ],
    },
    {
      name: 'Kelapa Hijau',
      description:
        'Kelapa Ijo memiliki kulit berwarna hijau, memiliki semburat pink saat dikupas. Cenderung tidak memiliki daging buah dengan peruntukan dikonsumsi airnya.',
      price: 15000,
      weight: 1.5,
      categoryId: buah.id,
      images: [
        '/product/buah/kelapa-hijau-01.webp',
        '/product/buah/kelapa-hijau-02.webp',
      ],
    },
    {
      name: 'Strawberry Sweetheart',
      description:
        'Ditanam secara hidroponik. Lebih segar, sehat, dan berkualitas. Strawberry sweetheart memiliki bentuk yang unik dan warna merah yang menggugah selera. Daging buah juicy dengan rasa yang segar. Cocok untuk camilan, selai, smoothies, jus, dan berbagai kreasi lainnya.',
      price: 14900,
      weight: 0.125,
      categoryId: buah.id,
      images: [
        '/product/buah/strawberry-sweetheart-01.webp',
        '/product/buah/strawberry-sweetheart-02.webp',
      ],
    },
    {
      name: 'Strawberry Golden Berries',
      description:
        'Ditanam secara hidroponik. Lebih segar, sehat, dan berkualitas. Strawberry Golden Berries Hidroponik memiliki warna merah dengan biji kuning kecil. Daging buah juicy dengan rasa manis cenderung asam segar. Cocok untuk camilan, selai, smoothies, jus, dan berbagai kreasi lainnya.',

      price: 43200,
      weight: 0.25,
      categoryId: buah.id,
      images: [
        '/product/buah/strawberry-golden-berries-01.webp',
        '/product/buah/strawberry-golden-berries-02.webp',
      ],
    },
    {
      name: 'Blackberry Hidroponik',
      description:
        'Blackberry memiliki ukuran yang kecil dan rasa asam manis yang segar. Buah ini ditanam secara hodroponik, sehingga memberikan kualitas dan rasa buah blackberry terbaik.',

      price: 51900,
      weight: 0.125,
      categoryId: buah.id,
      images: [
        '/product/buah/blackberry-hidroponik-01.webp',
        '/product/buah/blackberry-hidroponik-02.webp',
      ],
    },
    {
      name: 'Jeruk Papagan',
      description:
        'Jeruk Papagan merupakan salah satu jeruk mandarin yang memiliki perpaduan rasa manis dan keasaman yang menyegarkan. Karakteristik kulit buah yang berwarna oranye cerah dengan tekstur juicy dan berair. Cocok untuk dikonsumsi secara langsung maupun diolah menjadi jus.',

      price: 56000,
      weight: 0.5,
      categoryId: buah.id,
      images: [
        '/product/buah/jeruk-papagan-01.webp',
        '/product/buah/jeruk-papagan-02.webp',
      ],
    },
    {
      name: 'Anggur Hitam Melody',
      description:
        'Anggur hitam impor yang memiliki rasa manis dengan tekstur yang padat dan lembut. Cenderung tidak memiliki biji atau berbiji sedikit.',

      price: 20200,
      weight: 0.25,
      categoryId: buah.id,
      images: [
        '/product/buah/anggur-hitam-melody-01.webp',
        '/product/buah/anggur-hitam-melody-02.webp',
      ],
    },
    {
      name: 'Blueberry Golden Berries',
      description:
        'Blueberry Golden Berries memiliki rasa manis agak asam yang menyegarkan. Dapat dimakan sebagai camilan sehat atau makanan pencuci mulut, dibuat selai, ditambahkan sebagai topping oat, smoothies, dan lain-lain sesuai selera.',

      price: 115000,
      weight: 0.125,
      categoryId: buah.id,
      images: [
        '/product/buah/blueberry-golden-berries-01.webp',
        '/product/buah/blueberry-golden-berries-02.webp',
      ],
    },
    {
      name: 'Durian Medan Frozen',
      description:
        'Durian Medan dengan Brand Ucok Durian yang memiliki rasa cenderung manis legit. Dengan aroma yang tidak terlalu tajam. Cocok untuk dimakan langsung atau diolah menjadi berbagai macam kudapan.',

      price: 87300,
      weight: 0.45,
      categoryId: buah.id,
      images: [
        '/product/buah/durian-medan-01.webp',
        '/product/buah/durian-medan-02.webp',
      ],
    },

    /* ---------------------------- Sayuran --------------------------- */
    {
      name: 'Bawang Bombay',
      description:
        'Bawang bombay memiliki rasa agak pedas gurih dan teksturnya renyah. Cocok untuk teriyaki, onion ring, dan berbagai kreasi masakan lainnya. Terdapat potensi kelebihan/kekurangan gramasi +-10% per pack',

      price: 22000,
      weight: 0.5,
      categoryId: sayuran.id,
      images: [
        '/product/sayuran/bawang-bombai-01.webp',
        '/product/sayuran/bawang-bombai-02.webp',
      ],
    },
    {
      name: 'Bawang Merah',
      description:
        'Bawang Merah pilihan yang diproses khusus dan lebih kering dari bawang merah biasa, sehingga tidak mudah busuk dan tahan lebih dari 1 minggu di suhu ruang. Bawang Merah Konvensional lebih wangi dan pedas dibandingkan Bawang Merah Besar dan memiliki ukuran lebih beragam. Pengiriman sesuai ketersediaan dari petani di daerah Brebes, Nganjuk, atau Batu.',

      price: 7600,
      weight: 0.1,
      categoryId: sayuran.id,
      images: [
        '/product/sayuran/bawang-merah-01.webp',
        '/product/sayuran/bawang-merah-02.webp',
      ],
    },
    {
      name: 'Bawang Putih',
      description:
        'Bawang putih bulat utuh pilihan terbaik. Lebih tahan lama. Aromanya khas dan membuat rasa masakan lebih sedap. Terdapat potensi kelebihan/kekurangan gramasi +-10% per pack Produk ini dapat digunakan sebagai menu MPASI',

      price: 6000,
      weight: 0.1,
      categoryId: sayuran.id,
      images: [
        '/product/sayuran/bawang-putih-01.webp',
        '/product/sayuran/bawang-putih-02.webp',
      ],
    },
    {
      name: 'Bayam Hijau',
      description:
        'Sedang low season, ukuran beragam dan sedikit berlubang. Namun rasa dan manfaatnya tetap sama. Cocok untuk sayur bening, tumis bayam jagung, omelet, keripik bayam, dan lain-lain. 300 gr bayam hijau dapat menjadi satu gelas bayam masak. Terdapat potensi kelebihan/kekurangan gramasi +-10% per pack.',

      price: 5900,
      weight: 0.25,
      categoryId: sayuran.id,
      images: [
        '/product/sayuran/bayam-hijau-01.webp',
        '/product/sayuran/bayam-hijau-02.webp',
      ],
    },
    {
      name: 'Brokoli',
      description:
        'Brokoli konvensional memiliki warna hijau segar. Cocok diolah sebagai sup, dimasak saus, capcay, atau tumisan lainnya. Dapat dikreasikan dengan cara dikukus, digoreng, atau dibakar sesuai selera. Terdapat potensi kelebihan/kekurangan gramasi +-10% per pack Produk ini dapat digunakan sebagai menu MPASI.',

      price: 24300,
      weight: 0.5,
      categoryId: sayuran.id,
      images: [
        '/product/sayuran/brokoli-01.webp',
        '/product/sayuran/brokoli-02.webp',
      ],
    },
    {
      name: 'Buncis Afrika',
      description:
        'Buncis memiliki rasa yang sedikit manis dibandingkan kacang panjang. Teksturnya renyah. Cocok diolah sebagai tumisan, sop, atau direbus sebentar dan disajikan bersama steak. Bentuknya agak melengkung atau lurus. Warna kulit buncis bervariasi antara hijau muda hingga hijau tua. Pengiriman random sesuai ketersediaan di petani. Terdapat potensi kelebihan/kekurangan gramasi +-10% per pack Produk ini dapat digunakan sebagai menu MPASI',

      price: 7300,
      weight: 0.25,
      categoryId: sayuran.id,
      images: [
        '/product/sayuran/buncis-01.webp',
        '/product/sayuran/buncis-02.webp',
      ],
    },
    {
      name: 'Cabai Merah Keriting',
      description:
        'Cabai merah keriting memiliki ukuran kecil, bentuk memanjang, dan permukaan yang tidak rata. Umumnya digunakan sebagai penambah rasa pedas atau pewarna merah pada masakan. Cabai Keriting Ekonomis disarankan untuk segera diolah dan tidak disimpan lebih dari 2 hari. Terdapat potensi kelebihan/kekurangan gramasi +-10% per pack',

      price: 5100,
      weight: 0.1,
      categoryId: sayuran.id,
      images: [
        '/product/sayuran/cabai-merah-01.webp',
        '/product/sayuran/cabai-merah-02.webp',
      ],
    },
    {
      name: 'Jagung Manis Kulit',
      description:
        'Jagung manis memiliki rasa yang lebih manis dari jagung biasa. Khususnya setelah dimasak. Biasa digunakan dalam berbagai masakan atau diolah sebagai jagung bakar. Masih memiliki kulit luar berwarna hijau - putih. Sehingga lebih awet dan tahan lama untuk disimpan. Terdapat potensi kelebihan/kekurangan gramasi +-10% per pack Produk ini dapat digunakan sebagai menu MPASI',

      price: 6500,
      weight: 1,
      categoryId: sayuran.id,
      images: [
        '/product/sayuran/jagung-manis-01.webp',
        '/product/sayuran/jagung-manis-02.webp',
      ],
    },
    {
      name: 'Kentang Dieng',
      description:
        'Kentang asal Dieng, Jawa Tengah ini memiliki ukuran yang lebih besar dari kentang biasa. Dagingnya berwarna kuning ke-emasan dan teksturnya lebih lembut. Kandungan airnya yang cukup rendah membuat kentang ini cocok diolah menjadi berbagai jenis masakan karena tidak gampang hancur Terdapat potensi kelebihan/kekurangan gramasi +-10% per pack Produk ini dapat digunakan sebagai menu MPASI',

      price: 21300,
      weight: 1,
      categoryId: sayuran.id,
      images: [
        '/product/sayuran/kentang-dieng-01.webp',
        '/product/sayuran/kentang-dieng-02.webp',
      ],
    },
    {
      name: 'Wortel Berastagi',
      description:
        'Wortel berastagi memiliki bentuk yang lebih gemuk, kulitnya lebih mulus dan cerah, teksturnya renyah, dan rasanya manis. Dapat diolah sebagai camilan sehat, sup, tumisan, salad, jus, dan lain-lain. Produk ini dapat digunakan sebagai menu MPASI. Terdapat potensi kelebihan/kekurangan gramasi +-10% per pack',

      price: 21500,
      weight: 1,
      categoryId: sayuran.id,
      images: [
        '/product/sayuran/wortel-bastaragi-01.webp',
        '/product/sayuran/wortel-bastaragi-02.webp',
      ],
    },

    /* ---------------------- daging dan seafood ---------------------- */
    {
      name: 'Ikan Dori Fillet',
      description:
        'Ikan dori lokal atau ikan patin fillet tanpa duri. Lebih mudah diolah sebagai fish and chips atau kreasi masakan lainnya.',

      price: 20900,
      weight: 0.25,
      categoryId: daging_seafood.id,
      images: [
        '/product/daging-seafood/ikan-dori-fillet-01.webp',
        '/product/daging-seafood/ikan-dori-fillet-02.webp',
      ],
    },
    {
      name: 'Fillet Dada Ayam Frozen Sreeya',
      description:
        'Dada Ayam Frozen ini diproses dan dikemas langsung secara higenis untuk menjaga kualitas dan kesegaran. Tekstur bagian dada ini lebih kenyal dan elastis.',

      price: 32000,
      weight: 1,
      categoryId: daging_seafood.id,
      images: [
        '/product/daging-seafood/fillet-dada-ayam-01.webp',
        '/product/daging-seafood/fillet-dada-ayam-02.webp',
      ],
    },
    {
      name: 'Sayap Ayam',
      description:
        'Sayap ini diproses dan dikemas langsung secara higenis untuk menjaga kualitas dan kesegaran. Tekstur bagian sayap ini lebih kenyal dan elastis',

      price: 29900,
      weight: 0.5,
      categoryId: daging_seafood.id,
      images: [
        '/product/daging-seafood/sayap-ayam-01.webp',
        '/product/daging-seafood/sayap-ayam-02.webp',
      ],
    },
    {
      name: 'Urat Sapi Berkat',
      description:
        'Urat Sapi Berkat ini diproses dan dikemas langsung secara higenis untuk menjaga kualitas dan kesegaran. Tekstur ini lebih kenyal dan elastis',

      price: 77900,
      weight: 1,
      categoryId: daging_seafood.id,
      images: [
        '/product/daging-seafood/urat-sapi-01.webp',
        '/product/daging-seafood/urat-sapi-02.webp',
      ],
    },
    {
      name: 'Cumi Merah Besar',
      description:
        'Cumi merah besar segar, tidak beku. Panjang cumi 5-8 cm. Cocok untuk cumi asam manis, tumis cabe merah ijo, cumi goreng, saus tiram, dll.',

      price: 67500,
      weight: 1,
      categoryId: daging_seafood.id,
      images: [
        '/product/daging-seafood/cumi-merah-01.webp',
        '/product/daging-seafood/cumi-merah-02.webp',
      ],
    },
    {
      name: 'Ikan Tuna Loin',
      description:
        'Ikan tuna lokal beku potongan fillet. Tanpa duri. Dapat dimasak bumbu pedas, bumbu kecap, kuah asam pedas, dan lain sebagainya. Berat produk dapat berkurang 10% dari berat beku.',

      price: 52500,
      weight: 1,
      categoryId: daging_seafood.id,
      images: [
        '/product/daging-seafood/ikan-tuna-loin-01.webp',
        '/product/daging-seafood/ikan-tuna-loin-02.webp',
      ],
    },
    {
      name: 'Udang Vaname Kupas',
      description:
        'Sudah kupas kulit, dan buang ekor serta kepala. Lebih praktis dan mudah diolah. Udang  ini direndam dengan air panas untuk melepaskan cangkang dan kepalanya, tetapi kondisinya masih mentah sehingga perlu diolah kembali untuk proses pematangannya.',

      price: 77900,
      weight: 1,
      categoryId: daging_seafood.id,
      images: [
        '/product/daging-seafood/udang-faname-kupas-01.webp',
        '/product/daging-seafood/udang-faname-kupas-02.webp',
      ],
    },
    {
      name: 'Lamb Chop',
      description:
        'Potongan daging domba muda bagian punggung yang di potong tegak lurus. Dapat dimasak steak atau dioven dengan bumbu barbekyu.',

      price: 109900,
      weight: 1,
      categoryId: daging_seafood.id,
      images: ['/product/daging-seafood/lamb-chop-01.webp'],
    },
    {
      name: 'Cumi Tube Kupas Golden Seafood',
      description:
        'Cumi tube lokal beku atau cumi kupas fillet. Sudah bersih. Tanpa kepala dan isi perut. Berat produk dapat berkurang 10% dari berat beku.',

      price: 49900,
      weight: 1,
      categoryId: daging_seafood.id,
      images: [
        '/product/daging-seafood/cumi-tube-01.webp',
        '/product/daging-seafood/cumi-tube-02.webp',
      ],
    },
    {
      name: 'Telur Ayam Negeri',
      description:
        'Telur Ayam Negeri 100% Tersertifikasi NKV dan berasal dari ayam lokal pilihan. Nomor Kontrol Veteriner (NKV) adalah sertifikat telah dipenuhinya persyaratan higiene dan sanitasi sebagai jaminan keamanan produk hewan pada unit usaha produk hewan. Produk ini dapat digunakan sebagai menu MPASI.',

      price: 22800,
      weight: 1,
      categoryId: daging_seafood.id,
      images: [
        '/product/daging-seafood/telur-ayam-negeri-01.webp',
        '/product/daging-seafood/telur-ayam-negeri-02.webp',
      ],
    },

    /* ---------------------------- Minuman --------------------------- */
    {
      name: 'Fanta Minuman Soda Rasa Stroberi Kaleng 250 ml',
      description:
        'Menjadi muda adalah menjalani setiap hari dengan segala hal yang asyik dan seru sesuai dengan karaktermu. Sangat bersemangat dan menyenangkan. Apalagi, jika itu semua dijalani bersama dengan teman-teman yang selalu ada setiap saat. Seperti minuman Fanta rasa buah yang menyenangkan. Fanta dari The Coca Cola Company telah menemani banyak momen seru anak-anak muda sepertimu.',

      price: 11000,
      weight: 0.1,
      categoryId: minuman.id,
      images: [
        '/product/minuman/fanta-small-01.jpg',
        '/product/minuman/fanta-small-02.jpg',
      ],
    },
    {
      name: 'Teh Kotak Minuman Teh Jasmine Less Sugar',
      description:
        'Teh Kotak Jasmine Less Sugar 300 ml adalah minuman teh melati siap minum dengan kadar gula lebih rendah, cocok untuk gaya hidup aktif dan sehat. Terbuat dari daun teh berkualitas tinggi dan bunga melati, diproses menggunakan teknologi UHT dan dikemas dalam kemasan aseptik 6 lapis untuk menjaga kesegaran tanpa pengawet. Mengandung vitamin C, minuman ini memberikan kesegaran alami yang menenangkan.',

      price: 4200,
      weight: 0.1,
      categoryId: minuman.id,
      images: [
        '/product/minuman/teh-kotak-jasmine-01.webp',
        '/product/minuman/teh-kotak-jasmine-02.webp',
      ],
    },
    {
      name: 'Pristine Mineral Water',
      description:
        'Pristine Mineral Water 600 ml adalah air minum dalam kemasan yang melalui proses ionisasi untuk membantu menjaga keseimbangan pH tubuh. Dengan rasa yang ringan dan segar, Pristine cocok dikonsumsi setiap hari untuk menjaga hidrasi dan kesehatan. Dikemas praktis dalam botol 600 ml, ideal untuk dibawa ke mana saja.',

      price: 3900,
      weight: 0.1,
      categoryId: minuman.id,
      images: [
        '/product/minuman/pristine-01.webp',
        '/product/minuman/pristine-02.webp',
      ],
    },
    {
      name: 'Soft Drink Zero Kaleng Bintang',
      description:
        'Bintang Zero Can merupakan minuman malt berkarbonasi nonalkohol dengan rasa apel yang menyegarkan. Memberikan sensasi menyegarkan dengan rasa ringan yang cocok untuk dinikmati saat santai, olahraga, atau sebagai pendamping makanan cepat saji.',

      price: 9000,
      weight: 0.1,
      categoryId: minuman.id,
      images: [
        '/product/minuman/bintang-zero-01.webp',
        '/product/minuman/bintang-zero-02.webp',
      ],
    },
    {
      name: 'Diamond Juice Orange Unsweet',
      description:
        'BDiamond Juice Orange Unsweet 946 ml adalah jus jeruk alami yang tidak mengandung pemanis tambahan, memberikan rasa segar dan kaya vitamin C. Minuman ini ideal untuk mereka yang menginginkan minuman sehat tanpa tambahan gula. Diamond Juice Orange Unsweet dapat membantu memperkuat sistem kekebalan tubuh, meningkatkan kesehatan kulit, dan menjaga hidrasi tubuh. Dengan kemasan 946 ml, produk ini sangat cocok untuk dinikmati bersama keluarga sebagai pilihan minuman sehat yang menyegarkan setiap hari.',

      price: 35000,
      weight: 0.5,
      categoryId: minuman.id,
      images: ['/product/minuman/diamond-juice-orange-01.webp'],
    },
    {
      name: 'ABC Minuman Sari Kacang Hijau',
      description:
        'ABC Minuman Sari Kacang Hijau adalah minuman siap saji yang terbuat dari sari kacang hijau pilihan, kaya akan serat dan protein nabati. Minuman ini juga mengandung vitamin B kompleks yang baik untuk menjaga stamina dan kesehatan pencernaan. Cocok dinikmati dingin kapan saja sebagai pelengkap gaya hidup sehat.',

      price: 5400,
      weight: 0.1,
      categoryId: minuman.id,
      images: [
        '/product/minuman/abc-sari-hijau-01.webp',
        '/product/minuman/abc-sari-hijau-02.webp',
      ],
    },
    {
      name: 'Marjan Sirup With Milk Orange',
      description:
        'Sirup Marjan cocok diminum langsung atau dibuat menjadi aneka kreasi minuman yang segar dan nikmat. Sirup Marjan sendiri memiliki rasa manis yang pas dan aroma khas, membuat sirup ini sulit untuk dilewatkan dari berbagai acara keluarga. Bagi Anda yang menginginkan momen penting jadi makin spesial, pilihlah Marjan sesuai selera sebagai pendamping momen penting tersebut.',

      price: 22000,
      weight: 0.5,
      categoryId: minuman.id,
      images: [
        '/product/minuman/marjan-sirup-orange-01.webp',
        '/product/minuman/marjan-sirup-orange-02.webp',
      ],
    },
    {
      name: 'Frestea Green Tea Lemongrass Botol',
      description:
        'Frestea Green Tea Lemongrass adalah minuman teh hijau dengan aroma sereh yang menyegarkan dan menenangkan. Cocok diminum dingin untuk merelaksasi tubuh, dan pas jadi teman santai di tengah kesibukan.',

      price: 4900,
      weight: 0.3,
      categoryId: minuman.id,
      images: ['/product/minuman/frestea-01.webp'],
    },
    {
      name: 'Pocari Sweat Isotonik',
      description:
        'Pocari Sweat merupakan minuman penambah ion tubuh yang mengandung komposisi seperti air, gula, asam sitrat, natrium sitrat, natrium klorida, kalium klorida, kalsium laktat, magnesium karbonat dan perasa. Membantu menggantikan cairan tubuh yang hilang setelah beraktivitas.',

      price: 6900,
      weight: 0.3,
      categoryId: minuman.id,
      images: [
        '/product/minuman/poccari-01.webp',
        '/product/minuman/poccari-02.webp',
      ],
    },
    {
      name: 'Aqua Air Mineral',
      description:
        'Aqua Air Mineral adalah air minum berkualitas tinggi yang diambil dari sumber mata air pegunungan dan dikemas higienis. Ukurannya pas untuk dibawa bepergian, cocok untuk menemani aktivitas harian, olahraga, ataupun dikonsumsi saat makan. Segar, praktis, dan terpercaya menjaga hidrasi tubuh.',

      price: 2500,
      weight: 0.1,
      categoryId: minuman.id,
      images: [
        '/product/minuman/aqua-01.webp',
        '/product/minuman/aqua-02.webp',
      ],
    },

    /* ------------------------ Kebutuhan Rumah ----------------------- */
    {
      name: 'Molto Pewangi Pakaian - Floral Bliss Refill',
      description:
        'Molto Pewangi Pakaian Floral Bliss Refill adalah pelembut dan pewangi pakaian dengan aroma floral yang segar dan tahan lama. Diformulasikan untuk menghilangkan bau tidak sedap dan menjaga pakaian tetap wangi sepanjang hari. Membantu melembutkan serat kain serta memudahkan proses menyetrika. Cocok digunakan untuk berbagai jenis pakaian keluarga.',

      price: 20000,
      weight: 0.7,
      categoryId: kebutuhan_rumah.id,
      images: [
        '/product/kebutuhan-rumah/molto-floral-bliss-refill-01.webp',
        '/product/kebutuhan-rumah/molto-floral-bliss-refill-02.webp',
      ],
    },
    {
      name: 'Nice Facial Tissue Queen Size',
      description:
        'Nice Facial Tissue Queen Size adalah tisu wajah berkualitas dalam kemasan besar yang ekonomis. Lembaran tisunya lembut, tidak mudah robek, dan sangat menyerap. Cocok digunakan untuk keperluan rumah tangga, kantor, restoran, maupun usaha lainnya. Hadir dalam jumlah banyak, hemat dan praktis untuk stok jangka panjang. Terbuat dari bahan berkualitas tinggi yang aman untuk kulit sensitif, bahkan untuk bayi.',

      price: 16000,
      weight: 0.7,
      categoryId: kebutuhan_rumah.id,
      images: [
        '/product/kebutuhan-rumah/nice-facial-tissue-queen-size-02.webp',
        '/product/kebutuhan-rumah/nice-facial-tissue-queen-size-02.webp',
      ],
    },
    {
      name: 'Sabun Cuci Piring - Mama Lime 60ml',
      description:
        'Cairan pencuci piring yang berguna untuk membersihkan, mengangkat kotoran dan noda membandel di peralatan memasak. Juga dapat digunakan untuk mencuci buah-buahan dan sayur.',

      price: 2000,
      weight: 0.1,
      categoryId: kebutuhan_rumah.id,
      images: [
        '/product/kebutuhan-rumah/mama-lime-60ml-01.webp',
        '/product/kebutuhan-rumah/mama-lime-60ml-02.webp',
      ],
    },
    {
      name: 'Pembersih Lantai - Lemon Twist SOS 750ml',
      description:
        'Pembersih lantai yang dirancang khusus untuk membersihkan lantai rumah dengan lebih mudah. Membantu menghilangkan bau tidak sedap, membunuh kuman dan bakteri dengan lebih cepat. Disertai dengan harum lemon yang menyegarkan.',

      price: 10000,
      weight: 0.1,
      categoryId: kebutuhan_rumah.id,
      images: [
        '/product/kebutuhan-rumah/lemon-twist-sos-750ml-01.webp',
        '/product/kebutuhan-rumah/lemon-twist-sos-750ml-02.webp',
      ],
    },
    {
      name: 'ABC Baterai Biru Besar R-20 2 pcs',
      description:
        'ABC Baterai Biru Besar R-20 2 pcs merupakan batu baterai persembahan ABC. Ukuran besar dan tidak mengandung mercury. Cocok untuk digunakan pada berbagai perangkat elektronik Anda.',

      price: 22000,
      weight: 0.25,
      categoryId: kebutuhan_rumah.id,
      images: [
        '/product/kebutuhan-rumah/baterai-abc-r20-01.jpg',
        '/product/kebutuhan-rumah/baterai-abc-r20-02.jpg',
      ],
    },
    {
      name: 'Xander Gembok Pendek 40 mm',
      description:
        'Xander Security Lock Gembok 40 mm adalah gembok berukuran pendek 40 mm dari Xander yang berbahan Case-Hardened steel. Lengkap dengan sistem Dual-Locking dan Precision Pin Tumbler Mechanism yang kuat, tahan lama dan berkualitas. Dibuat dengan standardisasi Jerman. Dilengkapi dengan 3 buah kunci.',

      price: 40000,
      weight: 0.5,
      categoryId: kebutuhan_rumah.id,
      images: [
        '/product/kebutuhan-rumah/xander-gembok-40mm-01.jpg',
        '/product/kebutuhan-rumah/xander-gembok-40mm-02.jpg',
      ],
    },
    {
      name: 'Lilin Ulang Tahun 24 pcs',
      description:
        'Alfamart Lilin Ulang Tahun 24 pcs adalah lilin berukuran kecil dan warna-warni. Dibuat dari bahan yang membuatnya kuat dan tahan lama setelah dibakar dengan api. Lilin ulang tahun ini tidak mudah gosong dan tidak memberikan aroma bau tidak sedap. Dalam kemasannya, lilin ini juga sudah dilengkapi dengan alas lilin untuk ditancapkan pada kue tanpa merusak keindahannya. Tersedia dalam kemasan isi 24 pcs.',

      price: 15000,
      weight: 0.1,
      categoryId: kebutuhan_rumah.id,
      images: [
        '/product/kebutuhan-rumah/lilin-ulang-tahun-01.jpg',
        '/product/kebutuhan-rumah/lilin-ulang-tahun-02.jpg',
      ],
    },
    {
      name: 'Shamu Lampu Senter Rechargeable',
      description:
        'SHAMU Lampu Senter Rechargeable 4+1 LED merupakan lampu senter dengan LED terbaik yang dapat digunakan pada saat mati lampu hingga ketika berkemah dengan orang-orang terdekat. Senter dari Shamu ini memiliki lampu LED berkualitas sehingga menghasilkan nyala cahaya yang terang menyala dan juga jernih kurang lebih selama 40 jam.',

      price: 32000,
      weight: 0.2,
      categoryId: kebutuhan_rumah.id,
      images: [
        '/product/kebutuhan-rumah/shamu-lampu-senter-01.jpg',
        '/product/kebutuhan-rumah/shamu-lampu-senter-02.jpg',
      ],
    },
    {
      name: 'Kenmaster Steker Adaptor Listrik S0203',
      description:
        'Steker adaptor dengan lampu indikator. Seluruh komponen terbuat dari bahan kuningan. Ideal dipakai di dalam ruangan dan tempat yang kering. Tidak untuk dipergunakan pada produk bertegangan tinggi.',

      price: 21000,
      weight: 0.2,
      categoryId: kebutuhan_rumah.id,
      images: [
        '/product/kebutuhan-rumah/kenmaster-adaptor-listrik-01.jpg',
        '/product/kebutuhan-rumah/kenmaster-adaptor-listrik-02.jpg',
      ],
    },
    {
      name: 'Kenmaster Kanebo Yellow 2 Pcs',
      description:
        'Lap kenebo Kenmaster dengan daya serap tinggi sehingga dapat membersihkan air, debu dan kotoran. Menyerap air tanpa menetes, tahan terhadap minyak, kotoran, deterjen ringan dan netral. Dapat digunakan untuk membersihkan kaca, lapisan krom, dan roda. Aman pada semua cat termasuk bahan mantel.',

      price: 52000,
      weight: 0.2,
      categoryId: kebutuhan_rumah.id,
      images: [
        '/product/kebutuhan-rumah/kenmaster-kanebo-yellow-01.jpg',
        '/product/kebutuhan-rumah/kenmaster-kanebo-yellow-02.jpg',
      ],
    },
  ];

  let result: Product[] = [];
  for (const data of datas) {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        sku: await genSKU(),
        price: data.price,
        weight: data.weight,
        categoryId: data.categoryId,
      },
    });

    if (data.images.length) {
      await prisma.productImage.createMany({
        data: data.images.map((imgurl, idx) => {
          return {
            imageUrl: imgurl,
            productId: product.id,
            isMain: idx === 0 ? true : false,
          };
        }),
      });
    }

    result.push(product);
  }
  return result;
}

async function SEED_STORES(admins: User[]) {
  const stores = [
    {
      name: 'Toko Jakarta',
      address: 'Jl. Jendral Sudirman No. 1, Jakarta Pusat',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      postalCode: '10220',
      latitude: -6.2,
      longitude: 106.816666,
      maxDistance: 50,
      reference: 'https://www.latlong.net/place/jakarta-indonesia-27575.html',
    },
    {
      name: 'Toko Bekasi',
      address: 'Jl. Raya Pekayon No. 10, Bekasi Selatan',
      city: 'Bekasi',
      province: 'Jawa Barat',
      postalCode: '17148',
      latitude: -6.241586,
      longitude: 106.992416,
      maxDistance: 50,
      reference:
        'https://www.latlong.net/place/bekasi-west-java-indonesia-3406.html',
    },
    {
      name: 'Toko Bandung',
      address: 'Jl. Asia Afrika No. 100, Bandung',
      city: 'Bandung',
      province: 'Jawa Barat',
      postalCode: '40251',
      latitude: -6.914744,
      longitude: 107.60981,
      maxDistance: 50,
      reference:
        'https://www.latlong.net/place/bandung-west-java-indonesia-1200.html',
    },
    {
      name: 'Toko Cirebon',
      address: 'Jl. Siliwangi No. 45, Cirebon',
      city: 'Cirebon',
      province: 'Jawa Barat',
      postalCode: '45121',
      latitude: -6.737246,
      longitude: 108.550659,
      maxDistance: 50,
      reference:
        'https://www.latlong.net/place/cirebon-west-java-indonesia-3865.html',
    },
    {
      name: 'Toko Semarang',
      address: 'Jl. Pemuda No. 150, Semarang Tengah',
      city: 'Semarang',
      province: 'Jawa Tengah',
      postalCode: '50132',
      latitude: -6.966667,
      longitude: 110.416667,
      maxDistance: 50,
      reference:
        'https://us.trip.com/hotels/semarang-hotel-detail-9825426/rooms-inc-hotel-pemuda/',
    },
    {
      name: 'Toko Yogyakarta',
      address: 'Jl. Malioboro No. 20, Yogyakarta',
      city: 'Yogyakarta',
      province: 'DI Yogyakarta',
      postalCode: '55213',
      latitude: -7.7934,
      longitude: 110.3657,
      maxDistance: 50,
      reference:
        'https://latitude.to/articles-by-country/id/indonesia/26207/jalan-malioboro',
    },
    {
      name: 'Toko Surabaya',
      address: 'Jl. Tunjungan No. 1, Surabaya',
      city: 'Surabaya',
      province: 'Jawa Timur',
      postalCode: '60275',
      latitude: -7.250445,
      longitude: 112.768845,
      maxDistance: 50,
      reference:
        'https://www.latlong.net/place/surabaya-east-java-indonesia-3387.html',
    },
    {
      name: 'Toko Malang',
      address: 'Jl. Ijen No. 3, Malang',
      city: 'Malang',
      province: 'Jawa Timur',
      postalCode: '65111',
      latitude: -7.983908,
      longitude: 112.621391,
      maxDistance: 50,
      reference:
        'https://www.latlong.net/place/malang-east-java-indonesia-3075.html',
    },
  ];

  if (admins.length < stores.length) {
    throw new Error(
      `Unsufficient admins store, add more ${stores.length - admins.length} admin.`,
    );
  }

  let result: Store[] = [];
  for (let i = 0; i < stores.length; i++) {
    const store = stores[i];
    const admin = admins[i];

    const newstore = await prisma.store.create({
      data: {
        name: store.name,
        address: store.address,
        city: store.city,
        province: store.province,
        postalCode: store.postalCode,
        latitude: store.latitude,
        longitude: store.longitude,
        maxDistance: store.maxDistance,
        adminId: admin.id,
      },
    });

    await prisma.user.update({
      where: {
        id: admin.id,
      },
      data: {
        storeId: newstore.id,
      },
    });

    result.push(newstore);
  }
  return result;
}

// untuk seed discount ada pada produk ke 1,2,3,4,5 untuk masing2 kategori.
// note: setiap category ada 10 produk
// untuk toko ada pada toko ke 1
async function SEED_PRODUCT_DISCOUNT(products: Product[], stores: Store[]) {
  const currentDate = new Date();
  const nextMonth = add(currentDate, { months: 1 });

  const productData = products.filter((product, idx) => {
    return idx % 10 <= 4;
  });

  const s1 = stores[0];

  for (let i = 0; i < productData.length; i++) {
    const x = i % 5;
    switch (x) {
      // untuk produk ke 1 dari masing-masing kategori insert buy 1 get one
      case 0:
        await prisma.discount.create({
          data: {
            name: 'Buy One Get One',
            description:
              'Dapatkan promo satu produk tambahan secara gratis. Promo ini berlaku dalam periode terbatas. Manfaatkan kesempatan ini untuk menggandakan pembelian Anda tanpa biaya tambahan!',
            type: 'BUY_X_GET_Y',
            buyQuantity: 1,
            getQuantity: 1,
            startDate: currentDate,
            endDate: nextMonth,
            storeId: s1.id,
            products: {
              connect: [productData[i]],
            },
          },
        });
        break;

      // untuk produk ke 2 dan 3 masing2 kategori insert promo bersyarat
      case 1:
        await prisma.discount.create({
          data: {
            name: 'Big Deal 10k',
            description:
              'Diskon potongan harga 20% hingga maksimal Rp10.000 dengan minimal pembelian Rp20.000. Berlaku dalam periode terbatas.',
            type: 'WITH_MAX_PRICE',
            isPercentage: true,
            value: 20,
            maxDiscount: 10000,
            minPurchase: 20000,
            startDate: currentDate,
            endDate: nextMonth,
            storeId: s1.id,
            products: {
              connect: [productData[i]],
            },
          },
        });
        break;

      case 2:
        await prisma.discount.create({
          data: {
            name: 'Big Deal 20k',
            description:
              'Diskon potongan harga Rp20.000 dengan minimal pembelian Rp100.000. Berlaku dalam periode terbatas.',
            type: 'WITH_MAX_PRICE',
            isPercentage: false,
            value: 20000,
            minPurchase: 100000,
            startDate: currentDate,
            endDate: nextMonth,
            storeId: s1.id,
            products: {
              connect: [productData[i]],
            },
          },
        });
        break;

      // untuk produk 4 dan 5 NO RULES DISCOUNT
      case 3:
        await prisma.discount.create({
          data: {
            name: 'Hemat 6k',
            description:
              'Diskon potongan harga 30% hingga maksimal Rp6.000 tanpa syarat. Berlaku dalam periode terbatas.',
            type: 'NO_RULES_DISCOUNT',
            isPercentage: true,
            value: 30,
            maxDiscount: 6000,
            startDate: currentDate,
            endDate: nextMonth,
            storeId: s1.id,
            products: {
              connect: [productData[i]],
            },
          },
        });
        break;

      case 4:
        if (productData[i].price.gte(20000)) {
          await prisma.discount.create({
            data: {
              name: 'Hemat 5k',
              description:
                'Diskon potongan harga Rp5.000 tanpa syarat. Berlaku dalam periode terbatas.',
              type: 'NO_RULES_DISCOUNT',
              isPercentage: false,
              value: 5000,
              startDate: currentDate,
              endDate: nextMonth,
              storeId: s1.id,
              products: {
                connect: [productData[i]],
              },
            },
          });
        }
    }
  }
}

async function SEED_STOCK(stores: Store[], products: Product[]) {
  const randstock = (min: number = 10, max: number = 50) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  let inventories: Inventory[] = [];

  products.forEach((product) => {
    stores.forEach(async (store) => {
      const stock =
        product.name === 'Buah Naga Merah' || product.name === 'Bawang Bombay'
          ? 0
          : randstock();
      const inventory = await prisma.inventory.create({
        data: {
          quantity: stock,
          productId: product.id,
          storeId: store.id,
        },
      });

      inventories.push(inventory);
    });
  });

  return inventories;
}

async function SEED_VOUCHER(
  users: User[],
  products: Product[],
  categories: Category[],
) {
  const currentDate = new Date();
  const nextMonth = add(currentDate, { months: 1 });

  const genVoucherCode = async (type: VoucherType) => {
    for (let attempt = 0; attempt < 10; attempt++) {
      let prefix = '';
      switch (type) {
        case 'REFERRAL':
          prefix = 'VREF-';
          break;
        case 'SHIPPING':
          prefix = 'ONGK-';
          break;
        case 'PRODUCT_SPECIFIC':
          prefix = 'PROD-';
          break;
      }
      const suffix = `-${currentDate.getFullYear()}`;
      const middle = uuid().replace(/-/g, '').substring(0, 10).toUpperCase();
      const code = `${prefix}${middle}${suffix}`;

      const exist = await prisma.voucher.findUnique({
        where: {
          code: code,
        },
      });

      if (!exist) {
        return code;
      }
    }
    throw new Error('Failed to generate a unique voucher code.');
  };

  const buahCategory = categories.find((category) => category.name === 'Buah');
  const sayuranCategory = categories.find(
    (category) => category.name === 'Sayuran',
  );

  const datas = [
    {
      name: 'Bonus Teman Baru 10K',
      description:
        'Ajak teman belanja dan dapatkan bonus Rp10.000 untuk pembelian pertama mereka. Berlaku untuk pembelian minimal Rp50.000.',
      type: 'REFERRAL' as VoucherType,
      valueType: 'FIXED_AMOUNT' as ValueType,
      maxDiscount: null,
      value: 10000,
      minPurchase: 50000,
      startDate: currentDate,
      endDate: nextMonth,
      isForShipping: false,
    },
    {
      name: 'Segarnya Diskon Buah 10%!',
      description:
        'Nikmati kesegaran buah pilihan dengan diskon 10% hingga Rp20.000. Cocok untuk bekal, jus, atau camilan sehat!',
      type: 'PRODUCT_SPECIFIC' as VoucherType,
      valueType: 'PERCENTAGE' as ValueType,
      maxDiscount: 20000,
      value: 10,
      minPurchase: 10000,
      startDate: currentDate,
      endDate: nextMonth,
      isForShipping: false,
      products: products.filter(
        (product) => product.categoryId === buahCategory?.id,
      ),
    },
    {
      name: 'Diskon Sayur Rp5.000 Langsung!',
      description:
        'Belanja sayuran segar makin hemat dengan potongan langsung Rp5.000. Bahan dapur sehat, harga bersahabat!',
      type: 'PRODUCT_SPECIFIC' as VoucherType,
      valueType: 'FIXED_AMOUNT' as ValueType,
      maxDiscount: null,
      value: 5000,
      minPurchase: 20000,
      startDate: currentDate,
      endDate: nextMonth,
      isForShipping: false,
      products: products.filter(
        (product) => product.categoryId === sayuranCategory?.id,
      ),
    },
    {
      name: 'Gratis Ongkir Spesial',
      description:
        'Nikmati gratis ongkir 50% up to Rp40.000 untuk semua jenis pengiriman. Berlaku di seluruh Indonesia.',
      type: 'SHIPPING' as VoucherType,
      valueType: 'PERCENTAGE' as ValueType,
      maxDiscount: 40000,
      value: 50,
      minPurchase: null,
      startDate: currentDate,
      endDate: nextMonth,
      isForShipping: true,
    },
  ];

  let vouchers: Voucher[] = [];
  for (const data of datas) {
    for (const user of users) {
      const voucher = await prisma.voucher.create({
        data: {
          code: await genVoucherCode(data.type),
          name: data.name,
          description: data.description,
          type: data.type,
          valueType: data.valueType,
          maxDiscount: data.maxDiscount,
          value: data.value,
          minPurchase: data.minPurchase,
          startDate: data.startDate,
          endDate: data.endDate,
          isForShipping: data.isForShipping,
          products: {
            connect: data.products ? data.products : [],
          },
          users: {
            connect: [
              {
                id: user.id,
              },
            ],
          },
        },
      });

      vouchers.push(voucher);
    }
  }
  return vouchers;
}

async function SEED_SHIPPING_METHODS() {
  const shippingMethods = [
    {
      name: 'JNE Regular (REG)',
      description: 'Estimasi pengiriman 2-3 hari',
      baseCost: 15000,
      isActive: true,
    },
    {
      name: 'JNE Express (YES)',
      description: 'Estimasi pengiriman 1 hari',
      baseCost: 25000,
      isActive: true,
    },
    {
      name: 'TIKI Regular',
      description: 'Estimasi pengiriman 3-4 hari',
      baseCost: 12000,
      isActive: true,
    },
    {
      name: 'POS Indonesia Standard',
      description: 'Estimasi pengiriman 3-5 hari',
      baseCost: 10000,
      isActive: true,
    },
  ];

  console.log('Seeding shipping methods...');

  await prisma.shippingMethod.deleteMany({});

  for (const method of shippingMethods) {
    await prisma.shippingMethod.create({
      data: method,
    });
  }

  console.log(`Created ${shippingMethods.length} shipping methods`);

  return await prisma.shippingMethod.findMany();
}

async function main() {
  ['.env', 'env.local'].forEach((envfile) =>
    config({ path: resolve(__dirname, `../${envfile}`), override: true }),
  );

  // SEED HERE
  const { superId } = await SEED_SUPER_ADMIN();
  const admins = await SEED_STORE_ADMIN();
  const users = await SEED_USER();
  const categories = await SEED_PRODUCT_CATEGORY();
  const products = await SEED_PRODUCT(categories);
  const stores = await SEED_STORES(admins);
  const productDiscounts = await SEED_PRODUCT_DISCOUNT(products, stores);
  const inventories = await SEED_STOCK(stores, products);
  const vouchers = await SEED_VOUCHER(users, products, categories);
  const shippingMethods = await SEED_SHIPPING_METHODS();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
