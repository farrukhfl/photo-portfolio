import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Car from '@/lib/models/Car';

export async function GET() {
  await connectDB();
  const cars = await Car.find().sort({ make: 1, model: 1 }).lean();
  return NextResponse.json({ cars });
}
