import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test tanpa Prisma dulu
    return NextResponse.json([
      { id: 1, title: 'Test Task', description: 'Test', completed: false }
    ]);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ 
      message: 'POST received', 
      body 
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed', details: String(error) },
      { status: 500 }
    );
  }
}