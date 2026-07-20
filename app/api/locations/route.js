import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Location from '@/lib/models/Location';

export async function GET() {
  await connectDB();
  const locations = await Location.find().sort({ city: 1, name: 1 }).lean();
  return NextResponse.json({ locations });
}
