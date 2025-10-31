import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { hashPackService } from '@/lib/hashpack';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, Mail, Link as LinkIcon, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';

interface UserProfile {
  username: string | null;
  full_name: string | null;
  hedera_account_id: string | null;
  auth_method: string;
  created_at: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, linkHederaWallet } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkWallet = async () => {
    setError(null);
    setSuccess(null);
    setLinking(true);

    try {
      const accountId = await hashPackService.connectWallet();
      
      if (!accountId) {
        throw new Error('No account ID received from wallet');
      }

      await linkHederaWallet(accountId);
      setSuccess(`Successfully linked Hedera wallet: ${accountId}`);
      await loadProfile();
    } catch (err: any) {
      console.error('Wallet linking error:', err);
      setError(err.message || 'Failed to link wallet');
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-2">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Helmet>
        <title>Profile | AgriTrust</title>
      </Helmet>
      <Navbar />
      <div className="container mx-auto max-w-2xl py-8 px-4">

        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>
              Manage your account and linked Hedera wallet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">{user?.email || 'Anonymous'}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Username</label>
                <p className="text-gray-900 mt-1">{profile?.username || 'Not set'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Authentication Method</label>
                <div className="mt-1">
                  <Badge variant={profile?.auth_method === 'hybrid' ? 'default' : 'secondary'}>
                    {profile?.auth_method || 'email'}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Hedera Wallet</label>
                {profile?.hedera_account_id ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Wallet className="h-4 w-4 text-green-600" />
                    <span className="text-gray-900 font-mono text-sm">
                      {profile.hedera_account_id}
                    </span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Linked
                    </Badge>
                  </div>
                ) : (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-2">
                      No wallet linked. Connect your HashPack wallet to enable hybrid authentication.
                    </p>
                    <Button
                      onClick={handleLinkWallet}
                      disabled={linking}
                      variant="outline"
                    >
                      <LinkIcon className="mr-2 h-4 w-4" />
                      {linking ? 'Linking...' : 'Link Hedera Wallet'}
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Member Since</label>
                <p className="text-gray-900 mt-1">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : 'Unknown'}
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button
                  onClick={() => navigate('/session-settings')}
                  variant="outline"
                  className="w-full"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Gérer la durée de session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
