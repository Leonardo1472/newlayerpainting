import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

function getUserIdFromRequest(request: NextRequest): string {
  const userId = request.cookies.get('userId')?.value;
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

// Generate unique quote number
async function generateQuoteNumber(userId: string): Promise<string> {
  const quotes = await db.quote.findMany({
    where: { userId },
    select: { quoteNumber: true },
  });

  let maxNumber = 0;
  quotes.forEach(quote => {
    const match = quote.quoteNumber.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (num > maxNumber) maxNumber = num;
    }
  });

  return `QT-${String(maxNumber + 1).padStart(4, '0')}`;
}

// GET all quotes
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const status = request.nextUrl.searchParams.get('status');

    let where: any = { userId };
    if (status) {
      where.status = status;
    }

    const quotes = await db.quote.findMany({
      where,
      include: {
        customer: true,
        items: true,
        request: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(quotes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}

// POST create quote
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const data = await request.json();

    // Generate quote number
    const quoteNumber = await generateQuoteNumber(userId);

    // Calculate totals
    let subtotal = 0;
    if (data.items && Array.isArray(data.items)) {
      subtotal = data.items.reduce((sum: number, item: any) => sum + parseFloat(item.total || 0), 0);
    }

    // Calculate discount
    let discountValue = 0;
    if (data.discountType === 'percentage') {
      discountValue = (subtotal * parseFloat(data.discountValue || 0)) / 100;
    } else {
      discountValue = parseFloat(data.discountValue || 0);
    }

    // Calculate tax
    const taxableAmount = subtotal - discountValue;
    const taxAmount = (taxableAmount * parseFloat(data.taxRate || 0)) / 100;

    // Calculate total
    const total = taxableAmount + taxAmount;

    const quote = await db.quote.create({
      data: {
        userId,
        customerId: data.customerId,
        requestId: data.requestId,
        quoteNumber,
        title: data.title,
        description: data.description,
        status: data.status || 'draft',
        subtotal: parseFloat(subtotal.toFixed(2)),
        discountType: data.discountType || 'fixed',
        discountValue: parseFloat(discountValue.toFixed(2)),
        taxRate: parseFloat(data.taxRate || 0),
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        depositAmount: parseFloat(data.depositAmount || 0),
        total: parseFloat(total.toFixed(2)),
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        notes: data.notes,
      },
      include: {
        customer: true,
        items: true,
      },
    });

    // Create line items if provided
    if (data.items && Array.isArray(data.items)) {
      for (const item of data.items) {
        await db.estimateItem.create({
          data: {
            quoteId: quote.id,
            productId: item.productId,
            description: item.description,
            quantity: item.quantity || 1,
            unitPrice: parseFloat(item.pricePerUnit || item.unitPrice || 0),
            total: parseFloat(item.total),
            sortOrder: item.sortOrder || 0,
          },
        });
      }
    }

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Create quote error:', errorMessage);
    console.error('Full error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
