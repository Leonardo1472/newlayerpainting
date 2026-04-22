import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

function getUserIdFromRequest(request: NextRequest): string {
  const userId = request.cookies.get('userId')?.value;
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

// GET calendar events (with optional date range)
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const startDate = request.nextUrl.searchParams.get('startDate');
    const endDate = request.nextUrl.searchParams.get('endDate');

    let where: any = { userId };

    if (startDate && endDate) {
      where.startDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const events = await db.calendarEvent.findMany({
      where,
      include: {
        customer: true,
        job: true,
        task: true,
      },
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 });
  }
}

// POST create calendar event
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const data = await request.json();

    const event = await db.calendarEvent.create({
      data: {
        userId,
        jobId: data.jobId,
        taskId: data.taskId,
        customerId: data.customerId,
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        eventType: data.eventType || 'appointment',
        location: data.location,
        isAllDay: data.isAllDay || false,
        isRecurring: data.isRecurring || false,
        recurrencePattern: data.recurrencePattern,
        color: data.color || 'blue',
        notes: data.notes,
      },
      include: { customer: true, job: true, task: true },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json({ error: 'Failed to create calendar event' }, { status: 500 });
  }
}
