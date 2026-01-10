"use client";

import * as React from "react";
import { usePrivy } from "@privy-io/react-auth";
import { createAgentApiClient } from "@/api/agent-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function DebugPage() {
  const { getAccessToken, authenticated, ready } = usePrivy();
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<unknown>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [token, setToken] = React.useState<string | null>(null);

  const handleTestRequest = React.useCallback(async () => {
    if (!authenticated || !ready) {
      setError("Please login first");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);
    setToken(null);

    try {
      // Get access token from Privy
      const accessToken = await getAccessToken();
      
      if (!accessToken) {
        throw new Error("Failed to get access token");
      }

      setToken(accessToken);
      console.log("[DEBUG] Access token obtained:", accessToken.substring(0, 20) + "...");

      // Create API client with token
      const apiClient = createAgentApiClient(accessToken);

      // Call getTemplates API
      console.log("[DEBUG] Calling getTemplates...");
      const response = await apiClient.getTemplates();

      console.log("[DEBUG] Response received:", response);
      setData(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("[DEBUG] Error:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [authenticated, ready, getAccessToken]);

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please login to test the API</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">API Debug Page</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Test the getTemplates API endpoint with Privy authentication
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Test getTemplates API</CardTitle>
            <CardDescription>
              Click the button below to test the getTemplates endpoint using your Privy access token
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleTestRequest}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Spinner className="mr-2" />
                  Testing...
                </>
              ) : (
                "Test getTemplates"
              )}
            </Button>
          </CardContent>
        </Card>

        {token && (
          <Card>
            <CardHeader>
              <CardTitle>Access Token</CardTitle>
              <CardDescription>Token used for the request (first 50 characters)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-bg-secondary p-3 font-mono text-xs text-text-secondary break-all">
                {token.substring(0, 50)}...
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card>
            <CardHeader>
              <CardTitle className="text-error">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-error/10 p-3 text-sm text-error">
                {error}
              </div>
            </CardContent>
          </Card>
        )}

        {data && (
          <Card>
            <CardHeader>
              <CardTitle>Response Data</CardTitle>
              <CardDescription>Response from getTemplates API</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-auto rounded-md bg-bg-secondary p-4 text-xs text-text-secondary">
                {JSON.stringify(data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

