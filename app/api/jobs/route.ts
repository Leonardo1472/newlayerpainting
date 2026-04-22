import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

function getUserIdFromRequest(request: NextRequest): string {
  const userId = request.cookies.get('userId')?.value;
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

// GET all jobs
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const status = request.nextUrl.searchParams.get('status');

    let where: any = { userId };
    if (status) {
      where.status = status;
    }

    const jobs = await db.job.findMany({
      where,
      include: {
        customer: true,
        quote: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

// POST create job
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const data = await request.json();

    // Generate job number
    const count = await db.job.count({ where: { userId } });
    const jobNumber = `JOB-${String(count + 1).padStart(4, '0')}`;

    const job = await db.job.create({
      data: {
        userId,
        customerId: data.customerId,
        quoteId: data.quoteId,
        jobNumber,
        title: data.title,
        description: data.description,
        status: data.status || 'not_started',
        priority: data.priority || 'medium',
        startDate: data.startDate ? new Date(data.startDate) : null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        notes: data.notes,
      },
      include: {
        customer: true,
        quote: true,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('Create job error:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
