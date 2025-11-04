import { NextRequest, NextResponse } from 'next/server';

// Forcer cette route à être dynamique
export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bms-production-d9e9.up.railway.app';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Pour l'instant, retournons des données mockées pour éviter l'erreur
    // TODO: Implémenter l'appel réel au backend CRM
    const mockStages = [
      {
        id: 1,
        name: "Prospection",
        description: "Nouveaux prospects à contacter",
        order: 1,
        color: "#94a3b8"
      },
      {
        id: 2,
        name: "Qualification",
        description: "Prospects qualifiés en cours",
        order: 2,
        color: "#3b82f6"
      },
      {
        id: 3,
        name: "Proposition",
        description: "Proposition envoyée",
        order: 3,
        color: "#f59e0b"
      },
      {
        id: 4,
        name: "Négociation",
        description: "En cours de négociation",
        order: 4,
        color: "#f97316"
      },
      {
        id: 5,
        name: "Gagné",
        description: "Opportunités converties",
        order: 5,
        color: "#10b981"
      },
      {
        id: 6,
        name: "Perdu",
        description: "Opportunités non converties",
        order: 6,
        color: "#ef4444"
      }
    ];

    return NextResponse.json(mockStages, { status: 200 });
  } catch (error) {
    console.error('CRM Pipeline Stages Error:', error);
    return NextResponse.json({ error: 'Failed to fetch pipeline stages' }, { status: 500 });
  }
}
