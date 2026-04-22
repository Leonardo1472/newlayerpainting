import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

function getUserIdFromRequest(request: NextRequest): string {
  const userId = request.cookies.get('userId')?.value;
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

// GET single quote
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);

    const quote = await db.quote.findFirst({
      where: { id: params.id, userId },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
        request: true,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    return NextResponse.json(quote);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
  }
}

// PUT update quote
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);
    const data = await request.json();

    const quote = await db.quote.findFirst({
      where: { id: params.id, userId },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const updated = await db.quote.update({
      where: { id: params.id },
      data: {
        title: data.title || quote.title,
        description: data.description || quote.description,
        status: data.status || quote.status,
        subtotal: data.subtotal !== undefined ? parseFloat(data.subtotal) : quote.subtotal,
        discountType: data.discountType || quote.discountType,
        discountValue: data.discountValue !== undefined ? parseFloat(data.discountValue) : quote.discountValue,
        taxRate: data.taxRate !== undefined ? parseFloat(data.taxRate) : quote.taxRate,
        taxAmount: data.taxAmount !== undefined ? parseFloat(data.taxAmount) : quote.taxAmount,
        depositAmount: data.depositAmount !== undefined ? parseFloat(data.depositAmount) : quote.depositAmount,
        total: data.total !== undefined ? parseFloat(data.total) : quote.total,
        validUntil: data.validUntil ? new Date(data.validUntil) : quote.validUntil,
        notes: data.notes || quote.notes,
        sentAt: data.markAsSent ? new Date() : quote.sentAt,
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 });
  }
}

// DELETE quote
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);

    const quote = await db.quote.findFirst({
      where: { id: params.id, userId },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Delete related items first
    await db.estimateItem.deleteMany({
      where: { quoteId: quote.id },
    });

    await db.quote.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Quote deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 });
  }
}
