import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

function getUserIdFromRequest(request: NextRequest): string {
  const userId = request.cookies.get('userId')?.value;
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

// GET single job
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);

    const job = await db.job.findFirst({
      where: { id: params.id, userId },
      include: {
        customer: true,
        quote: true,
        tasks: true,
        events: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

// PUT update job
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);
    const data = await request.json();

    const job = await db.job.findFirst({
      where: { id: params.id, userId },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const updated = await db.job.update({
      where: { id: params.id },
      data: {
        title: data.title || job.title,
        description: data.description || job.description,
        status: data.status || job.status,
        priority: data.priority || job.priority,
        startDate: data.startDate ? new Date(data.startDate) : job.startDate,
        dueDate: data.dueDate ? new Date(data.dueDate) : job.dueDate,
        completedDate: data.completedDate ? new Date(data.completedDate) : job.completedDate,
        notes: data.notes || job.notes,
        estimatedHours: data.estimatedHours ? parseFloat(data.estimatedHours) : job.estimatedHours,
        actualHours: data.actualHours ? parseFloat(data.actualHours) : job.actualHours,
      },
      include: {
        customer: true,
        quote: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

// DELETE job
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);

    const job = await db.job.findFirst({
      where: { id: params.id, userId },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    await db.job.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Job deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}
