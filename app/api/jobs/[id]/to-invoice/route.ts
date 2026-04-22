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

// POST convert job to invoice
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);

    // Get the job with quote info
    const job = await db.job.findFirst({
      where: { id: params.id, userId },
      include: {
        quote: {
          include: { items: true },
        },
        customer: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (!job.quote) {
      return NextResponse.json({ error: 'Job has no associated quote' }, { status: 400 });
    }

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(userId);

    // Create invoice from quote
    const invoice = await db.invoice.create({
      data: {
        userId,
        customerId: job.customerId,
        quoteId: job.quoteId,
        jobId: job.id,
        invoiceNumber,
        status: 'draft',
        issueDate: new Date(),
        dueDate: job.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        subtotal: job.quote.subtotal,
        discountType: job.quote.discountType,
        discountValue: job.quote.discountValue,
        taxRate: job.quote.taxRate,
        taxAmount: job.quote.taxAmount,
        total: job.quote.total,
        notes: job.quote.notes,
        paymentTerms: 'Due within 30 days',
      },
      include: { customer: true },
    });

    // Copy quote items to invoice items
    for (const item of job.quote.items) {
      await db.invoiceItem.create({
        data: {
          invoiceId: invoice.id,
          productId: item.productId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          sortOrder: item.sortOrder,
        },
      });
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Convert to invoice error:', error);
    return NextResponse.json({ error: 'Failed to convert job to invoice' }, { status: 500 });
  }
}
