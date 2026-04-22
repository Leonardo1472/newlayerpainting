import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

function getUserIdFromRequest(request: NextRequest): string {
  const userId = request.cookies.get('userId')?.value;
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

// GET single customer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);

    const customer = await db.customer.findFirst({
      where: { id: params.id, userId },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
  }
}

// PUT update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);
    const data = await request.json();

    // Verify ownership
    const customer = await db.customer.findFirst({
      where: { id: params.id, userId },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const updated = await db.customer.update({
      where: { id: params.id },
      data: {
        name: data.name || customer.name,
        phone: data.phone || customer.phone,
        email: data.email || customer.email,
        address: data.address || customer.address,
        city: data.city || customer.city,
        state: data.state || customer.state,
        postalCode: data.postalCode || customer.postalCode,
        country: data.country || customer.country,
        notes: data.notes || customer.notes,
        isActive: data.isActive !== undefined ? data.isActive : customer.isActive,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

// DELETE customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);

    const customer = await db.customer.findFirst({
      where: { id: params.id, userId },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    await db.customer.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Customer deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
