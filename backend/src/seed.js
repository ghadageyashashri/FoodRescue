require('dotenv').config();
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // Ignore in environments where setting DNS servers is restricted
}
const mongoose = require('mongoose');
const User = require('./models/User');
const Organization = require('./models/Organization');
const Donation = require('./models/Donation');
const DonationRequest = require('./models/DonationRequest');
const Pickup = require('./models/Pickup');
const StatusHistory = require('./models/StatusHistory');
const Notification = require('./models/Notification');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodrescue';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing FoodRescue collections...');
    await Promise.all([
      User.deleteMany({}),
      Organization.deleteMany({}),
      Donation.deleteMany({}),
      DonationRequest.deleteMany({}),
      Pickup.deleteMany({}),
      StatusHistory.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('Hashing passwords...');
    const adminPass = await User.hashPassword('Admin@123');
    const donorPass = await User.hashPassword('Donor@123');
    const ngoPass = await User.hashPassword('Ngo@123');
    const volPass = await User.hashPassword('Volunteer@123');

    console.log('Creating users...');
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@foodrescue.org',
      passwordHash: adminPass,
      phone: '+1 555-0100',
      role: 'admin',
      address: 'FoodRescue Central HQ, Floor 4',
    });

    const donor1 = await User.create({
      name: 'Grand Palace Hotel & Banquets',
      email: 'donor@grandhotel.com',
      passwordHash: donorPass,
      phone: '+1 555-0101',
      role: 'donor',
      address: '742 Evergreen Terrace, Downtown District',
    });

    const donor2 = await User.create({
      name: 'Fresh Bakes Artisan Bakery',
      email: 'bakery@freshbakes.com',
      passwordHash: donorPass,
      phone: '+1 555-0102',
      role: 'donor',
      address: '108 Maple Avenue, West Market',
    });

    const ngoUser1 = await User.create({
      name: 'Dr. Clara Oswald',
      email: 'contact@feedhope.org',
      passwordHash: ngoPass,
      phone: '+1 555-0201',
      role: 'ngo',
      address: '500 Community Way, Southside',
    });

    const ngoUser2 = await User.create({
      name: 'Marcus Vance',
      email: 'shelter@citycare.org',
      passwordHash: ngoPass,
      phone: '+1 555-0202',
      role: 'ngo',
      address: '88 Harbor Boulevard, North Dock',
    });

    const volunteer1 = await User.create({
      name: 'Alex Rivera',
      email: 'alex.volunteer@gmail.com',
      passwordHash: volPass,
      phone: '+1 555-0301',
      role: 'volunteer',
      address: '32 Pine Street, Apt 4B',
    });

    const volunteer2 = await User.create({
      name: 'Sarah Chen',
      email: 'sarah.rider@gmail.com',
      passwordHash: volPass,
      phone: '+1 555-0302',
      role: 'volunteer',
      address: '450 Elm Court',
    });

    console.log('Creating organizations for NGOs...');
    const org1 = await Organization.create({
      user: ngoUser1._id,
      organizationName: 'FeedHope Community Foundation',
      registrationNumber: 'NGO-REG-2022-8941',
      address: '500 Community Way, Southside District',
      city: 'Metro City',
      contactPerson: 'Dr. Clara Oswald',
      contactPhone: '+1 555-0201',
      mission: 'Alleviating food poverty and nourishing shelters with fresh surplus rescues daily.',
      verificationStatus: 'verified',
      verifiedAt: new Date(),
      verifiedBy: admin._id,
      verificationNotes: 'Registered charity with certified food safe distribution facilities.',
    });

    const org2 = await Organization.create({
      user: ngoUser2._id,
      organizationName: 'City Care Night Shelter',
      registrationNumber: 'NGO-REG-2024-1102',
      address: '88 Harbor Boulevard, North Dock',
      city: 'Metro City',
      contactPerson: 'Marcus Vance',
      contactPhone: '+1 555-0202',
      mission: 'Providing warm meals, hygiene kits, and emergency night shelter to homeless families.',
      verificationStatus: 'pending',
      verificationNotes: 'Pending tax exemption certificate review by admin.',
    });

    console.log('Creating realistic donations across lifecycle states...');
    const now = new Date();
    const in12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

    // 1. AVAILABLE - Veg Biryani
    const donation1 = await Donation.create({
      donor: donor1._id,
      foodName: 'Surplus Vegetable Biryani with Fresh Raita & Mirchi Salan',
      description: 'Prepared for evening corporate banquet. Untouched, hygienically hot-held in food-grade thermoboxes.',
      category: 'cooked_meals',
      quantity: 50,
      unit: 'meals',
      isVegetarian: true,
      preparationDate: threeHoursAgo,
      useByDate: in12Hours,
      storageConditions: 'hot_holding',
      pickupAddress: 'Grand Palace Banquet Loading Dock B, 742 Evergreen Terrace',
      pickupContactName: 'Chef Rahul Mehta',
      pickupContactPhone: '+1 555-0101',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=60',
    });

    await StatusHistory.create({
      donation: donation1._id,
      previousStatus: 'INITIAL',
      newStatus: 'AVAILABLE',
      actor: donor1._id,
      note: 'Donation listed and ready for NGO rescue.',
      timestamp: threeHoursAgo,
    });

    // 2. AVAILABLE - Artisan Bread
    const donation2 = await Donation.create({
      donor: donor2._id,
      foodName: 'Assorted Sourdough Loaves, Brioche Buns & Bagels',
      description: 'Freshly baked this morning. Surplus loaves packed in eco-friendly paper bakery bags.',
      category: 'bakery',
      quantity: 35,
      unit: 'packets',
      isVegetarian: true,
      preparationDate: sixHoursAgo,
      useByDate: in48Hours,
      storageConditions: 'ambient',
      pickupAddress: 'Fresh Bakes Counter, 108 Maple Avenue',
      pickupContactName: 'Maria Santos',
      pickupContactPhone: '+1 555-0102',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=60',
    });

    await StatusHistory.create({
      donation: donation2._id,
      previousStatus: 'INITIAL',
      newStatus: 'AVAILABLE',
      actor: donor2._id,
      note: 'Artisan bakery surplus listed.',
      timestamp: sixHoursAgo,
    });

    // 3. REQUESTED - Paneer Wraps
    const donation3 = await Donation.create({
      donor: donor1._id,
      foodName: 'Grilled Paneer Tikka Wraps & Fresh Salads',
      description: 'Individually wrapped gourmet whole wheat rolls with mint spread.',
      category: 'cooked_meals',
      quantity: 30,
      unit: 'meals',
      isVegetarian: true,
      preparationDate: fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000),
      useByDate: in12Hours,
      storageConditions: 'refrigerated',
      pickupAddress: 'Grand Palace Kitchen Side Gate, 742 Evergreen Terrace',
      status: 'REQUESTED',
      requestedBy: ngoUser1._id,
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=60',
    });

    await StatusHistory.create({
      donation: donation3._id,
      previousStatus: 'INITIAL',
      newStatus: 'AVAILABLE',
      actor: donor1._id,
      note: 'Listed by donor.',
      timestamp: fourHoursAgo,
    });

    await StatusHistory.create({
      donation: donation3._id,
      previousStatus: 'AVAILABLE',
      newStatus: 'REQUESTED',
      actor: ngoUser1._id,
      note: 'FeedHope Community Foundation requested 30 meals for dinner distribution.',
      timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    });

    await DonationRequest.create({
      donation: donation3._id,
      ngo: ngoUser1._id,
      requestedQuantity: 30,
      notes: 'Urgent need for tonight dinner relief shelter.',
      status: 'PENDING',
    });

    // 4. ACCEPTED - Ready for volunteer pickup!
    const donation4 = await Donation.create({
      donor: donor1._id,
      foodName: 'South Indian Thali Meal Boxes (Rice, Sambar, Poriyal, Curd)',
      description: 'Catering excess from afternoon event. Packed in microwaveable 3-compartment trays.',
      category: 'cooked_meals',
      quantity: 45,
      unit: 'meals',
      isVegetarian: true,
      preparationDate: fourHoursAgo,
      useByDate: in12Hours,
      storageConditions: 'ambient',
      pickupAddress: 'Grand Palace Banquet Portico, 742 Evergreen Terrace',
      status: 'ACCEPTED',
      requestedBy: ngoUser2._id,
      imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=60',
    });

    await StatusHistory.create({
      donation: donation4._id,
      previousStatus: 'AVAILABLE',
      newStatus: 'REQUESTED',
      actor: ngoUser2._id,
      note: 'Requested by City Care Night Shelter.',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    });

    await StatusHistory.create({
      donation: donation4._id,
      previousStatus: 'REQUESTED',
      newStatus: 'ACCEPTED',
      actor: donor1._id,
      note: 'Donor accepted request from City Care Night Shelter. Awaiting volunteer acceptance.',
      timestamp: new Date(now.getTime() - 1.5 * 60 * 60 * 1000),
    });

    await DonationRequest.create({
      donation: donation4._id,
      ngo: ngoUser2._id,
      requestedQuantity: 45,
      status: 'ACCEPTED',
      notes: 'For homeless night shelter dinner.',
    });

    // 5. PICKUP_ASSIGNED - Volunteer assigned (Alex Rivera)
    const donation5 = await Donation.create({
      donor: donor1._id,
      foodName: 'Wholesome Rice, Dal & Mixed Vegetable Curry',
      description: 'Wholesome lunch surplus from executive dining facility.',
      category: 'cooked_meals',
      quantity: 40,
      unit: 'meals',
      isVegetarian: true,
      preparationDate: fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000),
      useByDate: in12Hours,
      storageConditions: 'ambient',
      pickupAddress: '742 Evergreen Terrace, Downtown District',
      status: 'PICKUP_ASSIGNED',
      requestedBy: ngoUser1._id,
      assignedVolunteer: volunteer1._id,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60',
    });

    await StatusHistory.create({
      donation: donation5._id,
      previousStatus: 'ACCEPTED',
      newStatus: 'PICKUP_ASSIGNED',
      actor: volunteer1._id,
      note: 'Volunteer Alex Rivera accepted pickup task.',
      timestamp: new Date(now.getTime() - 45 * 60 * 1000),
    });

    await Pickup.create({
      donation: donation5._id,
      volunteer: volunteer1._id,
      ngo: ngoUser1._id,
      pickupAddress: '742 Evergreen Terrace, Downtown District',
      deliveryAddress: '500 Community Way, Southside District',
      status: 'ASSIGNED',
      pickupNotes: 'Using insulated delivery box in car.',
    });

    // 6. DELIVERED - Awaiting NGO Receipt
    const donation6 = await Donation.create({
      donor: donor2._id,
      foodName: 'Healthy Whole Grain Sandwiches & Fresh Fruit Cups',
      description: 'Cold-stored deli surplus, fresh tomatoes, cucumbers and cheddar cheese.',
      category: 'cooked_meals',
      quantity: 25,
      unit: 'meals',
      isVegetarian: true,
      preparationDate: sixHoursAgo,
      useByDate: in12Hours,
      storageConditions: 'refrigerated',
      pickupAddress: '108 Maple Avenue, West Market',
      status: 'DELIVERED',
      requestedBy: ngoUser1._id,
      assignedVolunteer: volunteer2._id,
      imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=60',
    });

    await StatusHistory.create({
      donation: donation6._id,
      previousStatus: 'PICKUP_ASSIGNED',
      newStatus: 'PICKED_UP',
      actor: volunteer2._id,
      note: 'Volunteer Sarah Chen picked up from Fresh Bakes.',
      timestamp: new Date(now.getTime() - 60 * 60 * 1000),
    });

    await StatusHistory.create({
      donation: donation6._id,
      previousStatus: 'PICKED_UP',
      newStatus: 'DELIVERED',
      actor: volunteer2._id,
      note: 'Delivered safely to FeedHope Community Foundation.',
      timestamp: new Date(now.getTime() - 15 * 60 * 1000),
    });

    await Pickup.create({
      donation: donation6._id,
      volunteer: volunteer2._id,
      ngo: ngoUser1._id,
      pickupAddress: '108 Maple Avenue, West Market',
      deliveryAddress: '500 Community Way, Southside District',
      status: 'DELIVERED',
      pickedUpAt: new Date(now.getTime() - 60 * 60 * 1000),
      deliveredAt: new Date(now.getTime() - 15 * 60 * 1000),
    });

    // 7. COMPLETED & DISTRIBUTED - Fully finished rescue!
    const donation7 = await Donation.create({
      donor: donor1._id,
      foodName: 'Fresh Steamed Idlis, Vadais & Coconut Chutney',
      description: 'Morning corporate breakfast excess. Untouched, hygienically packed.',
      category: 'cooked_meals',
      quantity: 75,
      unit: 'meals',
      isVegetarian: true,
      preparationDate: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      useByDate: in12Hours,
      storageConditions: 'hot_holding',
      pickupAddress: '742 Evergreen Terrace',
      status: 'COMPLETED',
      requestedBy: ngoUser1._id,
      assignedVolunteer: volunteer1._id,
      peopleServed: 75,
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=60',
    });

    await StatusHistory.create({
      donation: donation7._id,
      previousStatus: 'INITIAL',
      newStatus: 'AVAILABLE',
      actor: donor1._id,
      note: 'Breakfast donation listed.',
      timestamp: new Date(now.getTime() - 10 * 60 * 60 * 1000),
    });

    await StatusHistory.create({
      donation: donation7._id,
      previousStatus: 'AVAILABLE',
      newStatus: 'ACCEPTED',
      actor: donor1._id,
      note: 'Accepted request from FeedHope.',
      timestamp: new Date(now.getTime() - 9 * 60 * 60 * 1000),
    });

    await StatusHistory.create({
      donation: donation7._id,
      previousStatus: 'ACCEPTED',
      newStatus: 'PICKED_UP',
      actor: volunteer1._id,
      note: 'Picked up by Alex Rivera.',
      timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000),
    });

    await StatusHistory.create({
      donation: donation7._id,
      previousStatus: 'PICKED_UP',
      newStatus: 'DELIVERED',
      actor: volunteer1._id,
      note: 'Delivered to FeedHope Center.',
      timestamp: new Date(now.getTime() - 7 * 60 * 60 * 1000),
    });

    await StatusHistory.create({
      donation: donation7._id,
      previousStatus: 'DELIVERED',
      newStatus: 'RECEIVED',
      actor: ngoUser1._id,
      note: 'Received and inspected by Dr. Clara Oswald.',
      timestamp: new Date(now.getTime() - 6.5 * 60 * 60 * 1000),
    });

    await StatusHistory.create({
      donation: donation7._id,
      previousStatus: 'RECEIVED',
      newStatus: 'COMPLETED',
      actor: ngoUser1._id,
      note: 'Distributed to community members at midday meal service! Served 75 people.',
      timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000),
    });

    console.log('Creating sample notifications...');
    await Notification.create([
      {
        recipient: donor1._id,
        title: 'Donation Successfully Rescued!',
        message: 'Your breakfast donation was delivered and served 75 community members. Thank you!',
        type: 'DISTRIBUTED',
        read: false,
        link: `/donations/${donation7._id}`,
      },
      {
        recipient: ngoUser1._id,
        title: 'Food Delivery Arrived',
        message: 'Volunteer Sarah Chen has arrived with "Whole Grain Sandwiches". Please confirm receipt.',
        type: 'DELIVERED',
        read: false,
        link: `/donations/${donation6._id}`,
      },
      {
        recipient: volunteer1._id,
        title: 'Pickup Task Reminder',
        message: 'You have an active pickup task for "Wholesome Rice & Dal" from Grand Palace Hotel.',
        type: 'PICKUP_ASSIGNED',
        read: false,
        link: `/volunteer/dashboard`,
      },
      {
        recipient: admin._id,
        title: 'New NGO Pending Verification',
        message: 'City Care Night Shelter submitted registration details and is awaiting verification.',
        type: 'VERIFICATION',
        read: false,
        link: `/admin/dashboard`,
      },
    ]);

    console.log('==================================================');
    console.log('FoodRescue Database seeded successfully!');
    console.log('==================================================');
    console.log('Demo Accounts:');
    console.log('1. Admin:      admin@foodrescue.org       / Admin@123');
    console.log('2. Donor 1:    donor@grandhotel.com       / Donor@123 (Grand Palace Hotel)');
    console.log('3. Donor 2:    bakery@freshbakes.com      / Donor@123 (Fresh Bakes)');
    console.log('4. NGO 1:      contact@feedhope.org       / Ngo@123   (FeedHope - Verified)');
    console.log('5. NGO 2:      shelter@citycare.org       / Ngo@123   (City Care - Pending)');
    console.log('6. Volunteer:  alex.volunteer@gmail.com   / Volunteer@123 (Alex Rivera)');
    console.log('7. Volunteer:  sarah.rider@gmail.com      / Volunteer@123 (Sarah Chen)');
    console.log('==================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
