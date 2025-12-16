require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const restaurantsData = require('./restaurants.json');
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB for seeding...');
    await Restaurant.deleteMany({});
    console.log('🗑️  Cleared existing restaurants');
    await Restaurant.insertMany(restaurantsData);
    console.log(`✅ Successfully seeded ${restaurantsData.length} restaurants`);
    mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};
seedDatabase();