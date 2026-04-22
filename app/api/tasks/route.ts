import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

function getUserIdFromRequest(request: NextRequest): string {
  const userId = request.cookies.get('userId')?.value;
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

// GET all tasks
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const status = request.nextUrl.searchParams.get('status');
    const jobId = request.nextUrl.searchParams.get('jobId');

    let where: any = { userId };
    if (status) where.status = status;
    if (jobId) where.jobId = jobId;

    const tasks = await db.task.findMany({
      where,
      include: { job: true, events: true },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST create task
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const data = await request.json();

    const task = await db.task.create({
      data: {
        userId,
        jobId: data.jobId,
        title: data.title,
        description: data.description,
        status: data.status || 'pending',
        priority: data.priority || 'medium',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        dueTime: data.dueTime,
        isRecurring: data.isRecurring || false,
        recurrencePattern: data.recurrencePattern,
        notes: data.notes,
      },
      include: { job: true },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
