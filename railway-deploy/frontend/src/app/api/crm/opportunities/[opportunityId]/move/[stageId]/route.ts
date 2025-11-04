import { NextRequest, NextResponse } from 'next/server';

// Forcer cette route à être dynamique
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { opportunityId: string; stageId: string } }
) {
  try {
    const { opportunityId, stageId } = params;
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Mock déplacement d'opportunité
    const result = {
      success: true,
      opportunityId,
      previousStage: "Proposition",
      newStage: stageId,
      movedAt: new Date().toISOString()
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('CRM Move Opportunity Error:', error);
    return NextResponse.json({ error: 'Failed to move opportunity' }, { status: 500 });
  }
}
