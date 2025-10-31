import { useEffect, useMemo, useState } from 'react';
import { wallet } from '../lib/hashpack';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Wallet, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';

function inIframe() {
  // Désactivé: la preview Codenut n'est pas un vrai iframe
  // Les extensions HashPack fonctionnent normalement
  return false;
}

function NewTabHint() {
  const openTab = () => window.open(window.location.href, '_blank', 'noopener,noreferrer');
  return (
    <Alert variant="default" className="bg-yellow-50 border-yellow-200">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800">
        <div className="flex items-center justify-between">
          <span>Cette application est intégrée. Les extensions ne peuvent pas s'injecter dans les iframes.</span>
          <Button 
            onClick={openTab} 
            variant="outline" 
            size="sm"
            className="ml-2 bg-yellow-600 text-white hover:bg-yellow-700"
          >
            Ouvrir dans un nouvel onglet
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

function HelpPanel({ network }: { network: string }) {
  return (
    <div className="space-y-3 p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="font-semibold text-gray-900 flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-blue-600" />
        Aucun compte <span className="uppercase font-bold text-blue-700">{network}</span> disponible
      </div>
      
      <div className="text-sm text-gray-700 space-y-2">
        <p className="font-medium">Pour connecter votre wallet HashPack, suivez ces étapes:</p>
        <ol className="list-decimal ml-5 space-y-2">
          <li>
            <strong>Installez l'extension HashPack</strong>
            <br />
            <a
              className="text-blue-700 underline hover:text-blue-900 inline-flex items-center gap-1"
              target="_blank"
              rel="noreferrer"
              href="https://chromewebstore.google.com/detail/hashpack/heoegjdnijfacjfoebdnlobjekoebcag"
            >
              Chrome Web Store <ExternalLink className="h-3 w-3" />
            </a>
          </li>
          <li>
            <strong>Créez un compte Hedera Testnet</strong>
            <br />
            <a
              className="text-blue-700 underline hover:text-blue-900 inline-flex items-center gap-1"
              target="_blank"
              rel="noreferrer"
              href="https://portal.hedera.com/register"
            >
              Portail Hedera (Testnet) <ExternalLink className="h-3 w-3" />
            </a>
          </li>
          <li>
            <strong>Importez votre compte dans HashPack</strong>
            <br />
            <span className="text-gray-600">
              HashPack → Paramètres → Réseaux → <strong>Testnet</strong> → <em>Importer un compte</em> (collez votre clé privée du portail)
            </span>
          </li>
          <li>
            <strong>Reconnectez-vous</strong>
            <br />
            <span className="text-gray-600">Revenez ici et cliquez sur "Réessayer"</span>
          </li>
        </ol>
      </div>

      <div className="flex gap-2 flex-wrap pt-2">
        <Button asChild variant="default" size="sm" className="bg-black hover:bg-gray-800">
          <a
            target="_blank"
            rel="noreferrer"
            href="https://chromewebstore.google.com/detail/hashpack/heoegjdnijfacjfoebdnlobjekoebcag"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Installer HashPack
          </a>
        </Button>
        <Button asChild variant="default" size="sm" className="bg-black hover:bg-gray-800">
          <a target="_blank" rel="noreferrer" href="https://portal.hedera.com/register">
            <ExternalLink className="h-3 w-3 mr-1" />
            Créer un compte Testnet
          </a>
        </Button>
        <Button onClick={() => wallet.connect()} variant="outline" size="sm">
          Réessayer
        </Button>
      </div>
    </div>
  );
}

export default function WalletLogin() {
  const [state, setState] = useState(wallet.getState());
  const embedded = useMemo(() => inIframe(), []);

  useEffect(() => {
    const unsubscribe = wallet.subscribe(setState);
    return unsubscribe;
  }, []);

  const network = (state.status !== 'idle' && 'diag' in state && state.diag?.network) || 'testnet';

  return (
    <div className="space-y-4">
      {embedded && <NewTabHint />}

      {state.status === 'paired' && (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Connecté: {state.sessionData?.accountIds?.[0] ?? 'Compte Hedera'}
          </AlertDescription>
        </Alert>
      )}

      {state.status === 'connecting' && (
        <Alert variant="default" className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Connexion en cours… Vérifiez le popup de l'extension ou utilisez le QR code dans la modal.
          </AlertDescription>
        </Alert>
      )}

      {state.status === 'error' && (
        <>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
          <HelpPanel network={network} />
        </>
      )}

      <div className="flex gap-2">
        <Button 
          onClick={() => wallet.connect()} 
          className="flex-1"
          disabled={state.status === 'connecting' || state.status === 'paired'}
        >
          <Wallet className="mr-2 h-4 w-4" />
          {state.status === 'paired' ? 'Connecté' : 'Connecter le Wallet'}
        </Button>
        
        {state.status === 'paired' && (
          <Button 
            onClick={() => wallet.disconnect()} 
            variant="outline"
          >
            Déconnecter
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-500">
        💡 Astuce: Si rien ne se passe, ouvrez l'application dans un nouvel onglet et assurez-vous que HashPack est installé et activé sur ce site.
      </p>
    </div>
  );
}
