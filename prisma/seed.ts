import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Strongmate Chemicals Training Portal database...");

  // Clean existing data
  await prisma.securityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.document.deleteMany();
  await prisma.videoProgress.deleteMany();
  await prisma.video.deleteMany();
  await prisma.module.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.product.deleteMany();
  await prisma.accessCode.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Default Password Hash: ChangeMe@123
  const defaultPasswordHash = await bcrypt.hash("ChangeMe@123", 10);

  // 1. Create ADMIN User
  const admin = await prisma.user.create({
    data: {
      empId: "SMC0001",
      name: "Sanjay Mohanty",
      email: "admin@strongmatechemicals.com",
      phone: "+91 9876543210",
      role: "ADMIN",
      department: "Corporate Management",
      designation: "Training Director",
      passwordHash: defaultPasswordHash,
      status: "ACTIVE",
      mustChangePassword: false,
    },
  });

  // 2. Create LEARNER Users
  const learner1 = await prisma.user.create({
    data: {
      empId: "SMC1001",
      name: "Rahul Kumar",
      email: "rahul.kumar@strongmatechemicals.com",
      phone: "+91 9876543212",
      role: "LEARNER",
      department: "Technical Sales & Field Application",
      designation: "Sales Executive Trainee",
      passwordHash: defaultPasswordHash,
      status: "ACTIVE",
      mustChangePassword: false,
    },
  });

  const learner2 = await prisma.user.create({
    data: {
      empId: "SMC1002",
      name: "Ananya Patnaik",
      email: "ananya.patnaik@strongmatechemicals.com",
      phone: "+91 9876543213",
      role: "LEARNER",
      department: "Quality Assurance",
      designation: "Lab Chemist Trainee",
      passwordHash: defaultPasswordHash,
      status: "ACTIVE",
      mustChangePassword: false,
    },
  });

  const learner3 = await prisma.user.create({
    data: {
      empId: "SMC1003",
      name: "Bikash Sahoo",
      email: "bikash.sahoo@strongmatechemicals.com",
      phone: "+91 9876543214",
      role: "LEARNER",
      department: "Plant Operations",
      designation: "Production Trainee - Balasore Unit",
      passwordHash: defaultPasswordHash,
      status: "ACTIVE",
      mustChangePassword: false,
    },
  });

  console.log("✅ Admin & Learner users created.");

  // 3. Access Codes
  await prisma.accessCode.createMany({
    data: [
      {
        code: "SMC-TRAIN-2026",
        description: "General New Joiner Onboarding Batch 2026",
        maxUses: 200,
        usedCount: 14,
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      },
      {
        code: "QLUMATE-SALES-2026",
        description: "Dealer & Field Staff Special Access Code",
        maxUses: 50,
        usedCount: 8,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // 4. Qlumate Products Catalog
  const products = [
    {
      name: "Qlumate Black Guard",
      category: "Waterproofing",
      description: "High-performance liquid elastomeric coal-tar/acrylic waterproofing coating formulated for wet areas, retaining walls, basements, and foundation protection.",
      keyBenefits: "• 300% Elongation elastomeric protection\n• Excellent crack bridging capability up to 2mm\n• Seamless waterproof barrier resistant to soil chemicals\n• Quick drying with superior substrate adhesion",
      applicationProcedure: "1. Clean surface thoroughly from oil, grease, and loose particles.\n2. Prime surface using 1:1 diluted Black Guard with water.\n3. Apply 1st neat coat by brush or roller.\n4. Embed glass fiber mesh at corners and stress points.\n5. Apply 2nd coat perpendicular to 1st coat after 4 hours touch dry time.",
      coverage: "1.2 - 1.5 kg/sq.m for 2 coats depending on substrate porosity",
      mixingInstructions: "Ready to use single component. Stir thoroughly before application.",
      dosage: "Neat application (1.5 kg/m² total system)",
      dosAndDonts: "DO: Pre-wet porous concrete slightly.\nDON'T: Apply during rainfall or on standing water.",
      imageUrl: "/images/products/black-guard.jpg",
      pdfUrl: "/documents/Qlumate-Black-Guard-TDS.pdf",
    },
    {
      name: "Qlumate White Guard",
      category: "Cool Coating",
      description: "Premium solar reflective thermal insulation and waterproofing elastomeric roof coating designed for exposed terrace roofs, concrete decks, and metal sheets.",
      keyBenefits: "• High Solar Reflective Index (SRI > 105)\n• Reduces indoor room temperature by up to 6°C - 8°C\n• 100% Waterproof & UV resistant formulation\n• Anti-algae and fungus resistant finish",
      applicationProcedure: "1. Repair structural cracks with Qlumate Crack Fill.\n2. Wash roof surface with high pressure water jet.\n3. Apply Qlumate Primer coat.\n4. Apply 2 coats of White Guard in crosswise directions with 6 hours interval.",
      coverage: "2.0 - 2.2 sq.m per litre for 2 coats",
      mixingInstructions: "Single pack ready to use. Can be diluted with 5% clean water for primer coat.",
      dosage: "2 coats @ 110 microns dry film thickness total",
      dosAndDonts: "DO: Ensure minimum slope of 1:80 on roof.\nDON'T: Apply over wet or uncured screed.",
      imageUrl: "/images/products/white-guard.jpg",
      pdfUrl: "/documents/Qlumate-White-Guard-TDS.pdf",
    },
    {
      name: "Qlumate SBR Bonding Agent",
      category: "Waterproofing",
      description: "Styrene Butadiene Rubber (SBR) latex modified bonding polymer and waterproofing additive for high-strength repair mortars and concrete waterproofing.",
      keyBenefits: "• Increases bond strength to old concrete by 300%\n• Reduces water permeability dramatically\n• Enhances flexural and tensile strength\n• Prevents carbonation and chloride penetration",
      applicationProcedure: "For bonding slurry: Mix 1 part SBR + 1.5 parts Cement by volume. Brush onto cleaned concrete substrate immediately before placing repair mortar.",
      coverage: "Bonding slurry: 4.5 - 5.0 sq.m / litre",
      mixingInstructions: "Mix thoroughly with fresh OPC cement using mechanical stirrer.",
      dosage: "10% to 15% by weight of cement for repair mortars",
      dosAndDonts: "DO: Apply repair mortar while slurry coat is still wet & tacky.\nDON'T: Allow slurry to dry before overlaying.",
      imageUrl: "/images/products/sbr-bonding.jpg",
      pdfUrl: "/documents/Qlumate-SBR-TDS.pdf",
    },
    {
      name: "Qlumate QLW-100 Concrete Admixture",
      category: "Concrete Admixtures",
      description: "Advanced liquid integral waterproofing admixture formulated with hydrophobic pore-blocking active chemicals for plaster and concrete structural waterproofing.",
      keyBenefits: "• Blocks capillary pores inside concrete matrix\n• Reduces water absorption by over 80%\n• Improves concrete workability and cohesion\n• Chloride-free, non-corrosive to reinforcement steel",
      applicationProcedure: "Add directly into gauging water before mixing into concrete mixer or batching plant.",
      coverage: "N/A (Dosage based on cement weight)",
      mixingInstructions: "Mix with gauging water for at least 2 minutes.",
      dosage: "200ml per 50kg bag of cement",
      dosAndDonts: "DO: Ensure uniform mixing throughout concrete batch.\nDON'T: Add directly into dry cement powder.",
      imageUrl: "/images/products/qlw-100.jpg",
      pdfUrl: "/documents/Qlumate-QLW100-TDS.pdf",
    },
    {
      name: "Qlumate Silk Plaster & Wall Putty",
      category: "Wall Finishing",
      description: "White cement & polymer-based water-resistant smooth wall finishing putty for interior and exterior concrete/plaster surfaces.",
      keyBenefits: "• Super smooth silk finish with exceptional whiteness\n• Water resistant - protects expensive wall paint from flaking\n• Excellent paint coverage reduction (saves 25% paint)\n• No water curing required",
      applicationProcedure: "1. Clean wall surface with wire brush.\n2. Pre-wet wall lightly.\n3. Mix 1kg putty with 350-400ml clean water into smooth paste.\n4. Apply 1st coat with putty blade (1.5mm max).\n5. Apply 2nd coat after 4 hours.",
      coverage: "1.8 - 2.2 sq.m per kg for 2 coats",
      mixingInstructions: "Use mechanical stirrer for 3-5 minutes until lump-free.",
      dosage: "Water ratio: 35-40% by weight of powder",
      dosAndDonts: "DO: Allow 4 hours dry time between coats.\nDON'T: Apply coat thicker than 2mm single layer.",
      imageUrl: "/images/products/silk-plaster.jpg",
      pdfUrl: "/documents/Qlumate-Silk-Plaster-TDS.pdf",
    },
    {
      name: "Qlumate Epoxy Tile Grout & Adhesive",
      category: "Tile Fixing",
      description: "Three-part heavy duty chemical resistant epoxy tile joint filler for hygienic, stain-proof, waterproof tile grouting in commercial kitchens, hospitals, and swimming pools.",
      keyBenefits: "• 100% Waterproof and stain resistant\n• High mechanical strength & abrasion resistance\n• Anti-bacterial & anti-fungal hygiene formulation\n• Available in 16 vibrant decorative colors",
      applicationProcedure: "1. Ensure tile joints are clean and dry.\n2. Mix Part A, Part B, and Part C resin/hardener/filler as per ratio.\n3. Press grout into joints using rubber float.\n4. Wipe excess with wet sponge within 30 minutes.",
      coverage: "Varies based on tile dimension and joint width (approx 0.5kg/m² for 300x300mm tiles with 3mm joint)",
      mixingInstructions: "Mix Resin (Part A) + Hardener (Part B) thoroughly, then add Filler (Part C).",
      dosage: "Pre-measured 1kg / 5kg kit packaging",
      dosAndDonts: "DO: Clean tile surface immediately with sponge before epoxy sets.\nDON'T: Leave epoxy haze on tile face overnight.",
      imageUrl: "/images/products/epoxy-grout.jpg",
      pdfUrl: "/documents/Qlumate-Epoxy-Grout-TDS.pdf",
    }
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }
  console.log("✅ Qlumate products created.");

  // 5. Single Master Course, Module & 10 Tutorial Videos
  const masterCourse = await prisma.course.create({
    data: {
      title: "Strongmate Chemicals & Qlumate Complete Tutorial Program",
      description: "Official 10-Lesson Master Training Course on Construction Chemicals, Waterproofing Technology, and Qlumate Product Application. Complete all 10 video lessons to generate your verified certificate.",
      category: "Comprehensive Tutorial",
      difficulty: "All Levels",
      estimatedDuration: "3.5 Hours",
      trainerId: admin.id,
      status: "PUBLISHED",
      thumbnail: "https://img.youtube.com/vi/Mgd-6KszT80/hqdefault.jpg",
    },
  });

  const masterModule = await prisma.module.create({
    data: {
      courseId: masterCourse.id,
      title: "Module 1: 10-Step Video Tutorial Series",
      description: "Complete 10-step video tutorial series for SCPL joiners & applicator partners.",
      orderIndex: 1,
    },
  });

  const tutorialVideos = [
    {
      title: "1. Welcome to Strongmate Chemicals & Qlumate Brand Story",
      description: "Message from management, core mission in construction chemicals, and Odisha/India manufacturing footprint.",
      videoUrl: "https://youtu.be/Mgd-6KszT80",
      thumbnailUrl: "https://img.youtube.com/vi/Mgd-6KszT80/hqdefault.jpg",
      duration: 360,
      completionThreshold: 90,
      orderIndex: 1,
    },
    {
      title: "2. Balasore & Udaipur State-of-the-Art Manufacturing Infrastructure",
      description: "Overview of polymer reactors, dry-mix plaster plants, R&D testing labs, and ISO 9001 quality compliance.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800",
      duration: 480,
      completionThreshold: 90,
      orderIndex: 2,
    },
    {
      title: "3. Science of Water Damage & Efflorescence in Concrete Structures",
      description: "Technical breakdown of capillary suction, chloride attack, salt crystallization, and structural spalling.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=800",
      duration: 600,
      completionThreshold: 90,
      orderIndex: 3,
    },
    {
      title: "4. Surface Preparation & Substrate Saturation (SSD) Standard SOP",
      description: "Step-by-step substrate cleaning, surface saturation (SSD condition), V-groove crack cutting, and priming.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
      duration: 540,
      completionThreshold: 90,
      orderIndex: 4,
    },
    {
      title: "5. Qlumate Black Guard Coal-Tar & Acrylic Waterproofing Application",
      description: "Method statement, mixing ratios, wet film thickness measurement, mesh embedding, and water ponding test.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800",
      duration: 720,
      completionThreshold: 90,
      orderIndex: 5,
    },
    {
      title: "6. Qlumate White Guard Solar Thermal Shield Roof Coating SOP",
      description: "High Solar Reflective Index (SRI > 105) terrace roof coating procedure for thermal insulation.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylines.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800",
      duration: 600,
      completionThreshold: 90,
      orderIndex: 6,
    },
    {
      title: "7. Qlumate SBR Polymer Bonding Agent & Waterproof Repair Mortar Demo",
      description: "Polymer modified slurry coat for bonding old concrete to new mortar and spalling repairs.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800",
      duration: 540,
      completionThreshold: 90,
      orderIndex: 7,
    },
    {
      title: "8. Qlumate QLW-100 Hydrophobic Integral Concrete Waterproofing",
      description: "Batching dosage calculations (200ml / 50kg bag) for site concrete mixers and slump retention.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=800",
      duration: 480,
      completionThreshold: 90,
      orderIndex: 8,
    },
    {
      title: "9. Qlumate Silk Plaster & Smooth Water-Resistant Wall Putty Guide",
      description: "Application of polymer-based smooth wall putty for interior and exterior concrete walls.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutback2012.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800",
      duration: 450,
      completionThreshold: 90,
      orderIndex: 9,
    },
    {
      title: "10. Qlumate Epoxy Tile Grout & Joint Waterproof Sealing Masterclass",
      description: "Heavy-duty 3-part epoxy tile joint filling for hygienic, stain-proof, waterproof tile grouting.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800",
      duration: 600,
      completionThreshold: 90,
      orderIndex: 10,
    },
  ];

  const createdVideos = [];
  for (const v of tutorialVideos) {
    const createdVid = await prisma.video.create({
      data: {
        moduleId: masterModule.id,
        title: v.title,
        description: v.description,
        videoUrl: v.videoUrl,
        thumbnailUrl: v.thumbnailUrl,
        duration: v.duration,
        completionThreshold: v.completionThreshold,
        orderIndex: v.orderIndex,
      },
    });
    createdVideos.push(createdVid);
  }

  console.log("✅ 1 Master Course with 10 Tutorial Videos created.");

  // 6. Quizzes
  const quiz1 = await prisma.quiz.create({
    data: {
      courseId: masterCourse.id,
      moduleId: masterModule.id,
      title: "Qlumate Product Mastery & Application Assessment",
      passingScore: 80,
      timeLimitMinutes: 15,
      maxAttempts: 3,
    },
  });

  await prisma.quizQuestion.createMany({
    data: [
      {
        quizId: quiz1.id,
        question: "Which Qlumate product is used as an integral liquid waterproofing admixture in concrete & plaster?",
        options: JSON.stringify([
          "A. Qlumate Black Guard",
          "B. Qlumate QLW-100",
          "C. Qlumate Silk Plaster",
          "D. Qlumate Epoxy Grout"
        ]),
        correctAnswer: 1,
        explanation: "QLW-100 is the specialized hydrophobic liquid integral waterproofing compound for concrete and plaster mixes.",
      },
      {
        quizId: quiz1.id,
        question: "What is the recommended dosage of Qlumate QLW-100 per 50kg bag of cement?",
        options: JSON.stringify([
          "A. 50 ml",
          "B. 100 ml",
          "C. 200 ml",
          "D. 500 ml"
        ]),
        correctAnswer: 2,
        explanation: "Standard dosage for Qlumate QLW-100 is 200ml per 50kg bag of OPC/PPC cement.",
      },
      {
        quizId: quiz1.id,
        question: "What key advantage does Qlumate White Guard offer on exposed roof terraces?",
        options: JSON.stringify([
          "A. High Solar Reflective Index (SRI > 105) reducing room temp by 6-8°C",
          "B. Converts concrete into red color",
          "C. Eliminates the need for any water curing of mortar",
          "D. Functions as a tile adhesive"
        ]),
        correctAnswer: 0,
        explanation: "Qlumate White Guard features SRI > 105 which reflects heat solar radiation and waterproofs roof decks.",
      },
      {
        quizId: quiz1.id,
        question: "What is the primary function of Qlumate SBR Bonding Agent?",
        options: JSON.stringify([
          "A. Paint solvent",
          "B. Styrene butadiene polymer for bonding old concrete to new mortar",
          "C. Wall crack filling putty",
          "D. Tile grout cleaning chemical"
        ]),
        correctAnswer: 1,
        explanation: "SBR latex acts as a high-strength polymer bonding slurry and modifier for waterproof repair mortars.",
      },
      {
        quizId: quiz1.id,
        question: "Before applying Qlumate Black Guard on concrete slabs, what condition should the substrate be in?",
        options: JSON.stringify([
          "A. Submerged under 5cm of standing water",
          "B. Dry and covered with dust",
          "C. Thoroughly cleaned, sound, and Saturated Surface Dry (SSD)",
          "D. Oiled with diesel engine oil"
        ]),
        correctAnswer: 2,
        explanation: "Substrate must be structurally clean, free of loose dust or grease, and damp/SSD without standing water.",
      },
    ],
  });

  console.log("✅ Quizzes and Questions created.");

  // 7. Documents
  await prisma.document.createMany({
    data: [
      {
        title: "Qlumate Technical Product Catalog 2026",
        category: "Catalog",
        fileUrl: "/documents/Qlumate-Full-Product-Catalog.pdf",
        isDownloadable: true,
        courseId: masterCourse.id,
      },
      {
        title: "Waterproofing Application Method Statement & SOP",
        category: "SOP",
        fileUrl: "/documents/Waterproofing-SOP-Strongmate.pdf",
        isDownloadable: true,
        courseId: masterCourse.id,
      },
      {
        title: "Qlumate QLW-100 Technical Data Sheet (TDS)",
        category: "TDS",
        fileUrl: "/documents/Qlumate-QLW100-TDS.pdf",
        isDownloadable: true,
        courseId: masterCourse.id,
      },
      {
        title: "Material Safety Data Sheet (MSDS) - Chemical Handling",
        category: "Safety",
        fileUrl: "/documents/Chemical-Safety-MSDS-Strongmate.pdf",
        isDownloadable: false,
        courseId: masterCourse.id,
      },
    ],
  });

  // 8. Enrollments & Progress for Rahul (Learner 1)
  await prisma.enrollment.create({
    data: {
      userId: learner1.id,
      courseId: masterCourse.id,
      status: "ENROLLED",
      progress: 30,
    },
  });

  await prisma.videoProgress.create({
    data: {
      userId: learner1.id,
      videoId: createdVideos[0].id,
      courseId: masterCourse.id,
      watchedPercentage: 100,
      lastPosition: 360.0,
      isCompleted: true,
      device: "Chrome / Windows 11",
      ipAddress: "103.211.14.88 (Bhubaneswar, IN)",
    },
  });

  await prisma.videoProgress.create({
    data: {
      userId: learner1.id,
      videoId: createdVideos[1].id,
      courseId: masterCourse.id,
      watchedPercentage: 100,
      lastPosition: 480.0,
      isCompleted: true,
      device: "Chrome / Windows 11",
      ipAddress: "103.211.14.88 (Bhubaneswar, IN)",
    },
  });

  await prisma.videoProgress.create({
    data: {
      userId: learner1.id,
      videoId: createdVideos[2].id,
      courseId: masterCourse.id,
      watchedPercentage: 100,
      lastPosition: 600.0,
      isCompleted: true,
      device: "Chrome / Windows 11",
      ipAddress: "103.211.14.88 (Bhubaneswar, IN)",
    },
  });

  // Sample Certificate for Rahul
  await prisma.certificate.create({
    data: {
      certificateId: "SMC-QP-2026-00125",
      userId: learner1.id,
      courseId: masterCourse.id,
      issueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      qrCodeData: `https://strongmatechemicals.com/verify-certificate?id=SMC-QP-2026-00125`,
    },
  });

  // 9. Announcements
  await prisma.announcement.createMany({
    data: [
      {
        title: "Welcome New Joiner Batch 2026!",
        content: "We are excited to welcome all new joiners to Strongmate Chemicals Pvt. Ltd. Please complete your mandatory orientation and product modules within 14 days.",
        targetRole: "ALL",
        priority: "HIGH",
        authorId: admin.id,
      },
      {
        title: "New Video Module Uploaded by Admin",
        content: "Module 4 for Qlumate White Guard Solar Thermal Shield application is now live.",
        targetRole: "LEARNER",
        priority: "NORMAL",
        authorId: admin.id,
      },
    ],
  });

  // 10. Security Logs
  await prisma.securityLog.createMany({
    data: [
      {
        userId: learner1.id,
        empId: learner1.empId,
        action: "USER_LOGIN_SUCCESS",
        details: "Login successful via Password authentication",
        ipAddress: "103.211.14.88",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0",
        severity: "INFO",
      },
      {
        userId: admin.id,
        empId: admin.empId,
        action: "VIDEO_UPLOADED_BY_ADMIN",
        details: "Admin uploaded Qlumate Black Guard Application Training Video",
        ipAddress: "103.211.14.88",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0",
        severity: "INFO",
      },
    ],
  });

  console.log("🎉 Strongmate Chemicals database seeded successfully with 2 roles (ADMIN & LEARNER)!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
