import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

function getUserIdFromRequest(request: NextRequest): string {
  const userId = request.cookies.get('userId')?.value;
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);

    const product = await db.product.findFirst({
      where: { id: params.id, userId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);
    const data = await request.json();

    const product = await db.product.findFirst({
      where: { id: params.id, userId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updated = await db.product.update({
      where: { id: params.id },
      data: {
        name: data.name || product.name,
        description: data.description || product.description,
        category: data.category || product.category,
        unitPrice: data.unitPrice ? parseFloat(data.unitPrice) : product.unitPrice,
        imageUrl: data.imageUrl || product.imageUrl,
        isTaxable: data.isTaxable !== undefined ? data.isTaxable : product.isTaxable,
        taxRate: data.taxRate !== undefined ? data.taxRate : product.taxRate,
        isActive: data.isActive !== undefined ? data.isActive : product.isActive,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);

    const product = await db.product.findFirst({
      where: { id: params.id, userId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await db.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
