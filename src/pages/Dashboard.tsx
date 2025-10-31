import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Coins, ShieldCheck, Activity, Clock, Database, Zap, Sparkles, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getDashboardHealth } from '@/lib/api';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import logoUrl from '@/assets/agritrust-logo.svg';

interface DashboardKPIs {
  totalBatches: number;
  totalNfts: number;
  totalVerifications: number;
  aiVerified: number;
}

interface AuditLot {
  token_id: string;
  serial_number: string;
  score: number;
  rationale?: string;
  trustExplanation?: string; // <-- utilisé plus bas
}

interface DashboardAudit {
  approvedLots: AuditLot[];
  flaggedLots: AuditLot[];
}

interface ServiceStatus {
  ok: boolean;
  ms: number;
  model?: string;
  error?: string;
}

interface HealthStatus {
  supabase: ServiceStatus;
  hedera: ServiceStatus;
  gemini: ServiceStatus;
}

interface AIInsight {
  insight_en?: string;
  insight_fr?: string;
  error?: string;
}

export default function Dashboard() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const statsQuery = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    refetchOnWindowFocus: false,
  });

  const healthQuery = useQuery({
    queryKey: ['dashboard-health'],
    queryFn: getDashboardHealth,
    refetchOnWindowFocus: false,
  });

  const statsData = statsQuery.data;
  const healthData = healthQuery.data;

  const kpis: DashboardKPIs = {
    totalBatches: statsData?.kpis?.totalBatches ?? 0,
    totalNfts: statsData?.kpis?.totalNfts ?? 0,
    totalVerifications: statsData?.kpis?.totalVerifications ?? statsData?.kpis?.aiVerified ?? 0,
    aiVerified: statsData?.kpis?.aiVerified ?? statsData?.kpis?.totalVerifications ?? 0,
  };

  const audit: DashboardAudit = {
    approvedLots: statsData?.audit?.approvedLots ?? [],
    flaggedLots: statsData?.audit?.flaggedLots ?? [],
  };

  const aiInsight = (statsData?.aiInsight ?? null) as AIInsight | null;
  const aiInsightText =
    lang === 'fr'
      ? aiInsight?.insight_fr ?? aiInsight?.insight_en
      : aiInsight?.insight_en ?? aiInsight?.insight_fr;

  const statsError =
    statsQuery.error instanceof Error
      ? statsQuery.error.message
      : statsQuery.error
      ? 'Failed to load dashboard stats'
      : null;

  const healthError =
    healthQuery.error instanceof Error
      ? healthQuery.error.message
      : healthQuery.error
      ? 'Failed to load service status'
      : null;

  const healthStatus = healthData?.status as HealthStatus | undefined;
  const statsLoading = statsQuery.isLoading;
  const healthLoading = healthQuery.isLoading;
  const aiInsightError = aiInsight?.error;

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Dashboard | AgriTrust</title>
      </Helmet>
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-blue-50 to-white">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Logo + Brand Name */}
              <motion.div 
                className="flex items-center gap-4 mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                <img
                  src={logoUrl}
                  alt="AgriTrust logo"
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl shadow-lg object-cover bg-white p-2"
                />
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    AgriTrust
                  </h2>
                  <p className="text-sm sm:text-base text-emerald-600 font-semibold mt-0.5">
                    AI-Powered Agricultural Traceability
                  </p>
                </div>
              </motion.div>

              <motion.div 
                className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <CheckCircle2 className="h-4 w-4" />
                Powered by Hedera + AI
              </motion.div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight">
                Fighting <span className="text-emerald-600">Food Fraud</span> in Africa
              </h1>
              
              <p className="text-xl sm:text-2xl font-body text-gray-600 leading-relaxed">
                Blockchain traceability + Artificial Intelligence to guarantee the authenticity of African agricultural products.
              </p>
            </motion.div>
            
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-3xl blur-2xl opacity-20" />
              <img 
                src="https://assets-gen.codenut.dev/images/1761634617_bb2f7a28.png" 
                alt="Producteur africain avec grains de café" 
                className="relative w-full h-auto rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
          <Card className="border-2 border-emerald-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Registered Batches</CardTitle>
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 min-h-[1.5rem] flex items-center">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                ) : (
                  kpis.totalBatches.toLocaleString()
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Total on platform</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">NFTs Created</CardTitle>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Coins className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 min-h-[1.5rem] flex items-center">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                ) : (
                  kpis.totalNfts.toLocaleString()
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Tokenized certificates</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">AI Verifications</CardTitle>
                <div className="bg-purple-100 p-2 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 min-h-[1.5rem] flex items-center">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                ) : (
                  kpis.aiVerified.toLocaleString()
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Batches verified with AI</p>
            </CardContent>
          </Card>
        </div>

        {!statsLoading && !statsError && (
          <p className="text-xs text-gray-500 mb-8">
            {kpis.totalVerifications.toLocaleString()} verifications IA realisees, dont {audit.flaggedLots.length} lot(s) a surveiller.
          </p>
        )}

        {/* AI Insight Card */}
        <Card className="mb-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                AI Analyst Insights
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
                  <button
                    onClick={() => setLang('fr')}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                      lang === 'fr'
                        ? 'bg-purple-600 text-white'
                        : 'bg-transparent text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    FR
                  </button>
                  <button
                    onClick={() => setLang('en')}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                      lang === 'en'
                        ? 'bg-purple-600 text-white'
                        : 'bg-transparent text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    EN
                  </button>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                  <Sparkles className="h-3 w-3" />
                  Generated by Gemini AI
                </div>
              </div>
            </div>
            <CardDescription>Intelligent analysis of your activity</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="text-center py-4 text-gray-500 flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                L'analyste IA examine les données...
              </div>
            ) : statsError ? (
              <div className="text-center py-4 text-red-600 font-semibold">
                Erreur : {statsError}
              </div>
            ) : aiInsightText ? (
              <>
                <p className="text-base text-gray-800 leading-relaxed italic">
                  “{aiInsightText}”
                </p>
                <p className="text-xs text-gray-500 mt-3">
                  Synthese generee le {new Date(statsData?.generatedAt ?? Date.now()).toLocaleString()}
                </p>
              </>
            ) : (
              <p className="text-base text-gray-600 italic">
                IA indisponible momentanément. Les prochaines vérifications alimenteront l’analyse.
              </p>
            )}
            {aiInsightError && !statsLoading && !statsError && (
              <p className="text-xs text-gray-500 mt-2">
                Note IA : {aiInsightError}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Audit Journal & Service Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Audit Journal Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-600" />
                AI Audit Log
              </CardTitle>
              <CardDescription>Batches approved and flagged by AI</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-center py-8 text-gray-500 flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                  Chargement du journal IA...
                </div>
              ) : statsError ? (
                <div className="text-center py-8 text-red-600 font-semibold">
                  Erreur : {statsError}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Approved Lots */}
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Lots approuves
                    </h3>
                    {audit.approvedLots.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">Aucun lot approuve pour le moment.</p>
                    ) : (
                      <ul className="space-y-2">
                        {audit.approvedLots.map((lot, idx) => {
                          const score = Math.round(lot.score || 0);
                          return (
                            <li
                              key={`${lot.token_id}-${lot.serial_number}-${idx}`}
                              className="flex items-start gap-2 text-sm p-2 bg-emerald-50 rounded border border-emerald-200"
                            >
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                              <span className="flex-1">
                                Lot{' '}
                                <a
                                  href={`https://hashscan.io/testnet/token/${lot.token_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline font-medium"
                                >
                                  {lot.token_id}/{lot.serial_number}
                                </a>{' '}
                                - Score {score}/100
                                {lot.trustExplanation && (
                                  <span className="block text-xs text-gray-500 mt-1">
                                    {lot.trustExplanation}
                                  </span>
                                )}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  {/* Flagged Lots */}
                  <div>
                    <h3 className="text-sm font-semibold text-orange-700 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Lots a examiner
                    </h3>
                    {audit.flaggedLots.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">Aucun lot signale par l'IA.</p>
                    ) : (
                      <TooltipProvider>
                        <ul className="space-y-2">
                          {audit.flaggedLots.map((lot, idx) => {
                            const score = Math.round(lot.score || 0);
                            return (
                              <li
                                key={`${lot.token_id}-${lot.serial_number}-${idx}`}
                                className="flex items-start gap-2 text-sm p-2 bg-orange-50 rounded border border-orange-200"
                              >
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p className="text-xs font-semibold mb-1">Raison du signalement :</p>
                                    <p className="text-xs">{lot.rationale}</p>
                                  </TooltipContent>
                                </Tooltip>
                                <span className="flex-1">
                                  Lot{' '}
                                  <a
                                    href={`https://hashscan.io/testnet/token/${lot.token_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline font-medium"
                                  >
                                    {lot.token_id}/{lot.serial_number}
                                  </a>{' '}
                                  - Score {score}/100
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-emerald-600" />
                Service Status
              </CardTitle>
              <CardDescription>Backend services health status</CardDescription>
            </CardHeader>
            <CardContent>
              {healthLoading ? (
                <div className="text-center py-8 text-gray-500">Verification des services...</div>
              ) : healthError ? (
                <div className="text-center py-8">
                  <p className="text-red-600 font-semibold mb-2">⚠️ Connection Error</p>
                  <p className="text-sm text-gray-600 mb-2">{healthError}</p>
                  <p className="text-xs text-gray-500 mt-1">Verifier que le backend est demarre et accessible.</p>
                </div>
              ) : !healthStatus ? (
                <div className="text-center py-8">
                  <p className="text-red-600 font-semibold mb-2">⚠️ No Data</p>
                  <p className="text-sm text-gray-600">Unable to retrieve service status.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Hedera Mirror Node */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${healthStatus.hedera.ok ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Hedera Mirror Node</p>
                        <p className="text-xs text-gray-500">
                          {healthStatus.hedera.ok ? 'Operational' : 'Offline'}
                        </p>
                        {!healthStatus.hedera.ok && healthStatus.hedera.error && (
                          <p className="text-xs text-red-500 mt-1">{healthStatus.hedera.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-700">{healthStatus.hedera.ms}ms</p>
                    </div>
                  </div>

                  {/* Supabase DB */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${healthStatus.supabase.ok ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Supabase DB</p>
                        <p className="text-xs text-gray-500">
                          {healthStatus.supabase.ok ? 'Operationnel' : 'Hors ligne'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-700">{healthStatus.supabase.ms}ms</p>
                    </div>
                  </div>

                  {/* Gemini AI */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${healthStatus.gemini.ok ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Gemini AI {healthStatus.gemini.model ? `(${healthStatus.gemini.model})` : ''}
                        </p>
                        <p className="text-xs text-gray-500">
                          {healthStatus.gemini.ok ? 'Operationnel' : 'Hors ligne'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-700">{healthStatus.gemini.ms}ms</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Technology Stack */}
        <Card>
          <CardHeader>
            <CardTitle>Technology Stack</CardTitle>
            <CardDescription>Technologies used for traceability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
                <p className="text-sm font-semibold text-emerald-900 mb-1">Hedera HCS</p>
                <p className="text-xs text-emerald-700">Immutable consensus</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-1">Hedera HTS</p>
                <p className="text-xs text-blue-700">NFT Tokenization</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <p className="text-sm font-semibold text-purple-900 mb-1">Gemini AI 2.5</p>
                <p className="text-xs text-purple-700">Analysis & Provenance</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                <p className="text-sm font-semibold text-orange-900 mb-1">Supabase</p>
                <p className="text-xs text-orange-700">Database</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
