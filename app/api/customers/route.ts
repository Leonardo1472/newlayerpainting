import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// Get user ID from cookies (simplified - in production use proper auth)
function getUserIdFromRequest(request: NextRequest): string {
  const userId = request.cookies.get('userId')?.value;
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}

// GET all customers
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const searchQuery = request.nextUrl.searchParams.get('search');

    let where: any = { userId };
    if (searchQuery) {
      where = {
        ...where,
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { email: { contains: searchQuery, mode: 'insensitive' } },
          { phone: { contains: searchQuery, mode: 'insensitive' } },
          { address: { contains: searchQuery, mode: 'insensitive' } },
        ],
      };
    }

    const customers = await db.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

// POST create customer
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const data = await request.json();

    const customer = await db.customer.create({
      data: {
        userId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        notes: data.notes,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
