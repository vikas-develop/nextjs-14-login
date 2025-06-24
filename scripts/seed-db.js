#!/usr/bin/env node

console.log('🌱 Database Seeding Instructions');
console.log('================================');
console.log('');
console.log('To seed your MongoDB database with default users:');
console.log('');
console.log('1. Make sure MongoDB is running');
console.log('2. Start the Next.js development server:');
console.log('   npm run dev');
console.log('');
console.log('3. In another terminal, run:');
console.log('   curl -X POST http://localhost:4000/api/seed');
console.log('');
console.log('Or visit: http://localhost:4000/api/seed (POST request)');
console.log('');
console.log('Default users that will be created:');
console.log('- test@example.com (password: password123)');
console.log('- admin@example.com (password: password123)');
console.log('');
console.log('Note: Seeding only works in development mode.');
console.log(''); 