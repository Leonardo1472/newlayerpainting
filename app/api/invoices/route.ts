import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

function getUserIdFromRequest(request: NextRequest): string {
  const userId = request.cookies.get('userId')?.value;
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

// Generate unique invoice number
async function generateInvoiceNumber(userId: string): Promise<string> {
  const count = await db.invoice.count({ where: { userId } });
  return `INV-${String(count + 1).padStart(4, '0')}`;
}

// GET all invoices
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const status = request.nextUrl.searchParams.get('status');

    let where: any = { userId };
    if (status) {
      where.status = status;
    }

    const invoices = await db.invoice.findMany({
      where,
      include: {
        customer: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

// POST create invoice
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const data = await request.json();

    const invoiceNumber = await generateInvoiceNumber(userId);

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

    const invoice = await db.invoice.create({
      data: {
        userId,
        customerId: data.customerId,
        jobId: data.jobId,
        quoteId: data.quoteId,
        invoiceNumber,
        status: data.status || 'draft',
        issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        subtotal: parseFloat(subtotal.toFixed(2)),
        discountType: data.discountType || 'fixed',
        discountValue: parseFloat(discountValue.toFixed(2)),
        taxRate: parseFloat(data.taxRate || 0),
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        notes: data.notes,
        paymentTerms: data.paymentTerms,
      },
      include: {
        customer: true,
      },
    });

    // Create line items
    if (data.items && Array.isArray(data.items)) {
      for (const item of data.items) {
        await db.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            productId: item.productId,
            description: item.description,
            quantity: item.quantity || 1,
            unitPrice: parseFloat(item.unitPrice),
            total: parseFloat(item.total),
            sortOrder: item.sortOrder || 0,
          },
        });
      }
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
