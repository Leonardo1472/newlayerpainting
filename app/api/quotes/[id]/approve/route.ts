import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

function getUserIdFromRequest(request: NextRequest): string {
  const userId = request.cookies.get('userId')?.value;
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

// Generate unique job number
async function generateJobNumber(userId: string): Promise<string> {
  const count = await db.job.count({ where: { userId } });
  return `JOB-${String(count + 1).padStart(4, '0')}`;
}

// POST approve quote and create job
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);

    // Get the quote
    const quote = await db.quote.findFirst({
      where: { id: params.id, userId },
      include: { customer: true },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Update quote status to approved
    const updatedQuote = await db.quote.update({
      where: { id: params.id },
      data: {
        status: 'approved',
        approvedAt: new Date(),
      },
    });

    // Create job from quote
    const jobNumber = await generateJobNumber(userId);

    const job = await db.job.create({
      data: {
        userId,
        customerId: quote.customerId,
        quoteId: quote.id,
        jobNumber,
        title: quote.title,
        description: quote.description,
        status: 'not_started',
        priority: 'medium',
        notes: quote.notes,
      },
      include: { customer: true, quote: true },
    });

    // Create calendar event for the job
    const jobStartDate = new Date();
    await db.calendarEvent.create({
      data: {
        userId,
        jobId: job.id,
        customerId: quote.customerId,
        title: `Job: ${quote.title}`,
        description: quote.description,
        startDate: jobStartDate,
        endDate: new Date(jobStartDate.getTime() + 24 * 60 * 60 * 1000), // 24 hours later
        eventType: 'deadline',
        color: 'green',
      },
    });

    return NextResponse.json({ quote: updatedQuote, job }, { status: 200 });
  } catch (error) {
    console.error('Approve quote error:', error);
    return NextResponse.json({ error: 'Failed to approve quote' }, { status: 500 });
  }
}
