import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

function getUserIdFromRequest(request: NextRequest): string {
  const userId = request.cookies.get('userId')?.value;
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

// GET all products
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const searchQuery = request.nextUrl.searchParams.get('search');
    const category = request.nextUrl.searchParams.get('category');

    let where: any = { userId };

    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const products = await db.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST create product
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const data = await request.json();

    const product = await db.product.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        category: data.category,
        sku: data.sku,
        unitPrice: parseFloat(data.unitPrice),
        imageUrl: data.imageUrl,
        isTaxable: data.isTaxable || false,
        taxRate: data.taxRate || 0,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
