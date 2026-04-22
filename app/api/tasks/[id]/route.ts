import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

function getUserIdFromRequest(request: NextRequest): string {
  const userId = request.cookies.get('userId')?.value;
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

// GET single task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);

    const task = await db.task.findFirst({
      where: { id: params.id, userId },
      include: { job: true, events: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

// PUT update task
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);
    const data = await request.json();

    const task = await db.task.findFirst({
      where: { id: params.id, userId },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const updated = await db.task.update({
      where: { id: params.id },
      data: {
        title: data.title || task.title,
        description: data.description || task.description,
        status: data.status || task.status,
        priority: data.priority || task.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : task.dueDate,
        dueTime: data.dueTime || task.dueTime,
        completedAt: data.status === 'completed' ? new Date() : task.completedAt,
        notes: data.notes || task.notes,
      },
      include: { job: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);

    const task = await db.task.findFirst({
      where: { id: params.id, userId },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await db.task.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Task deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
