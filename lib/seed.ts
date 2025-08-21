import { PrismaClient, PermissionScope, RoomType, OfferType, EventStatus, RestaurantType, PropertyType, RoomStatus, EventType, OfferStatus, Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Helper function to create a random date range
function getRandomDateRange() {
  const start = faker.date.soon({ days: 30 });
  const end = faker.date.soon({ days: 30, refDate: start });
  return { start, end };
}

// Real-world image URLs for seeding from Pexels
const imageSets = {
  anchorHotel: [
    'https://images.pexels.com/photos/17568600/pexels-photo-17568600/free-photo-of-hotel-in-new-york-city.jpeg?auto=compress&cs=tinysrgb&w=3000&h=3000&dpr=1',
    'https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg?auto=compress&cs=tinysrgb&w=3000&h=3000&dpr=1',
    'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=3000&h=3000&dpr=1',
  ],
  doloresFarmResort: [
    'https://images.pexels.com/photos/3773573/pexels-photo-3773573.jpeg?auto=compress&cs=tinysrgb&w=3000&h=3000&dpr=1',
    'https://images.pexels.com/photos/16301366/pexels-photo-16301366/free-photo-of-a-close-up-of-a-rooster-in-a-barnyard.jpeg?auto=compress&cs=tinysrgb&w=3000&h=3000&dpr=1',
    'https://images.pexels.com/photos/4006151/pexels-photo-4006151.jpeg?auto=compress&cs=tinysrgb&w=3000&h=3000&dpr=1',
  ],
  doloresLakeResort: [
    'https://images.pexels.com/photos/20121703/pexels-photo-20121703/free-photo-of-aerial-view-of-a-lake-and-mountains.jpeg?auto=compress&cs=tinysrgb&w=3000&h=3000&dpr=1',
    'https://images.pexels.com/photos/20562143/pexels-photo-20562143/free-photo-of-an-aerial-view-of-a-lake-in-the-mountains.jpeg?auto=compress&cs=tinysrgb&w=3000&h=3000&dpr=1',
    'https://images.pexels.com/photos/1036855/pexels-photo-1036855.jpeg?auto=compress&cs=tinysrgb&w=3000&h=3000&dpr=1',
  ],
  doloresTropicanaResort: [
    'https://images.pexels.com/photos/1838554/pexels-photo-1838554.jpeg?auto=compress&cs=tinysrgb&w=3000&h=3000&dpr=1',
    'https://images.pexels.com/photos/1572979/pexels-photo-1572979.jpeg?auto=compress&cs=tinysrgb&w=3000&h=3000&dpr=1',
    'https://images.pexels.com/photos/20496818/pexels-photo-20496818/free-photo-of-two-palm-trees-on-a-beach.jpeg?auto=compress&cs=tinysrgb&w=3000&h=3000&dpr=1',
  ],
  roomStandard: [
    'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1200&dpr=1',
    'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1200&dpr=1',
    'https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1200&dpr=1',
  ],
  roomDeluxe: [
    'https://images.pexels.com/photos/20664653/pexels-photo-20664653/free-photo-of-a-hotel-room.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1200&dpr=1',
    'https://images.pexels.com/photos/20664653/pexels-photo-20664653/free-photo-of-a-hotel-room.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1200&dpr=1',
    'https://images.pexels.com/photos/20664653/pexels-photo-20664653/free-photo-of-a-hotel-room.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1200&dpr=1',
  ],
  roomSuite: [
    'https://images.pexels.com/photos/20700874/pexels-photo-20700874/free-photo-of-a-beautiful-and-cozy-hotel-room.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1200&dpr=1',
    'https://images.pexels.com/photos/20664716/pexels-photo-20664716/free-photo-of-a-hotel-room-with-a-bed-and-a-painting-on-the-wall.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1200&dpr=1',
    'https://images.pexels.com/photos/19601362/pexels-photo-19601362/free-photo-of-a-living-room-in-a-modern-apartment.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1200&dpr=1',
  ],
  restaurantGrill: [
    'https://images.pexels.com/photos/20653655/pexels-photo-20653655/free-photo-of-close-up-of-a-meat-steak-on-the-grill.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1200&dpr=1',
    'https://images.pexels.com/photos/10188448/pexels-photo-10188448/free-photo-of-people-at-an-outdoor-restaurant.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1200&dpr=1',
  ],
  restaurantBar: [
    'https://images.pexels.com/photos/20496813/pexels-photo-20496813/free-photo-of-young-woman-with-long-brown-hair-sitting-at-a-bar-counter.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1200&dpr=1',
    'https://images.pexels.com/photos/10543635/pexels-photo-10543635/free-photo-of-a-person-in-a-gray-suit-and-a-white-shirt-is-sitting-at-a-bar.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1200&dpr=1',
  ],
  offerEarlyBird: [
    'https://images.pexels.com/photos/2240766/pexels-photo-2240766.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1200&dpr=1',
  ],
  offerRomantic: [
    'https://images.pexels.com/photos/20690069/pexels-photo-20690069/free-photo-of-a-couple-is-walking-on-the-beach.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1200&dpr=1',
    'https://images.pexels.com/photos/3920977/pexels-photo-3920977.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1200&dpr=1',
  ],
  eventMusic: [
    'https://images.pexels.com/photos/196652/pexels-photo-196652.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1200&dpr=1',
  ],
  eventCooking: [
    'https://images.pexels.com/photos/22819895/pexels-photo-22819895/free-photo-of-chef-teaching-a-student-in-a-cooking-class.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1200&dpr=1',
    'https://images.pexels.com/photos/1055530/pexels-photo-1055530.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1200&dpr=1',
  ],
};


async function main() {
  console.log('✨ Starting database seeding...');

  // -------------------------------------------------------------------------
  // 1. CLEAR EXISTING DATA
  // -------------------------------------------------------------------------
  console.log('🧹 Clearing existing data...');
  await prisma.$transaction([
    prisma.offerBooking.deleteMany(),
    prisma.offerRoomType.deleteMany(),
    prisma.specialOffer.deleteMany(),
    prisma.eventBooking.deleteMany(),
    prisma.event.deleteMany(),
    prisma.menuItem.deleteMany(),
    prisma.menuCategory.deleteMany(),
    prisma.restaurantReservation.deleteMany(),
    prisma.restaurant.deleteMany(),
    prisma.contactForm.deleteMany(),
    prisma.newsletter.deleteMany(),
    prisma.fAQ.deleteMany(),
    prisma.testimonial.deleteMany(),
    prisma.heroSlide.deleteMany(),
    prisma.websiteConfiguration.deleteMany(),
    prisma.userPermission.deleteMany(),
    prisma.rolePermission.deleteMany(),
    prisma.permission.deleteMany(),
    prisma.roomTypeAmenity.deleteMany(),
    prisma.amenity.deleteMany(),
    prisma.guestInteraction.deleteMany(),
    prisma.stay.deleteMany(),
    prisma.reservationRoom.deleteMany(),
    prisma.reservation.deleteMany(),
    prisma.charge.deleteMany(),
    prisma.folio.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.serviceRequest.deleteMany(),
    prisma.task.deleteMany(),
    prisma.maintenanceLog.deleteMany(),
    prisma.room.deleteMany(),
    prisma.roomType_Model.deleteMany(),
    prisma.department.deleteMany(),
    prisma.userBusinessUnitRole.deleteMany(),
    prisma.guest.deleteMany(),
    prisma.user.deleteMany(),
    prisma.role.deleteMany(),
    prisma.businessUnit.deleteMany(),
    prisma.mediaItem.deleteMany(),
    prisma.contentItem.deleteMany(),
    prisma.page.deleteMany(),
  ]);
  console.log('✅ Existing data cleared successfully.');

  // -------------------------------------------------------------------------
  // 2. SEED CORE DATA
  // -------------------------------------------------------------------------

  // Seed Roles
  const adminRole = await prisma.role.create({
    data: { name: 'admin', displayName: 'Administrator', isSystem: true, description: 'Superuser with full system access.' },
  });
  const managerRole = await prisma.role.create({
    data: { name: 'manager', displayName: 'Manager', description: 'Manages a specific business unit.' },
  });
  const staffRole = await prisma.role.create({
    data: { name: 'staff', displayName: 'Staff', description: 'General staff member with limited access.' },
  });
  const guestRole = await prisma.role.create({
    data: { name: 'guest', displayName: 'Guest', description: 'Guest account for bookings and self-service.' },
  });
  console.log('✅ Roles seeded.');

  // Seed Permissions
  const permissions = [
    { name: 'read:dashboard', displayName: 'Read Dashboard', module: 'dashboard', scope: PermissionScope.BUSINESS_UNIT },
    { name: 'manage:users', displayName: 'Manage Users', module: 'users', scope: PermissionScope.GLOBAL },
    { name: 'manage:business_units', displayName: 'Manage Business Units', module: 'settings', scope: PermissionScope.GLOBAL },
    { name: 'manage:reservations', displayName: 'Manage Reservations', module: 'reservations', scope: PermissionScope.BUSINESS_UNIT },
    { name: 'manage:rooms', displayName: 'Manage Rooms', module: 'rooms', scope: PermissionScope.BUSINESS_UNIT },
    { name: 'manage:rates', displayName: 'Manage Rates', module: 'rates', scope: PermissionScope.BUSINESS_UNIT },
    { name: 'manage:content', displayName: 'Manage Content', module: 'cms', scope: PermissionScope.BUSINESS_UNIT },
    { name: 'read:reports', displayName: 'Read Reports', module: 'reports', scope: PermissionScope.BUSINESS_UNIT },
  ];
  await prisma.permission.createMany({ data: permissions });
  console.log('✅ Permissions seeded.');

  const allPermissions = await prisma.permission.findMany();

  // Assign permissions to roles
  await prisma.rolePermission.create({
    data: {
      roleId: adminRole.id,
      permissionId: allPermissions.find(p => p.name === 'manage:users')!.id,
    },
  });
  await prisma.rolePermission.create({
    data: {
      roleId: managerRole.id,
      permissionId: allPermissions.find(p => p.name === 'manage:reservations')!.id,
    },
  });
  console.log('✅ Role permissions seeded.');

  // Seed Business Units
  const businessUnitsData = [
    {
      name: 'Anchor Hotel',
      displayName: 'Anchor Hotel',
      propertyType: PropertyType.HOTEL,
      city: 'Manila',
      country: 'Philippines',
      address: '123 Ocean Drive, Malate',
      logo: imageSets.anchorHotel[0],
      website: 'www.anchorhotel.com'
    },
    {
      name: 'Dolores Farm Resort',
      displayName: 'Dolores Farm Resort',
      propertyType: PropertyType.RESORT,
      city: 'Batangas',
      country: 'Philippines',
      address: '456 Farm Road, Lipa',
      logo: imageSets.doloresFarmResort[0],
      website: 'www.doloresfarm.com'
    },
    {
      name: 'Dolores Lake Resort',
      displayName: 'Dolores Lake Resort',
      propertyType: PropertyType.RESORT,
      city: 'Laguna',
      country: 'Philippines',
      address: '789 Lakefront Blvd, Calamba',
      logo: imageSets.doloresLakeResort[0],
      website: 'www.doloreslake.com'
    },
    {
      name: 'Dolores Tropicana Resort',
      displayName: 'Dolores Tropicana Resort',
      propertyType: PropertyType.RESORT,
      city: 'Palawan',
      country: 'Philippines',
      address: '101 Island Ave, El Nido',
      logo: imageSets.doloresTropicanaResort[0],
      website: 'www.dolorestropicana.com'
    },
  ];

  const businessUnits = await Promise.all(
    businessUnitsData.map(data => prisma.businessUnit.create({ data }))
  );
  console.log('✅ Business Units seeded.');

  // Seed Users and assign roles to business units
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@tropicana.com',
        passwordHash: faker.string.alphanumeric(60),
        firstName: 'System',
        lastName: 'Admin',
        status: 'ACTIVE',
        assignments: {
          create: businessUnits.map(bu => ({
            roleId: adminRole.id,
            businessUnitId: bu.id,
          })),
        },
      },
    }),
    ...businessUnits.map(bu =>
      prisma.user.create({
        data: {
          email: `${faker.internet.userName()}-${bu.name.toLowerCase().replace(/\s/g, '')}@tropicana.com`,
          passwordHash: faker.string.alphanumeric(60),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          status: 'ACTIVE',
          assignments: {
            create: {
              roleId: managerRole.id,
              businessUnitId: bu.id,
            },
          },
        },
      })
    ),
  ]);
  console.log('✅ Users seeded and roles assigned.');

  // -------------------------------------------------------------------------
  // 3. SEED BUSINESS UNIT SPECIFIC DATA (Rooms, Content, etc.)
  // -------------------------------------------------------------------------

  for (const bu of businessUnits) {
    console.log(`\n🏗️ Seeding data for ${bu.displayName}...`);

    // Seed Website Configuration
    await prisma.websiteConfiguration.create({
      data: {
        businessUnitId: bu.id,
        siteName: bu.displayName,
        tagline: `Your perfect getaway in ${bu.city}`,
        enableOnlineBooking: true,
        primaryPhone: faker.phone.number(),
        primaryEmail: faker.internet.email(),
        metaDescription: `Discover the best of ${bu.city} at ${bu.displayName}. Book your stay now!`,
      },
    });

    // Seed Hero Slides
    const heroSlides = [
      {
        title: `Welcome to ${bu.displayName}`,
        subtitle: 'Experience comfort and relaxation.',
        backgroundImage: imageSets.anchorHotel[1],
        ctaText: 'View Rooms',
        ctaUrl: '#accommodations',
        sortOrder: 1,
      },
      {
        title: 'Book a Romantic Getaway',
        subtitle: 'Special packages for couples.',
        backgroundImage: imageSets.offerRomantic[0],
        ctaText: 'See Offers',
        ctaUrl: '#offers',
        sortOrder: 2,
      },
    ];
    await Promise.all(
      heroSlides.map(slide => prisma.heroSlide.create({ data: { ...slide, businessUnitId: bu.id } }))
    );

    // Seed Room Types
    const roomTypesData = [
      {
        name: 'Standard',
        displayName: 'Standard Room',
        type: RoomType.STANDARD,
        maxOccupancy: 2,
        baseRate: new Prisma.Decimal(faker.number.float({ min: 2500, max: 4000 })),
        primaryImage: imageSets.roomStandard[0],
        images: imageSets.roomStandard,
      },
      {
        name: 'Deluxe',
        displayName: 'Deluxe Room',
        type: RoomType.DELUXE,
        maxOccupancy: 3,
        baseRate: new Prisma.Decimal(faker.number.float({ min: 4500, max: 6000 })),
        primaryImage: imageSets.roomDeluxe[0],
        images: imageSets.roomDeluxe,
      },
      {
        name: 'Suite',
        displayName: 'Executive Suite',
        type: RoomType.SUITE,
        maxOccupancy: 4,
        baseRate: new Prisma.Decimal(faker.number.float({ min: 8000, max: 12000 })),
        primaryImage: imageSets.roomSuite[0],
        images: imageSets.roomSuite,
        hasLivingArea: true,
      },
    ];

    const roomTypes = await Promise.all(
      roomTypesData.map(data =>
        prisma.roomType_Model.create({ data: { ...data, businessUnitId: bu.id } })
      )
    );

    // Seed Rooms
    const roomsToCreate = [];
    for (let i = 1; i <= 15; i++) {
      const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
      roomsToCreate.push({
        businessUnitId: bu.id,
        roomTypeId: roomType.id,
        roomNumber: `${i.toString().padStart(2, '0')}`,
        floor: Math.floor(Math.random() * 5) + 1,
        status: RoomStatus.AVAILABLE,
      });
    }
    await prisma.room.createMany({ data: roomsToCreate });
    console.log(`✅ ${bu.displayName} rooms and room types seeded.`);
    
    // Seed Amenities
    const amenities = [
        { name: 'Free WiFi', category: 'Property', icon: 'wifi' },
        { name: 'Swimming Pool', category: 'Property', icon: 'pool' },
        { name: 'Gym', category: 'Property', icon: 'gym' },
        { name: 'Air Conditioning', category: 'Room', icon: 'ac' },
        { name: 'Mini Bar', category: 'Room', icon: 'mini-bar' },
        { name: 'King Bed', category: 'Room', icon: 'king-bed' },
        { name: 'Spa', category: 'Wellness', icon: 'spa' },
        { name: 'Conference Room', category: 'Business', icon: 'meeting' },
    ];
    await Promise.all(
        amenities.map(amenity => prisma.amenity.create({ data: { ...amenity, businessUnitId: bu.id } }))
    );

    // Seed Testimonials
    const testimonials = [];
    for (let i = 0; i < 5; i++) {
        testimonials.push({
            businessUnitId: bu.id,
            guestName: faker.person.fullName(),
            content: faker.lorem.sentences(3),
            rating: faker.number.int({ min: 4, max: 5 }),
            guestImage: faker.image.avatar(),
        });
    }
    await prisma.testimonial.createMany({ data: testimonials });

    // Seed FAQs
    const faqs = [
        { question: 'What is your check-in time?', answer: 'Check-in is at 3:00 PM.', category: 'General' },
        { question: 'Do you have free parking?', answer: 'Yes, we offer complimentary parking for all our guests.', category: 'General' },
        { question: 'Is breakfast included?', answer: 'Yes, complimentary breakfast is included with all room reservations.', category: 'Dining' },
    ];
    await Promise.all(
        faqs.map(faq => prisma.fAQ.create({ data: { ...faq, businessUnitId: bu.id } }))
    );
    
    // Seed Restaurants
    const restaurants = [
      {
        name: `${faker.company.name()} Grill`,
        slug: faker.helpers.slugify(`${faker.company.name()} Grill`.toLowerCase()),
        description: faker.lorem.paragraph(),
        type: RestaurantType.CASUAL_DINING,
        cuisine: ['Filipino', 'International'],
        location: 'Lobby Level',
        featuredImage: imageSets.restaurantGrill[0],
        operatingHours: { monday: { open: '06:00', close: '22:00', closed: false } },
        isPublished: true,
        isFeatured: true
      },
      {
        name: `${faker.company.name()} Bar`,
        slug: faker.helpers.slugify(`${faker.company.name()} Bar`.toLowerCase()),
        description: faker.lorem.paragraph(),
        type: RestaurantType.BAR,
        cuisine: ['Beverages', 'Finger Food'],
        location: 'Rooftop',
        featuredImage: imageSets.restaurantBar[0],
        operatingHours: { monday: { open: '17:00', close: '02:00', closed: false } },
        isPublished: true,
      },
    ];
    await Promise.all(
      restaurants.map(r => prisma.restaurant.create({ data: { ...r, businessUnitId: bu.id } }))
    );

    // Seed Special Offers
    const { start: offerStart, end: offerEnd } = getRandomDateRange();
    const offers = [
      {
        title: 'Early Bird Special',
        slug: 'early-bird-special',
        description: faker.lorem.sentences(4),
        type: OfferType.EARLY_BIRD,
        status: OfferStatus.ACTIVE,
        offerPrice: new Prisma.Decimal(4500),
        originalPrice: new Prisma.Decimal(6000),
        validFrom: offerStart,
        validTo: offerEnd,
        inclusions: ['Breakfast for two', 'Free WiFi'],
        featuredImage: imageSets.offerEarlyBird[0],
        isPublished: true,
      },
      {
        title: 'Romantic Getaway Package',
        slug: 'romantic-getaway-package',
        description: faker.lorem.sentences(4),
        type: OfferType.PACKAGE,
        status: OfferStatus.ACTIVE,
        offerPrice: new Prisma.Decimal(9000),
        originalPrice: new Prisma.Decimal(12000),
        validFrom: offerStart,
        validTo: offerEnd,
        inclusions: ['Couple spa session', 'Candlelit dinner', 'Room upgrade'],
        featuredImage: imageSets.offerRomantic[0],
        isPublished: true,
        isFeatured: true
      }
    ];
    await Promise.all(
      offers.map(o => prisma.specialOffer.create({ data: { ...o, businessUnitId: bu.id } }))
    );
    
    // Seed Events
    const { start: eventStart, end: eventEnd } = getRandomDateRange();
    const events = [
      {
        title: 'Friday Night Live Music',
        slug: 'friday-night-live-music',
        description: 'Enjoy a relaxing evening with live acoustic music at our bar.',
        type: EventType.ENTERTAINMENT,
        status: EventStatus.CONFIRMED,
        startDate: eventStart,
        endDate: eventStart,
        startTime: '20:00',
        endTime: '23:00',
        venue: 'Rooftop Bar',
        isFree: true,
        isPublished: true,
        featuredImage: imageSets.eventMusic[0],
      },
      {
        title: 'Seasonal Cooking Workshop',
        slug: 'seasonal-cooking-workshop',
        description: 'Learn how to cook authentic Filipino dishes with our head chef.',
        type: EventType.WORKSHOP,
        status: EventStatus.CONFIRMED,
        startDate: eventEnd,
        endDate: eventEnd,
        startTime: '14:00',
        endTime: '16:00',
        venue: 'Main Kitchen',
        requiresBooking: true,
        ticketPrice: new Prisma.Decimal(1500),
        isPublished: true,
        featuredImage: imageSets.eventCooking[0],
      },
    ];
    await Promise.all(
      events.map(e => prisma.event.create({ data: { ...e, businessUnitId: bu.id } }))
    );
    
    // Seed some guests
    for (let i = 0; i < 5; i++) {
        await prisma.guest.create({
            data: {
                businessUnitId: bu.id,
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                email: faker.internet.email(),
                phone: faker.phone.number(),
                country: 'Philippines',
            },
        });
    }

    console.log(`✅ Finished seeding data for ${bu.displayName}.`);
  }

  console.log('\nSeed completed successfully! 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
