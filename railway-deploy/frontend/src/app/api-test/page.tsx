"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";

export default function ApiTestPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testEndpoints = [
    "/api/v1/companies",
    "/api/v1/accounting/dashboard/metrics",
    "/api/v1/accounting/aged-balance",
    "/api/v1/treasury/forecast",
    "/api/v1/crm/stats"
  ];

  const runTests = async () => {
    setLoading(true);
    const testResults = [];
    
    for (const endpoint of testEndpoints) {
      try {
        const response = await apiGet(endpoint, { 
          companyId: "1805bc61-7cfd-44e9-8a63-17187bf05dc7" 
        });
        testResults.push({
          endpoint,
          status: "✅ Success",
          data: response
        });
      } catch (error: any) {
        testResults.push({
          endpoint,
          status: "❌ Error",
          error: error.message
        });
      }
    }
    
    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 API Test Page</h1>
        
        <button
          onClick={runTests}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Run API Tests"}
        </button>

        {results.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">Test Results:</h2>
            {results.map((result, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {result.endpoint}
                  </code>
                  <span className={result.status.includes("✅") ? "text-green-600" : "text-red-600"}>
                    {result.status}
                  </span>
                </div>
                {result.error && (
                  <p className="text-red-600 text-sm mt-2">{result.error}</p>
                )}
                {result.data && (
                  <details className="mt-2">
                    <summary className="text-sm text-gray-600 cursor-pointer">View Response</summary>
                    <pre className="text-xs bg-gray-50 p-2 mt-2 overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
