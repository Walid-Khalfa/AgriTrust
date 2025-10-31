import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { QRCodeCanvas } from 'qrcode.react';
import { tokenizeBatch } from '@/lib/api';
import { TrustBadge } from '@/components/TrustBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, CheckCircle2, AlertCircle, Sparkles, Award, Copy, ExternalLink, FileText, Link2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';

export default function BatchTokenize() {
  const navigate = useNavigate();
  const [txIds, setTxIds] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(true);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: { hcsTransactionIds: string[]; isDemoMode: boolean }) => {
      const result = await tokenizeBatch(
        { hcsTransactionIds: data.hcsTransactionIds },
        data.isDemoMode
      );
      return { ...result, hcsTransactionIds: data.hcsTransactionIds };
    },
    onSuccess: (data) => {
      toast({
        title: 'AI Report Generated & Certificate Minted!',
        description: `Token ID: ${data.tokenId} | Serial: ${data.serialNumber}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Tokenization Failed',
        description: error.response?.data?.details || error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const hcsTransactionIds = txIds
      .split(/[\n,]/)
      .map(id => id.trim())
      .filter(id => id.length > 0);

    if (hcsTransactionIds.length === 0) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter at least one HCS transaction ID',
        variant: 'destructive',
      });
      return;
    }

    mutation.mutate({ hcsTransactionIds, isDemoMode });
  };

  // Success screen
  if (mutation.isSuccess && mutation.data) {
    const { tokenId, serialNumber, ai_summary } = mutation.data;
    const verifyUrl = `${window.location.origin}/verify/${tokenId}/${serialNumber}`;

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
        <Helmet>
          <title>Report Generated | AgriTrust</title>
        </Helmet>
        <Navbar />
        <div className="max-w-3xl mx-auto p-4 md:p-8 animate-fade-in">
          <div className="text-center p-6 md:p-8 bg-white shadow-xl rounded-lg">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
              Report Generated & Certificate Minted!
            </h1>
            <p className="text-gray-600 mb-8">Your AI trust analysis is complete and permanently stored on Hedera</p>
            
            {ai_summary && (
              <>
                <div className="my-8">
                  <TrustBadge score={ai_summary.trustScore} />
                </div>

                <div className="my-6 p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-lg border border-violet-200">
                  <div className="flex items-center gap-2 text-violet-700 font-bold text-lg mb-3">
                    <Sparkles className="h-5 w-5" />
                    <span>AI Summary (EN)</span>
                  </div>
                  <p className="text-gray-700 text-left italic">"{ai_summary.summary_en}"</p>
                </div>

                {ai_summary.summary_fr && (
                  <div className="my-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-700 font-bold text-lg mb-3">
                      <Sparkles className="h-5 w-5" />
                      <span>Résumé IA (FR)</span>
                    </div>
                    <p className="text-gray-700 text-left italic">"{ai_summary.summary_fr}"</p>
                  </div>
                )}

                {ai_summary.trustExplanation && (
                  <div className="my-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-base mb-2">
                      <Award className="h-5 w-5" />
                      <span>Trust Score Explanation</span>
                    </div>
                    <p className="text-gray-700 text-sm text-left">{ai_summary.trustExplanation}</p>
                  </div>
                )}
              </>
            )}
            
            <div className="my-6 space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Token ID:</span>
                <span className="font-mono text-sm text-gray-900">{tokenId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Serial Number:</span>
                <span className="font-mono text-sm text-gray-900">{serialNumber}</span>
              </div>
              <a 
                href={`https://hashscan.io/testnet/token/${tokenId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                View on HashScan
              </a>
            </div>

            <div className="flex flex-col items-center my-8 p-6 bg-white border-2 border-dashed border-gray-300 rounded-lg">
              <QRCodeCanvas value={verifyUrl} size={160} />
              <p className="mt-3 text-sm font-semibold text-gray-600">Scan to verify certificate</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => {
                  navigator.clipboard.writeText(verifyUrl);
                  toast({ title: 'Verification URL copied!' });
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Verification Link
              </Button>
            </div>
            
            <Button
              onClick={() => navigate(`/verify/${tokenId}/${serialNumber}`)}
              className="w-full text-lg px-6 py-4 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              View Full Verification Page
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Form screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
      <Helmet>
        <title>Generate AI Trust Report | AgriTrust</title>
      </Helmet>
      <Navbar />
      <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-block p-3 bg-violet-100 rounded-2xl mb-2">
            <Sparkles className="h-8 w-8 text-violet-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Generate AI Trust Report & Certificate
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our AI will analyze your HCS proof, generate a Trust Score, and mint it all as a permanent NFT certificate.
          </p>
        </div>

        {/* Illustration */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg">
          <img 
            src="https://assets-gen.codenut.dev/images/1761555094_85537f24.png" 
            alt="AI Trust Analysis" 
            className="w-full h-48 md:h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Form Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-violet-600" />
              AI Analysis & NFT Minting
            </CardTitle>
            <CardDescription className="text-base">
              Link HCS transaction IDs to generate an AI trust report and create a permanent NFT certificate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="txIds" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-violet-600" />
                  HCS Transaction IDs
                </Label>
                <Textarea
                  id="txIds"
                  placeholder="0.0.123456@1234567890.123456789&#10;0.0.123456@1234567891.123456789&#10;or comma-separated"
                  value={txIds}
                  onChange={(e) => setTxIds(e.target.value)}
                  rows={6}
                  required
                  disabled={mutation.isPending}
                  className="font-mono text-sm border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                />
                <p className="text-xs text-gray-600 flex items-start gap-1">
                  <FileText className="h-3 w-3 mt-0.5 text-gray-500" />
                  Enter transaction IDs from batch registration (one per line or comma-separated)
                </p>
              </div>

              <div className="flex items-center space-x-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <Checkbox
                  id="demoMode"
                  checked={isDemoMode}
                  onCheckedChange={(checked) => setIsDemoMode(checked as boolean)}
                  disabled={mutation.isPending}
                />
                <Label
                  htmlFor="demoMode"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Use Demo Mode (No wallet required - guaranteed success for presentations)
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-lg hover:shadow-xl transition-all"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating AI Report & Minting...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate AI Report & Mint
                  </>
                )}
              </Button>
            </form>

            {mutation.isError && (
              <Alert className="mt-6 border-red-200 bg-red-50 shadow-md">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <AlertDescription className="text-red-900 font-semibold">
                  {(mutation.error as any)?.response?.data?.details || mutation.error.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
