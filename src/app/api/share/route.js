import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { workbenchState, shareId } = body;

    // Validate the request
    if (!workbenchState || !shareId) {
      return NextResponse.json(
        { error: 'Missing required fields: workbenchState and shareId' },
        { status: 400 }
      );
    }

    // In a real implementation, you would save this to a database
    // For now, we'll just return a success response
    // You could use a database like MongoDB, PostgreSQL, or a cloud service
    
    console.log('Received share request:', { shareId, workbenchState });

    // Example of what you might do with a database:
    // await db.collection('shared_workbenches').insertOne({
    //   shareId,
    //   workbenchState,
    //   createdAt: new Date(),
    //   expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    // });

    return NextResponse.json({
      success: true,
      shareId,
      message: 'Workbench state saved successfully'
    });

  } catch (error) {
    console.error('Error saving workbench state:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');

    if (!shareId) {
      return NextResponse.json(
        { error: 'Missing shareId parameter' },
        { status: 400 }
      );
    }

    // In a real implementation, you would fetch from a database
    // For now, we'll return a mock response
    console.log('Fetching shared workbench:', shareId);

    // Example of what you might do with a database:
    // const sharedWorkbench = await db.collection('shared_workbenches').findOne({
    //   shareId,
    //   expiresAt: { $gt: new Date() }
    // });

    // if (!sharedWorkbench) {
    //   return NextResponse.json(
    //     { error: 'Shared workbench not found or expired' },
    //     { status: 404 }
    //   );
    // }

    // For now, return a mock response
    return NextResponse.json({
      success: true,
      shareId,
      message: 'This is a mock response. Implement database storage for production.'
    });

  } catch (error) {
    console.error('Error fetching shared workbench:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 