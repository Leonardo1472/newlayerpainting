import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

function getUserIdFromRequest(request: NextRequest): string {
  const userId = request.cookies.get('userId')?.value;
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

// GET single request
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);

    const req = await db.request.findFirst({
      where: { id: params.id, userId },
      include: { customer: true },
    });

    if (!req) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json(req);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch request' }, { status: 500 });
  }
}

// PUT update request
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);
    const data = await request.json();

    const req = await db.request.findFirst({
      where: { id: params.id, userId },
    });

    if (!req) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const updated = await db.request.update({
      where: { id: params.id },
      data: {
        title: data.title || req.title,
        description: data.description || req.description,
        status: data.status || req.status,
        requestDate: data.requestDate ? new Date(data.requestDate) : req.requestDate,
        requestTime: data.requestTime || req.requestTime,
      },
      include: { customer: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}

// DELETE request
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);

    const req = await db.request.findFirst({
      where: { id: params.id, userId },
    });

    if (!req) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    await db.request.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Request deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 });
  }
}
