import mongoose from 'mongoose';
import User from '../lib/models/User.js';

const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Set MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD in .env.local first.');
  process.exit(1);
}

await mongoose.connect(MONGODB_URI);
const passwordHash = await User.hashPassword(ADMIN_PASSWORD);
await User.findOneAndUpdate(
  { email: ADMIN_EMAIL.toLowerCase() },
  { email: ADMIN_EMAIL.toLowerCase(), passwordHash, name: 'Farrukh Shahzad' },
  { upsert: true }
);
console.log(`Admin account ready: ${ADMIN_EMAIL}`);
await mongoose.disconnect();
