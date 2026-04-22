import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

function getUserIdFromRequest(request: NextRequest): string {
  const userId = request.cookies.get('userId')?.value;
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

// GET all requests
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const status = request.nextUrl.searchParams.get('status');
    const date = request.nextUrl.searchParams.get('date');

    let where: any = { userId };

    if (status) {
      where.status = status;
    }

    if (date) {
      where.requestDate = {
        gte: new Date(date),
        lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
      };
    }

    const requests = await db.request.findMany({
      where,
      include: {
        customer: true,
      },
      orderBy: { requestDate: 'desc' },
    });

    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

// POST create request
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const data = await request.json();

    // Validate required fields
    if (!data.customerId || !data.title || !data.requestDate || !data.requestTime) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId, title, requestDate, requestTime' },
        { status: 400 }
      );
    }

    const newRequest = await db.request.create({
      data: {
        userId,
        customerId: data.customerId,
        title: data.title,
        description: data.description,
        requestDate: new Date(data.requestDate),
        requestTime: data.requestTime,
      },
      include: {
        customer: true,
      },
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error('Create request error:', error);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}
