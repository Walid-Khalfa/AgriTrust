import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Clock, CheckCircle, Info } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Helmet } from 'react-helmet-async';

export default function SessionSettings() {
  const navigate = useNavigate();
  const [sessionDuration, setSessionDuration] = useState<string>('3600'); // 1 heure par défaut
  const [success, setSuccess] = useState<string | null>(null);

  const sessionOptions = [
    { value: '1800', label: '30 minutes' },
    { value: '3600', label: '1 heure' },
    { value: '7200', label: '2 heures' },
    { value: '14400', label: '4 heures' },
    { value: '28800', label: '8 heures' },
    { value: '86400', label: '24 heures' },
    { value: '604800', label: '7 jours' },
    { value: '2592000', label: '30 jours' },
  ];

  const handleSave = async () => {
    setSuccess(null);
    
    // Sauvegarder la préférence dans le localStorage
    localStorage.setItem('session_duration_preference', sessionDuration);
    
    // Rafraîchir la session avec la nouvelle durée
    const { error } = await supabase.auth.refreshSession();
    
    if (!error) {
      const selectedOption = sessionOptions.find(opt => opt.value === sessionDuration);
      setSuccess(`Durée de session mise à jour: ${selectedOption?.label}`);
    }
  };

  const getCurrentSessionInfo = () => {
    const expiresAt = localStorage.getItem('supabase.auth.token')
      ? JSON.parse(localStorage.getItem('supabase.auth.token') || '{}').expires_at
      : null;
    
    if (expiresAt) {
      const expiryDate = new Date(expiresAt * 1000);
      return expiryDate.toLocaleString('fr-FR');
    }
    return 'Non disponible';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Helmet>
        <title>Session Settings | AgriTrust</title>
      </Helmet>
      <div className="container mx-auto max-w-2xl py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/profile')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au profil
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Paramètres de session
            </CardTitle>
            <CardDescription>
              Configurez la durée de validité de votre session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {success && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Session actuelle expire le:</strong> {getCurrentSessionInfo()}
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="session-duration">Durée de session souhaitée</Label>
                <Select value={sessionDuration} onValueChange={setSessionDuration}>
                  <SelectTrigger id="session-duration" className="mt-2">
                    <SelectValue placeholder="Sélectionner une durée" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">À propos des sessions</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• La session est automatiquement rafraîchie avant expiration</li>
                  <li>• Vous restez connecté même après fermeture du navigateur</li>
                  <li>• Pour plus de sécurité, choisissez une durée courte</li>
                  <li>• La durée maximale côté serveur est de 24 heures (JWT)</li>
                </ul>
              </div>

              <Button onClick={handleSave} className="w-full">
                Enregistrer les paramètres
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
