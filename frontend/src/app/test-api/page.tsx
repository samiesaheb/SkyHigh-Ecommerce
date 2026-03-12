"use client";

import { useEffect, useState } from "react";

export default function TestApiPage() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const test = async () => {
      try {
        console.log("Testing direct fetch...");
        const startTime = Date.now();
        
        // Test direct fetch without session wrapper
        const response = await fetch("http://localhost:8000/api/v1/products/brands/");
        const fetchTime = Date.now() - startTime;
        
        console.log(`Fetch took ${fetchTime}ms, status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          setResult(JSON.stringify(data, null, 2));
          console.log("Success:", data);
        } else {
          setResult(`Error: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error("Error:", error);
        setResult(`Exception: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    test();
  }, []);

  if (loading) {
    return <div className="p-4">Loading test...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">API Test</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
        {result}
      </pre>
    </div>
  );
}