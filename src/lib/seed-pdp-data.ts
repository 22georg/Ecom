import { PrismaClient, ProductStatus, ProductType } from '@prisma/client';

export async function seedPDPData(prisma: PrismaClient) {
  console.log('📦 Seeding rich multi-variant product catalog data for PDP experience...');

  // Ensure default categories exist
  const catAudio = await prisma.category.upsert({
    where: { slug: 'audio-architecture' },
    update: {},
    create: {
      name: 'Audio Architecture',
      slug: 'audio-architecture',
      description: 'High-fidelity acoustic hardware, noise isolation pods, and modular earbuds.',
      displayOrder: 1,
    },
  });

  const catSubEarbuds = await prisma.category.upsert({
    where: { slug: 'wireless-earbuds' },
    update: { parentId: catAudio.id },
    create: {
      name: 'Wireless Earbuds',
      slug: 'wireless-earbuds',
      description: 'Ultra-low latency Bluetooth 5.4 earbuds with spatial telemetry.',
      parentId: catAudio.id,
      displayOrder: 1,
    },
  });

  const catHardware = await prisma.category.upsert({
    where: { slug: 'smart-hardware' },
    update: {},
    create: {
      name: 'Smart Hardware',
      slug: 'smart-hardware',
      description: 'Connected IoT sensors, telemetry nodes, and AI home automation hardware.',
      displayOrder: 2,
    },
  });

  const catWorkspace = await prisma.category.upsert({
    where: { slug: 'minimal-workspace' },
    update: {},
    create: {
      name: 'Minimal Workspace',
      slug: 'minimal-workspace',
      description: 'Ergonomic stands, desks, and ambient lighting designed for focus.',
      displayOrder: 3,
    },
  });

  // Ensure Brands
  const brandMarqivo = await prisma.brand.upsert({
    where: { slug: 'marqivo-labs' },
    update: {},
    create: {
      name: 'MARQIVO Labs',
      slug: 'marqivo-labs',
      description: 'In-house hardware engineering and intelligent commerce design.',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80',
    },
  });

  const brandAura = await prisma.brand.upsert({
    where: { slug: 'aura-systems' },
    update: {},
    create: {
      name: 'Aura Systems',
      slug: 'aura-systems',
      description: 'Precision environmental sensing and telemetry equipment.',
      logoUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&q=80',
    },
  });

  const brandCipher = await prisma.brand.upsert({
    where: { slug: 'cipher-tech' },
    update: {},
    create: {
      name: 'Cipher Tech',
      slug: 'cipher-tech',
      description: 'Zero-trust security hardware and encrypted key managers.',
      logoUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&q=80',
    },
  });

  // Ensure Warehouse
  const warehouse = await prisma.warehouse.upsert({
    where: { code: 'WH-DAC-01' },
    update: {},
    create: {
      name: 'Dhaka Central Hub',
      code: 'WH-DAC-01',
      address: 'Plot 14, Sector 7, Uttara',
      city: 'Dhaka',
      country: 'BD',
    },
  });

  // PRODUCT 1: Pulse Pro Wireless ANC Earbuds (Rich Multi-Variant: Color x Edition)
  const product1 = await prisma.product.upsert({
    where: { slug: 'pulse-pro-wireless-earbuds' },
    update: {
      name: 'Pulse Pro Wireless ANC Earbuds',
      status: ProductStatus.ACTIVE,
      type: ProductType.PHYSICAL,
      shortDesc: 'High-fidelity audio drivers with active acoustic isolation & 36-hour playback',
      fullDesc: `
        <p>Experience studio-grade acoustic clarity with the <strong>Pulse Pro Wireless ANC Earbuds</strong> by MARQIVO Labs. Engineered with custom 11mm beryllium dynamic drivers and multi-mic hybrid noise cancellation, Pulse Pro blocks up to 42dB of ambient noise while preserving natural vocal warmth.</p>
        <h3>Key Technological Highlights</h3>
        <ul>
          <li><strong>Adaptive ANC 3.0:</strong> Real-time environmental noise cancellation adjusts 48,000 times per second.</li>
          <li><strong>Spatial Audio Telemetry:</strong> Integrated head tracking for immersive 360-degree acoustic staging.</li>
          <li><strong>IPX5 Water Resistance:</strong> Sweatproof design ideal for high-intensity training and rainy commutes.</li>
          <li><strong>Magnetic Qi Charging:</strong> Fast wireless charging dock delivers 6 hours of listening in 10 minutes.</li>
        </ul>
        <p>Constructed from lightweight recycled composites, each earbud weighs just 4.8 grams for fatigue-free all-day comfort.</p>
      `,
      brandId: brandMarqivo.id,
      ratingAvg: 4.85,
      reviewCount: 24,
    },
    create: {
      name: 'Pulse Pro Wireless ANC Earbuds',
      slug: 'pulse-pro-wireless-earbuds',
      shortDesc: 'High-fidelity audio drivers with active acoustic isolation & 36-hour playback',
      fullDesc: `
        <p>Experience studio-grade acoustic clarity with the <strong>Pulse Pro Wireless ANC Earbuds</strong> by MARQIVO Labs. Engineered with custom 11mm beryllium dynamic drivers and multi-mic hybrid noise cancellation, Pulse Pro blocks up to 42dB of ambient noise while preserving natural vocal warmth.</p>
        <h3>Key Technological Highlights</h3>
        <ul>
          <li><strong>Adaptive ANC 3.0:</strong> Real-time environmental noise cancellation adjusts 48,000 times per second.</li>
          <li><strong>Spatial Audio Telemetry:</strong> Integrated head tracking for immersive 360-degree acoustic staging.</li>
          <li><strong>IPX5 Water Resistance:</strong> Sweatproof design ideal for high-intensity training and rainy commutes.</li>
          <li><strong>Magnetic Qi Charging:</strong> Fast wireless charging dock delivers 6 hours of listening in 10 minutes.</li>
        </ul>
        <p>Constructed from lightweight recycled composites, each earbud weighs just 4.8 grams for fatigue-free all-day comfort.</p>
      `,
      brandId: brandMarqivo.id,
      status: ProductStatus.ACTIVE,
      type: ProductType.PHYSICAL,
      ratingAvg: 4.85,
      reviewCount: 24,
      metaTitle: 'Pulse Pro Wireless ANC Earbuds | MARQIVO Commerce',
      metaKeywords: 'earbuds, wireless audio, noise cancellation, bluetooth 5.4, acoustic isolation',
    },
  });

  // Link Category
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product1.id,
        categoryId: catSubEarbuds.id,
      },
    },
    update: {},
    create: {
      productId: product1.id,
      categoryId: catSubEarbuds.id,
    },
  });

  // Product 1 Media Gallery
  await prisma.productMedia.deleteMany({ where: { productId: product1.id } });
  await prisma.productMedia.createMany({
    data: [
      {
        productId: product1.id,
        mediaUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
        altText: 'Pulse Pro Wireless Earbuds in Matte Black inside charging case',
        displayOrder: 1,
        isPrimary: true,
      },
      {
        productId: product1.id,
        mediaUrl: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&q=80',
        altText: 'Close-up view of Pulse Pro earbud acoustic driver nozzle',
        displayOrder: 2,
        isPrimary: false,
      },
      {
        productId: product1.id,
        mediaUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80',
        altText: 'Pulse Pro Earbuds Pearl White edition resting on wood desk',
        displayOrder: 3,
        isPrimary: false,
      },
      {
        productId: product1.id,
        mediaUrl: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=80',
        altText: 'Compact magnetic Qi wireless charging dock case',
        displayOrder: 4,
        isPrimary: false,
      },
    ],
  });

  // Options & Option Values for Product 1 (Color & Edition)
  await prisma.productOption.deleteMany({ where: { productId: product1.id } });

  const optColor = await prisma.productOption.create({
    data: {
      productId: product1.id,
      name: 'Color',
      displayOrder: 1,
      values: {
        create: [
          { value: 'Matte Black', displayOrder: 1 },
          { value: 'Pearl White', displayOrder: 2 },
          { value: 'Cyber Teal', displayOrder: 3 },
        ],
      },
    },
    include: { values: true },
  });

  const optEdition = await prisma.productOption.create({
    data: {
      productId: product1.id,
      name: 'Edition',
      displayOrder: 2,
      values: {
        create: [
          { value: 'Standard', displayOrder: 1 },
          { value: 'Pro Studio', displayOrder: 2 },
        ],
      },
    },
    include: { values: true },
  });

  const valBlack = optColor.values.find((v) => v.value === 'Matte Black')!;
  const valWhite = optColor.values.find((v) => v.value === 'Pearl White')!;
  const valTeal = optColor.values.find((v) => v.value === 'Cyber Teal')!;
  const valStd = optEdition.values.find((v) => v.value === 'Standard')!;
  const valStudio = optEdition.values.find((v) => v.value === 'Pro Studio')!;

  // Create Variants for Product 1
  await prisma.productVariant.deleteMany({ where: { productId: product1.id } });

  const var1 = await prisma.productVariant.create({
    data: {
      productId: product1.id,
      sku: 'MQV-PLS-BLK-STD',
      price: 18900.0, // ৳18,900 BDT
      compareAtPrice: 22500.0,
      weightKg: 0.18,
      isActive: true,
      variantOptions: {
        create: [
          { optionValueId: valBlack.id },
          { optionValueId: valStd.id },
        ],
      },
      inventoryItems: {
        create: {
          warehouseId: warehouse.id,
          quantityOnHand: 25,
        },
      },
    },
  });

  const var2 = await prisma.productVariant.create({
    data: {
      productId: product1.id,
      sku: 'MQV-PLS-BLK-PRO',
      price: 23900.0, // ৳23,900 BDT
      compareAtPrice: 27900.0,
      weightKg: 0.22,
      isActive: true,
      variantOptions: {
        create: [
          { optionValueId: valBlack.id },
          { optionValueId: valStudio.id },
        ],
      },
      inventoryItems: {
        create: {
          warehouseId: warehouse.id,
          quantityOnHand: 14,
        },
      },
    },
  });

  const var3 = await prisma.productVariant.create({
    data: {
      productId: product1.id,
      sku: 'MQV-PLS-WHT-STD',
      price: 18900.0,
      compareAtPrice: 22500.0,
      weightKg: 0.18,
      isActive: true,
      variantOptions: {
        create: [
          { optionValueId: valWhite.id },
          { optionValueId: valStd.id },
        ],
      },
      inventoryItems: {
        create: {
          warehouseId: warehouse.id,
          quantityOnHand: 8, // Low stock
        },
      },
    },
  });

  const var4 = await prisma.productVariant.create({
    data: {
      productId: product1.id,
      sku: 'MQV-PLS-TEL-PRO',
      price: 24900.0,
      compareAtPrice: 28900.0,
      weightKg: 0.22,
      isActive: true,
      variantOptions: {
        create: [
          { optionValueId: valTeal.id },
          { optionValueId: valStudio.id },
        ],
      },
      inventoryItems: {
        create: {
          warehouseId: warehouse.id,
          quantityOnHand: 0, // Out of stock demo
        },
      },
    },
  });

  // PRODUCT 2: Aura Connected Sensor Node (IoT Hardware)
  const product2 = await prisma.product.upsert({
    where: { slug: 'aura-connected-sensor-node' },
    update: {
      name: 'Aura Connected Environmental Sensor Node',
      status: ProductStatus.ACTIVE,
      type: ProductType.PHYSICAL,
      shortDesc: 'Automated environmental telemetry & air quality monitoring node',
      fullDesc: `
        <p>The <strong>Aura Connected Sensor Node</strong> delivers precise indoor environmental intelligence. Equipped with laser PM2.5 particle counters, NDIR CO2 sensors, and relative humidity telemetry, it syncs seamlessly with MARQIVO smart automation networks.</p>
        <h3>Specifications Summary</h3>
        <ul>
          <li><strong>PM2.5 / PM10 Detection:</strong> Optical laser scattering sensor (0–999 ug/m3).</li>
          <li><strong>CO2 Telemetry:</strong> Non-dispersive infrared (NDIR) sensor (400–5000 ppm).</li>
          <li><strong>Connectivity:</strong> Dual-band Wi-Fi 6 + Bluetooth Low Energy 5.3 + Thread mesh.</li>
          <li><strong>Power Supply:</strong> USB-C PD or internal 4000mAh backup lithium battery.</li>
        </ul>
      `,
      brandId: brandAura.id,
      ratingAvg: 4.70,
      reviewCount: 15,
    },
    create: {
      name: 'Aura Connected Environmental Sensor Node',
      slug: 'aura-connected-sensor-node',
      shortDesc: 'Automated environmental telemetry & air quality monitoring node',
      fullDesc: `
        <p>The <strong>Aura Connected Sensor Node</strong> delivers precise indoor environmental intelligence. Equipped with laser PM2.5 particle counters, NDIR CO2 sensors, and relative humidity telemetry, it syncs seamlessly with MARQIVO smart automation networks.</p>
        <h3>Specifications Summary</h3>
        <ul>
          <li><strong>PM2.5 / PM10 Detection:</strong> Optical laser scattering sensor (0–999 ug/m3).</li>
          <li><strong>CO2 Telemetry:</strong> Non-dispersive infrared (NDIR) sensor (400–5000 ppm).</li>
          <li><strong>Connectivity:</strong> Dual-band Wi-Fi 6 + Bluetooth Low Energy 5.3 + Thread mesh.</li>
          <li><strong>Power Supply:</strong> USB-C PD or internal 4000mAh backup lithium battery.</li>
        </ul>
      `,
      brandId: brandAura.id,
      status: ProductStatus.ACTIVE,
      type: ProductType.PHYSICAL,
      ratingAvg: 4.70,
      reviewCount: 15,
    },
  });

  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product2.id,
        categoryId: catHardware.id,
      },
    },
    update: {},
    create: {
      productId: product2.id,
      categoryId: catHardware.id,
    },
  });

  await prisma.productMedia.deleteMany({ where: { productId: product2.id } });
  await prisma.productMedia.createMany({
    data: [
      {
        productId: product2.id,
        mediaUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80',
        altText: 'Aura Connected Sensor Node mounted on minimalist white wall',
        displayOrder: 1,
        isPrimary: true,
      },
      {
        productId: product2.id,
        mediaUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
        altText: 'Internal circuit board and precision NDIR sensor array',
        displayOrder: 2,
        isPrimary: false,
      },
    ],
  });

  // Options for Product 2 (Enclosure Finish)
  await prisma.productOption.deleteMany({ where: { productId: product2.id } });
  const optFinish = await prisma.productOption.create({
    data: {
      productId: product2.id,
      name: 'Finish',
      displayOrder: 1,
      values: {
        create: [
          { value: 'Anodized Slate', displayOrder: 1 },
          { value: 'Arctic Matte White', displayOrder: 2 },
        ],
      },
    },
    include: { values: true },
  });

  const valSlate = optFinish.values.find((v) => v.value === 'Anodized Slate')!;
  const valArctic = optFinish.values.find((v) => v.value === 'Arctic Matte White')!;

  await prisma.productVariant.deleteMany({ where: { productId: product2.id } });
  await prisma.productVariant.create({
    data: {
      productId: product2.id,
      sku: 'MQV-AUR-SLT',
      price: 14900.0, // ৳14,900
      compareAtPrice: 18900.0,
      weightKg: 0.35,
      isActive: true,
      variantOptions: { create: [{ optionValueId: valSlate.id }] },
      inventoryItems: { create: { warehouseId: warehouse.id, quantityOnHand: 40 } },
    },
  });

  await prisma.productVariant.create({
    data: {
      productId: product2.id,
      sku: 'MQV-AUR-WHT',
      price: 14900.0,
      compareAtPrice: 18900.0,
      weightKg: 0.35,
      isActive: true,
      variantOptions: { create: [{ optionValueId: valArctic.id }] },
      inventoryItems: { create: { warehouseId: warehouse.id, quantityOnHand: 18 } },
    },
  });

  // PRODUCT 3: Kinetic Ergonomic Workstation Stand
  const product3 = await prisma.product.upsert({
    where: { slug: 'kinetic-ergonomic-stand' },
    update: {
      name: 'Kinetic Ergonomic Aluminum Workstation Stand',
      status: ProductStatus.ACTIVE,
      type: ProductType.PHYSICAL,
      shortDesc: 'Precision CNC-machined laptop elevator & cable routing stand',
      fullDesc: `
        <p>Elevate your workspace aesthetics and neck posture with the <strong>Kinetic Ergonomic Stand</strong>. Machined from single-billet 6061 aircraft aluminum with laser-etched silicone pads to prevent device slippage.</p>
        <p>Supports all laptops and monitors up to 17 inches and 10kg in weight.</p>
      `,
      brandId: brandMarqivo.id,
      ratingAvg: 4.90,
      reviewCount: 38,
    },
    create: {
      name: 'Kinetic Ergonomic Aluminum Workstation Stand',
      slug: 'kinetic-ergonomic-stand',
      shortDesc: 'Precision CNC-machined laptop elevator & cable routing stand',
      fullDesc: `
        <p>Elevate your workspace aesthetics and neck posture with the <strong>Kinetic Ergonomic Stand</strong>. Machined from single-billet 6061 aircraft aluminum with laser-etched silicone pads to prevent device slippage.</p>
        <p>Supports all laptops and monitors up to 17 inches and 10kg in weight.</p>
      `,
      brandId: brandMarqivo.id,
      status: ProductStatus.ACTIVE,
      type: ProductType.PHYSICAL,
      ratingAvg: 4.90,
      reviewCount: 38,
    },
  });

  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product3.id,
        categoryId: catWorkspace.id,
      },
    },
    update: {},
    create: {
      productId: product3.id,
      categoryId: catWorkspace.id,
    },
  });

  await prisma.productMedia.deleteMany({ where: { productId: product3.id } });
  await prisma.productMedia.createMany({
    data: [
      {
        productId: product3.id,
        mediaUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
        altText: 'Kinetic Ergonomic Aluminum Stand with silver laptop',
        displayOrder: 1,
        isPrimary: true,
      },
      {
        productId: product3.id,
        mediaUrl: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800&q=80',
        altText: 'Rear cable management aperture detail view',
        displayOrder: 2,
        isPrimary: false,
      },
    ],
  });

  await prisma.productOption.deleteMany({ where: { productId: product3.id } });
  const optStandColor = await prisma.productOption.create({
    data: {
      productId: product3.id,
      name: 'Color',
      displayOrder: 1,
      values: {
        create: [
          { value: 'Space Gray', displayOrder: 1 },
          { value: 'Silver Alum', displayOrder: 2 },
        ],
      },
    },
    include: { values: true },
  });

  const valSpace = optStandColor.values.find((v) => v.value === 'Space Gray')!;
  const valSilver = optStandColor.values.find((v) => v.value === 'Silver Alum')!;

  await prisma.productVariant.deleteMany({ where: { productId: product3.id } });
  await prisma.productVariant.create({
    data: {
      productId: product3.id,
      sku: 'MQV-KIN-GRY',
      price: 12900.0, // ৳12,900
      compareAtPrice: 15500.0,
      weightKg: 1.12,
      isActive: true,
      variantOptions: { create: [{ optionValueId: valSpace.id }] },
      inventoryItems: { create: { warehouseId: warehouse.id, quantityOnHand: 50 } },
    },
  });

  await prisma.productVariant.create({
    data: {
      productId: product3.id,
      sku: 'MQV-KIN-SLV',
      price: 12900.0,
      compareAtPrice: 15500.0,
      weightKg: 1.12,
      isActive: true,
      variantOptions: { create: [{ optionValueId: valSilver.id }] },
      inventoryItems: { create: { warehouseId: warehouse.id, quantityOnHand: 32 } },
    },
  });

  console.log('✅ Rich PDP Seed data populated successfully!');
}
