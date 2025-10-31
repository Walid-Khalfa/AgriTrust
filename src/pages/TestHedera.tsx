import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function TestHedera() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testCredentials = async () => {
    setTesting(true);
    setResult(null);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('test-hedera-simple', {
        body: {},
      });

      if (invokeError) {
        throw invokeError;
      }

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to test credentials');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Test Hedera Credentials</CardTitle>
          <CardDescription>
            Verify that your Hedera operator credentials are configured correctly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testCredentials} disabled={testing} className="w-full">
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Credentials'
            )}
          </Button>

          {result && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold text-green-800">{result.message}</p>
                  <div className="text-sm space-y-1 text-green-700">
                    <p><strong>Operator ID:</strong> {result.operatorId}</p>
                    <p><strong>Key Method:</strong> {result.keyMethod}</p>
                    <p><strong>Public Key:</strong> <code className="text-xs">{result.publicKey}</code></p>
                    <p><strong>Balance:</strong> {result.balance}</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Error testing credentials</p>
                  <p className="text-sm">{error}</p>
                  <p className="text-xs mt-2">
                    Check the Supabase Edge Function logs for more details.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t">
            <p className="font-semibold">What this test does:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Verifies environment variables are set</li>
              <li>Tests private key parsing (DER/ED25519/ECDSA)</li>
              <li>Derives public key from private key</li>
              <li>Performs a simple balance query (no transaction signing)</li>
            </ul>
            <p className="pt-2">
              If this test succeeds, your credentials are valid. If tokenization still fails,
              the issue is with transaction signing logic.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
