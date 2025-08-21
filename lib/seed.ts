// prisma/seed.ts

import { PrismaClient, PropertyType, ReservationStatus, RoomStatus, UserStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting the seeding process for Tropicana Worldwide Corporation...');

  // 1. CLEANUP: Delete existing data to ensure a clean slate
  console.log('🧹 Wiping the database clean...');
  // Deletion order is crucial to avoid foreign key constraint violations.
  await prisma.userBusinessUnitRole.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.userPermission.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.charge.deleteMany();
  await prisma.folio.deleteMany();
  await prisma.stay.deleteMany();
  await prisma.guestInteraction.deleteMany();
  await prisma.reservationRoom.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.task.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.service.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.roomTypeAmenity.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.room.deleteMany();
  await prisma.roomRate.deleteMany();
  await prisma.roomType_Model.deleteMany();
  await prisma.department.deleteMany();
  await prisma.heroSlide.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.contactForm.deleteMany();
  await prisma.newsletter.deleteMany();
  await prisma.websiteConfiguration.deleteMany();
  await prisma.page.deleteMany();
  await prisma.contentItem.deleteMany();
  await prisma.mediaItem.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.businessUnit.deleteMany();
  console.log('✅ Database cleaned.');

  // 2. SEED CORE DATA: Admin User & Roles
  console.log('🌱 Seeding core data (Admin, Roles)...');
  const hashedPassword = await bcrypt.hash('asdasd123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@tropicana.com',
      username: 'admin',
      firstName: 'Tropicana',
      lastName: 'Admin',
      passwordHash: hashedPassword,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  const adminRole = await prisma.role.create({
    data: { name: 'SUPER_ADMIN', displayName: 'Super Administrator', isSystem: true },
  });
  const managerRole = await prisma.role.create({
    data: { name: 'HOTEL_MANAGER', displayName: 'Hotel Manager' },
  });
  const frontDeskRole = await prisma.role.create({
    data: { name: 'FRONT_DESK', displayName: 'Front Desk Staff' },
  });
  console.log('✅ Admin user and roles created.');

  // 3. SEED BUSINESS UNITS (HOTELS)
  console.log('🏨 Seeding Business Units (Hotels)...');
  const anchorHotel = await prisma.businessUnit.create({
    data: {
      name: 'Anchor Hotel',
      displayName: 'Anchor Hotel by Tropicana',
      propertyType: PropertyType.BOUTIQUE_HOTEL,
      city: 'General Santos',
      country: 'Philippines',
      address: '123 Pioneer Avenue, General Santos City',
      phone: '+63 83 555 1001',
      email: 'anchor@tropicana.com',
      website: 'anchor.tropicana.local', // Use for local dev mapping
      logo: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
      createdBy: adminUser.id,
    },
  });

  const tropicanaResort = await prisma.businessUnit.create({
    data: {
      name: 'Dolores Tropicana Resort',
      displayName: 'Dolores Tropicana Resort',
      propertyType: PropertyType.RESORT,
      city: 'General Santos',
      country: 'Philippines',
      address: '456 Beachfront, General Santos City',
      phone: '+63 83 555 2002',
      email: 'tropicana@tropicana.com',
      website: 'tropicana.tropicana.local',
      logo: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg',
      createdBy: adminUser.id,
    },
  });

  const lakeResort = await prisma.businessUnit.create({
    data: {
      name: 'Dolores Lake Resort',
      displayName: 'Dolores Lake Resort',
      propertyType: PropertyType.RESORT,
      city: 'Lake Sebu',
      country: 'Philippines',
      address: '789 Lakeside Drive, Lake Sebu, South Cotabato',
      phone: '+63 83 555 3003',
      email: 'lake@tropicana.com',
      website: 'lake.tropicana.local',
      logo: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg',
      createdBy: adminUser.id,
    },
  });

  const farmResort = await prisma.businessUnit.create({
    data: {
      name: 'Dolores Farm Resort',
      displayName: 'Dolores Farm Resort',
      propertyType: PropertyType.RESORT,
      city: 'Polomolok',
      country: 'Philippines',
      address: '101 Agri-Tourism Rd, Polomolok, South Cotabato',
      phone: '+63 83 555 4004',
      email: 'farm@tropicana.com',
      website: 'farm.tropicana.local',
      logo: 'https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg',
      createdBy: adminUser.id,
    },
  });

  const allBusinessUnits = [anchorHotel, tropicanaResort, lakeResort, farmResort];
  console.log('✅ 4 Business Units created.');

  // Assign Admin User to all Business Units
  for (const bu of allBusinessUnits) {
    await prisma.userBusinessUnitRole.create({
      data: {
        userId: adminUser.id,
        businessUnitId: bu.id,
        roleId: adminRole.id,
        assignedBy: adminUser.id,
      },
    });
  }
  console.log('✅ Admin user assigned to all properties.');

  // 4. SEED PROPERTY-SPECIFIC DATA (Amenities, Rooms, etc.)
  console.log('🏡 Seeding property-specific data...');
  for (const bu of allBusinessUnits) {
    console.log(`\n--- Seeding for ${bu.displayName} ---`);

    // A. Create Amenities for the property
    const wifi = await prisma.amenity.create({ data: { businessUnitId: bu.id, name: 'High-Speed WiFi', category: 'Room', icon: 'Wifi' } });
    const pool = await prisma.amenity.create({ data: { businessUnitId: bu.id, name: 'Swimming Pool', category: 'Property', icon: 'Waves' } });
    const parking = await prisma.amenity.create({ data: { businessUnitId: bu.id, name: 'Free Parking', category: 'Property', icon: 'Car' } });
    const restaurant = await prisma.amenity.create({ data: { businessUnitId: bu.id, name: 'On-site Restaurant', category: 'Dining', icon: 'Utensils' } });
    const ac = await prisma.amenity.create({ data: { businessUnitId: bu.id, name: 'Air Conditioning', category: 'Room', icon: 'Wind' } });

    // B. Create Room Types for the property
    const deluxeRoom = await prisma.roomType_Model.create({
      data: {
        businessUnitId: bu.id,
        name: 'DELUXE_ROOM',
        displayName: 'Deluxe Room',
        type: 'DELUXE',
        maxOccupancy: 2,
        bedConfiguration: '1 King Bed or 2 Twin Beds',
        baseRate: faker.number.int({ min: 3500, max: 5000 }),
        primaryImage: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
        images: [
'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg', 'https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg',
        'https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg', 'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg',
        'https://images.pexels.com/photos/6782473/pexels-photo-6782473.jpeg', 'https://images.pexels.com/photos/6434622/pexels-photo-6434622.jpeg',
        'https://images.pexels.com/photos/5998120/pexels-photo-5998120.jpeg', 'https://images.pexels.com/photos/6585758/pexels-photo-6585758.jpeg',
        'https://images.pexels.com/photos/70441/pexels-photo-70441.jpeg', 'https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg'
        ],
        amenities: {
          create: [{ amenityId: wifi.id }, { amenityId: ac.id }],
        },
      },
    });

    const suiteRoom = await prisma.roomType_Model.create({
      data: {
        businessUnitId: bu.id,
        name: 'EXECUTIVE_SUITE',
        displayName: 'Executive Suite',
        type: 'SUITE',
        maxOccupancy: 4,
        hasLivingArea: true,
        bedConfiguration: '1 King Bed, 1 Sofa Bed',
        baseRate: faker.number.int({ min: 8000, max: 12000 }),
        primaryImage: 'https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg',
        images: [
   'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg', 'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg',
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg', 'https://images.pexels.com/photos/271753/pexels-photo-271753.jpeg',
        'https://images.pexels.com/photos/271805/pexels-photo-271805.jpeg', 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg',
        'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg', 'https://images.pexels.com/photos/7512041/pexels-photo-7512041.jpeg',
        'https://images.pexels.com/photos/6587849/pexels-photo-6587849.jpeg', 'https://images.pexels.com/photos/545012/pexels-photo-545012.jpeg'
        ],
        amenities: {
          create: [{ amenityId: wifi.id }, { amenityId: ac.id }, { amenityId: parking.id }],
        },
      },
    });

    

    // C. Create physical Rooms for each Room Type
    for (let i = 1; i <= 10; i++) {
      await prisma.room.create({ data: { businessUnitId: bu.id, roomTypeId: deluxeRoom.id, roomNumber: `D${100 + i}` } });
    }
    for (let i = 1; i <= 5; i++) {
      await prisma.room.create({ data: { businessUnitId: bu.id, roomTypeId: suiteRoom.id, roomNumber: `S${200 + i}` } });
    }

    // D. Create a Website Configuration
    await prisma.websiteConfiguration.create({
        data: {
            businessUnitId: bu.id,
            siteName: bu.displayName,
            tagline: `Experience luxury at ${bu.displayName}`,
            primaryPhone: bu.phone,
            primaryEmail: bu.email,
        }
    });

    // E. Create Hero Slides for the website
    await prisma.heroSlide.create({
        data: {
            businessUnitId: bu.id,
            title: `Welcome to ${bu.displayName}`,
            subtitle: "Your perfect getaway awaits.",
            backgroundImage: faker.image.urlLoremFlickr({ category: 'hotel' }),
            ctaText: "Book Now",
            ctaUrl: "/booking",
        }
    });

    // F. Create Testimonials
    for (let i = 0; i < 3; i++) {
        await prisma.testimonial.create({
            data: {
                businessUnitId: bu.id,
                guestName: faker.person.fullName(),
                content: faker.lorem.paragraph(),
                rating: faker.number.int({ min: 4, max: 5 }),
                isFeatured: true,
            }
        });
    }
    
    // G. Create FAQs
    await prisma.fAQ.create({
        data: {
            businessUnitId: bu.id,
            question: "What are the check-in and check-out times?",
            answer: "Check-in is at 3:00 PM and check-out is at 12:00 PM.",
            category: "General",
        }
    });

    console.log(`✅ Seeded ${bu.displayName} with amenities, rooms, and website content.`);
  }
}

main()
  .catch((e) => {
    console.error('An error occurred during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('👋 Seeding process finished. Disconnecting Prisma Client.');
    await prisma.$disconnect();
  });
