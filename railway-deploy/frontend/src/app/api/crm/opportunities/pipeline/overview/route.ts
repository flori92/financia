import { NextRequest, NextResponse } from 'next/server';

// Forcer cette route à être dynamique
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Données mockées pour le pipeline overview
    const mockOverview = {
      total: 25,
      byStage: {
        "Prospection": 8,
        "Qualification": 6,
        "Proposition": 5,
        "Négociation": 3,
        "Gagné": 2,
        "Perdu": 1
      },
      totalValue: 1250000,
      averageValue: 50000,
      conversionRate: 8
    };

    return NextResponse.json(mockOverview, { status: 200 });
  } catch (error) {
    console.error('CRM Pipeline Overview Error:', error);
    return NextResponse.json({ error: 'Failed to fetch pipeline overview' }, { status: 500 });
  }
}
