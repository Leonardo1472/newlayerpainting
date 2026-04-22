import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

function getUserIdFromRequest(request: NextRequest): string {
  const userId = request.cookies.get('userId')?.value;
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

// GET single invoice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);

    const invoice = await db.invoice.findFirst({
      where: { id: params.id, userId },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}

// PUT update invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);
    const data = await request.json();

    const invoice = await db.invoice.findFirst({
      where: { id: params.id, userId },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const updated = await db.invoice.update({
      where: { id: params.id },
      data: {
        status: data.status || invoice.status,
        subtotal: data.subtotal !== undefined ? parseFloat(data.subtotal) : invoice.subtotal,
        discountType: data.discountType || invoice.discountType,
        discountValue: data.discountValue !== undefined ? parseFloat(data.discountValue) : invoice.discountValue,
        taxRate: data.taxRate !== undefined ? parseFloat(data.taxRate) : invoice.taxRate,
        taxAmount: data.taxAmount !== undefined ? parseFloat(data.taxAmount) : invoice.taxAmount,
        total: data.total !== undefined ? parseFloat(data.total) : invoice.total,
        amountPaid: data.amountPaid !== undefined ? parseFloat(data.amountPaid) : invoice.amountPaid,
        dueDate: data.dueDate ? new Date(data.dueDate) : invoice.dueDate,
        paidDate: data.paidDate ? new Date(data.paidDate) : invoice.paidDate,
        notes: data.notes || invoice.notes,
        paymentTerms: data.paymentTerms || invoice.paymentTerms,
        stripePaymentUrl: data.stripePaymentUrl || invoice.stripePaymentUrl,
        sentAt: data.markAsSent ? new Date() : invoice.sentAt,
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

// DELETE invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);

    const invoice = await db.invoice.findFirst({
      where: { id: params.id, userId },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Delete line items first
    await db.invoiceItem.deleteMany({
      where: { invoiceId: invoice.id },
    });

    await db.invoice.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Invoice deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}
