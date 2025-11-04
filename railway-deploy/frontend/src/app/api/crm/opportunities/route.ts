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

    // Données mockées pour éviter les erreurs
    const mockOpportunities = [
      {
        id: 1,
        title: "Projet ERP pour Client A",
        company: "Client A",
        value: 50000,
        stage: "Proposition",
        probability: 60,
        expectedCloseDate: "2024-12-15",
        owner: "Jean Dupont",
        createdAt: "2024-11-01"
      },
      {
        id: 2,
        title: "Migration Cloud Client B",
        company: "Client B", 
        value: 75000,
        stage: "Négociation",
        probability: 80,
        expectedCloseDate: "2024-11-30",
        owner: "Marie Martin",
        createdAt: "2024-10-15"
      }
    ];

    return NextResponse.json(mockOpportunities, { status: 200 });
  } catch (error) {
    console.error('CRM Opportunities Error:', error);
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mock création d'opportunité
    const newOpportunity = {
      id: Date.now(),
      ...body,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json(newOpportunity, { status: 201 });
  } catch (error) {
    console.error('CRM Create Opportunity Error:', error);
    return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 });
  }
}
