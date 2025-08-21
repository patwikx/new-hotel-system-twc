// prisma/seed.ts

import { PrismaClient, ReservationStatus, UserStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';

// Instantiate Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting the seeding process...');

  // ---------------------------------------------------------------------------
  // 1. CLEANUP: Delete existing data to ensure a clean slate
  // ---------------------------------------------------------------------------
  // Deletion order is important to avoid foreign key constraint violations.
  console.log('🧹 Cleaning up the database...');
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

  // ---------------------------------------------------------------------------
  // 2. SEED CORE DATA: Users, Roles, Permissions, Business Units
  // ---------------------------------------------------------------------------
  console.log('🌱 Seeding core data...');

  // Create Permissions
  const permissions = await prisma.permission.createMany({
    data: [
      { name: 'users:create', displayName: 'Create Users', module: 'users' },
      { name: 'users:read', displayName: 'Read Users', module: 'users' },
      { name: 'users:update', displayName: 'Update Users', module: 'users' },
      { name: 'users:delete', displayName: 'Delete Users', module: 'users' },
      { name: 'reservations:create', displayName: 'Create Reservations', module: 'reservations' },
      { name: 'reservations:read', displayName: 'Read Reservations', module: 'reservations' },
      { name: 'reservations:update', displayName: 'Update Reservations', module: 'reservations' },
      { name: 'reservations:delete', displayName: 'Delete Reservations', module: 'reservations' },
      { name: 'content:manage', displayName: 'Manage Content', module: 'content' },
    ],
  });
  console.log('Permissions seeded.');

  // Create Roles
  const adminRole = await prisma.role.create({
    data: {
      name: 'SUPER_ADMIN',
      displayName: 'Super Administrator',
      isSystem: true,
    },
  });
  const hotelManagerRole = await prisma.role.create({
    data: { name: 'HOTEL_MANAGER', displayName: 'Hotel Manager' },
  });
  const frontDeskRole = await prisma.role.create({
    data: { name: 'FRONT_DESK', displayName: 'Front Desk Staff' },
  });
  console.log('Roles seeded.');

  // Assign all permissions to Super Admin
  const allPermissions = await prisma.permission.findMany();
  await prisma.rolePermission.createMany({
    data: allPermissions.map((p) => ({
      roleId: adminRole.id,
      permissionId: p.id,
    })),
  });
  console.log('Permissions assigned to Super Admin.');
  
  // Assign specific permissions to Hotel Manager
  const managerPermissions = await prisma.permission.findMany({
    where: { module: { in: ['reservations', 'users'] } }
  });
  await prisma.rolePermission.createMany({
      data: managerPermissions.map(p => ({
          roleId: hotelManagerRole.id,
          permissionId: p.id,
      }))
  });
   console.log('Permissions assigned to Hotel Manager.');


  // Create a Super Admin User
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@tropicana.com',
      username: 'superadmin',
      firstName: 'Tropicana',
      lastName: 'Admin',
      passwordHash: hashedPassword,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });
  console.log('Super Admin user created.');

  // Create a Business Unit (Hotel Property)
  const tropicanaMakati = await prisma.businessUnit.create({
    data: {
      name: 'Tropicana Makati',
      displayName: 'Tropicana Worldwide - Makati',
      propertyType: 'HOTEL',
      city: 'Makati',
      country: 'Philippines',
      address: '123 Ayala Avenue, Makati City',
      phone: '+63 2 8888 1234',
      email: 'reservations.makati@tropicana.com',
      website: 'https://makati.tropicana.com',
      createdBy: adminUser.id,
    },
  });
  console.log('Business Unit "Tropicana Makati" created.');

  // Assign Super Admin role to the admin user for the created business unit
  await prisma.userBusinessUnitRole.create({
    data: {
      userId: adminUser.id,
      businessUnitId: tropicanaMakati.id,
      roleId: adminRole.id,
      assignedBy: adminUser.id,
    },
  });
  console.log('Assigned Super Admin role to the user.');
  
  console.log('✅ Core data seeded.');

  // ---------------------------------------------------------------------------
  // 3. SEED PROPERTY DATA: Room Types, Rooms, Amenities
  // ---------------------------------------------------------------------------
  console.log('🌱 Seeding property data...');

  const deluxeRoomType = await prisma.roomType_Model.create({
    data: {
      businessUnitId: tropicanaMakati.id,
      name: 'DELUXE_KING',
      displayName: 'Deluxe King Room',
      type: 'DELUXE',
      maxOccupancy: 2,
      maxAdults: 2,
      bedConfiguration: '1 King Bed',
      roomSize: 32.5,
      baseRate: 5500.0,
      primaryImage: faker.image.urlLoremFlickr({ category: 'hotel,room' }),
    },
  });

  const suiteRoomType = await prisma.roomType_Model.create({
    data: {
      businessUnitId: tropicanaMakati.id,
      name: 'EXECUTIVE_SUITE',
      displayName: 'Executive Suite',
      type: 'SUITE',
      maxOccupancy: 4,
      maxAdults: 3,
      maxChildren: 2,
      bedConfiguration: '1 King Bed, 1 Sofa Bed',
      roomSize: 65.0,
      baseRate: 12000.0,
      hasLivingArea: true,
      hasOceanView: false, // It's Makati :)
      primaryImage: faker.image.urlLoremFlickr({ category: 'hotel,suite' }),
    },
  });
  console.log('Room Types created.');

  // Create Rooms for each type
  for (let i = 1; i <= 10; i++) {
    await prisma.room.create({
      data: {
        businessUnitId: tropicanaMakati.id,
        roomTypeId: deluxeRoomType.id,
        roomNumber: `2${i.toString().padStart(2, '0')}`, // 201, 202...
        floor: 2,
      },
    });
  }
  for (let i = 1; i <= 5; i++) {
    await prisma.room.create({
      data: {
        businessUnitId: tropicanaMakati.id,
        roomTypeId: suiteRoomType.id,
        roomNumber: `5${i.toString().padStart(2, '0')}`, // 501, 502...
        floor: 5,
        specialFeatures: ['Corner Room', 'City View'],
      },
    });
  }
  console.log('Rooms created.');

  console.log('✅ Property data seeded.');

  // ---------------------------------------------------------------------------
  // 4. SEED GUESTS & RESERVATIONS
  // ---------------------------------------------------------------------------
  console.log('🌱 Seeding guests and reservations...');
  
  for (let i = 0; i < 20; i++) {
    const guest = await prisma.guest.create({
      data: {
        businessUnitId: tropicanaMakati.id,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        nationality: faker.location.country(),
      },
    });

    const checkIn = faker.date.between({ from: new Date('2025-08-22'), to: new Date('2025-10-31') });
    const nights = faker.number.int({ min: 1, max: 7 });
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkIn.getDate() + nights);
    
    const roomType = i % 3 === 0 ? suiteRoomType : deluxeRoomType;
    const totalAmount = nights * Number(roomType.baseRate);

    // Create a reservation
    await prisma.reservation.create({
      data: {
        businessUnitId: tropicanaMakati.id,
        guestId: guest.id,
        confirmationNumber: `TRP-MKT-${faker.string.alphanumeric(8).toUpperCase()}`,
        status: faker.helpers.arrayElement([
            ReservationStatus.CONFIRMED, 
            ReservationStatus.CHECKED_IN,
            ReservationStatus.CHECKED_OUT,
            ReservationStatus.CANCELLED
        ]),
        checkInDate: checkIn,
        checkOutDate: checkOut,
        nights: nights,
        adults: 2,
        totalAmount: totalAmount,
        subtotal: totalAmount,
        currency: 'PHP',
        bookedBy: adminUser.id,
        rooms: {
          create: {
            roomTypeId: roomType.id,
            rate: roomType.baseRate,
            nights: nights,
            subtotal: totalAmount
          }
        }
      },
    });
  }
  console.log('✅ Guests and Reservations seeded.');
  
  // ---------------------------------------------------------------------------
  // 5. SEED WEBSITE CONTENT
  // ---------------------------------------------------------------------------
  console.log('🌱 Seeding website content...');
  
  await prisma.websiteConfiguration.create({
    data: {
        businessUnitId: tropicanaMakati.id,
        siteName: 'Tropicana Makati Hotel',
        tagline: 'Your Oasis in the Heart of the City',
    }
  });

  await prisma.heroSlide.createMany({
    data: [
        {
            businessUnitId: tropicanaMakati.id,
            title: "Experience Unparalleled Luxury",
            subtitle: "Tropicana Makati",
            backgroundImage: faker.image.urlLoremFlickr({ category: 'hotel,lobby' }),
            ctaText: "Book Now",
            ctaUrl: "/booking",
            sortOrder: 1,
        },
        {
            businessUnitId: tropicanaMakati.id,
            title: "Your Perfect City Getaway",
            subtitle: "Book your stay with us",
            backgroundImage: faker.image.urlLoremFlickr({ category: 'hotel,pool' }),
            ctaText: "View Rooms",
            ctaUrl: "/rooms",
            sortOrder: 2,
        },
    ]
  });

  await prisma.fAQ.createMany({
      data: [
          {
            businessUnitId: tropicanaMakati.id,
            question: "What are the check-in and check-out times?",
            answer: "Check-in time is 3:00 PM and check-out time is 12:00 PM (noon).",
            category: "General"
          },
          {
            businessUnitId: tropicanaMakati.id,
            question: "Is there parking available at the hotel?",
            answer: "Yes, we offer complimentary self-parking for all our registered guests.",
            category: "Amenities"
          },
      ]
  });
  console.log('✅ Website content seeded.');

}

// Execute the main function
main()
  .catch((e) => {
    console.error('An error occurred during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Close the Prisma Client connection
    console.log('👋 Seeding process finished. Disconnecting Prisma Client.');
    await prisma.$disconnect();
  });