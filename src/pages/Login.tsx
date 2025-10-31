import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Mail, Lock, Leaf, Shield, Sparkles, Globe, TrendingUp } from 'lucide-react';
import WalletLogin from '@/components/WalletLogin';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import logoUrl from '@/assets/agritrust-logo.svg';
import { DEMO_VERIFY_URL } from '@/lib/demo';

export default function Login() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (error: any) {
      setAuthError(error.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 font-body text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-white relative overflow-hidden">
      <Helmet>
        <title>Login | AgriTrust</title>
      </Helmet>
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}} />
      
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-700 to-blue-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Hexagon Pattern Background */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url(https://assets-gen.codenut.dev/images/1761634637_f0ea57c4.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-40 animate-pulse" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-emerald-400 rounded-full mix-blend-overlay filter blur-3xl opacity-40 animate-pulse" style={{animationDelay: '1.5s'}} />
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="mb-8">
            <img
              src={logoUrl}
              alt="AgriTrust"
              className="h-16 w-auto drop-shadow-2xl bg-white/90 p-2 rounded-xl"
            />
          </div>
          <h1 className="text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-2xl">
            AgriTrust
          </h1>
          <p className="text-2xl text-emerald-50 font-body leading-relaxed drop-shadow-lg">
            Secure agricultural traceability powered by AI and Hedera
          </p>
          
          {/* Stats Banner */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-12 grid grid-cols-3 gap-6 bg-white/10 backdrop-blur-md rounded-2xl p-8 border-2 border-white/30 shadow-2xl"
          >
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-xl mb-3">
                <Shield className="h-7 w-7 text-emerald-200" />
              </div>
              <div className="text-sm text-emerald-100 font-semibold">Blockchain Hedera</div>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-xl mb-3">
                <Sparkles className="h-7 w-7 text-blue-200" />
              </div>
              <div className="text-sm text-blue-100 font-semibold">IA Gemini 2.5</div>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-xl mb-3">
                <Globe className="h-7 w-7 text-purple-200" />
              </div>
              <div className="text-sm text-purple-100 font-semibold">Multilingue</div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bottom Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative z-10"
        >
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-2xl blur-xl opacity-50" />
            <img 
              src="https://assets-gen.codenut.dev/images/1761634617_bb2f7a28.png" 
              alt="African agricultural landscape" 
              className="relative rounded-2xl shadow-2xl border-4 border-white/30"
            />
          </div>
        </motion.div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <img
                src={logoUrl}
                alt="AgriTrust"
                className="h-16 w-auto mx-auto mb-4 lg:hidden bg-white p-2 rounded-xl"
              />
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome to AgriTrust</h2>
              <p className="text-gray-600 font-body">Sign in to access your account.</p>
            </motion.div>
          </div>

          <Button
            asChild
            className="w-full mb-6 h-12 text-base font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Link to={DEMO_VERIFY_URL}>View Live Demo</Link>
          </Button>
          
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger value="email" className="text-base font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">Email Login</TabsTrigger>
              <TabsTrigger value="wallet" className="text-base font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">Wallet Login</TabsTrigger>
            </TabsList>

            <TabsContent value="email">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="border-2 border-gray-200 shadow-2xl rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-br from-emerald-50 to-blue-50 pb-8">
                    <CardTitle className="text-3xl font-extrabold text-gray-900">Sign In</CardTitle>
                    <CardDescription className="font-body text-base text-gray-600">
                      Enter your credentials to access your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-8">
                    <form onSubmit={handleEmailAuth} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-bold text-gray-700">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-12 h-14 border-2 border-gray-200 rounded-xl font-body text-base focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-bold text-gray-700">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-12 h-14 border-2 border-gray-200 rounded-xl font-body text-base focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                            required
                          />
                        </div>
                      </div>

                      {authError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Alert variant="destructive" className="border-2 border-red-200 bg-red-50 rounded-xl">
                            <AlertCircle className="h-5 w-5" />
                            <AlertDescription className="font-body text-base">{authError}</AlertDescription>
                          </Alert>
                        </motion.div>
                      )}

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="submit"
                          className="w-full h-14 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                          disabled={authLoading}
                        >
                          {authLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              <span>Loading...</span>
                            </div>
                          ) : (
                            isSignUp ? 'Sign Up' : 'Sign In'
                          )}
                        </Button>
                      </motion.div>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => setIsSignUp(!isSignUp)}
                          className="text-sm text-emerald-600 hover:text-emerald-700 font-bold font-body hover:underline transition-all"
                        >
                          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                        </button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="wallet">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="border-2 border-gray-200 shadow-2xl rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-br from-blue-50 to-purple-50 pb-8">
                    <CardTitle className="text-3xl font-extrabold text-gray-900">Wallet Login</CardTitle>
                    <CardDescription className="font-body text-base text-gray-600">
                      Connect your Hedera wallet to continue
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-8">
                    <WalletLogin />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

