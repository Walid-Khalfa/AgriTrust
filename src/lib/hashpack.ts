import { HashConnect, HashConnectConnectionState, SessionData } from 'hashconnect';
import { LedgerId } from '@hashgraph/sdk';

const APP_METADATA = {
  name: 'AgriTrust',
  description: 'Traceability & RWA on Hedera',
  icons: ['https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/hedera.svg'],
  url: typeof window !== 'undefined' ? window.location.origin : 'https://agritrust.app'
};

const NETWORK = (import.meta.env.VITE_HEDERA_NETWORK as string) || 'testnet';
const PAIRING_KEY = 'agl_hashconnect_pairing_v1';

let hc: HashConnect | null = null;

type Diag = {
  embedded?: boolean;
  extensionMaybePresent?: boolean;
  timedOut?: boolean;
  network: string;
};

export type WalletState =
  | { status: 'idle' }
  | { status: 'connecting'; since: number; diag?: Diag }
  | { status: 'paired'; sessionData: SessionData }
  | { status: 'error'; message: string; diag?: Diag };

let currentState: WalletState = { status: 'idle' };
const subscribers = new Set<(s: WalletState) => void>();
const emit = (s: WalletState) => { currentState = s; subscribers.forEach(cb => cb(s)); };

function inIframe() { 
  try { return window.self !== window.top; } catch { return true; } 
}

function detectExtension(): boolean {
  const anyWin = window as any;
  return !!(anyWin.hashpack || anyWin.hedera || anyWin.hbar || anyWin.hashconnect);
}

export const wallet = {
  getState() { return currentState; },
  subscribe(cb: (s: WalletState) => void) { 
    subscribers.add(cb); 
    cb(currentState); 
    return () => { subscribers.delete(cb); }; 
  },

  async init() {
    if (hc) return;
    
    const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';
    const ledgerId = NETWORK === 'mainnet' ? LedgerId.MAINNET : LedgerId.TESTNET;
    hc = new HashConnect(ledgerId, projectId, APP_METADATA, true);
    await hc.init();

    // Restore previous pairing
    const saved = localStorage.getItem(PAIRING_KEY);
    if (saved) {
      try {
        const sessionData = JSON.parse(saved);
        // Check if we have connected accounts
        if (sessionData?.accountIds?.length > 0) {
          emit({ status: 'paired', sessionData });
        }
      } catch {}
    }

    hc.connectionStatusChangeEvent.on((state: HashConnectConnectionState) => {
      console.log('Connection status changed:', state);
      if (state === HashConnectConnectionState.Paired) {
        // Connection is paired, wait for pairing event with account data
      } else if (state === HashConnectConnectionState.Disconnected) {
        localStorage.removeItem(PAIRING_KEY);
        emit({ status: 'idle' });
      }
    });

    hc.pairingEvent.on((data: SessionData) => {
      console.log('Pairing event received:', data);
      localStorage.setItem(PAIRING_KEY, JSON.stringify(data));
      emit({ status: 'paired', sessionData: data });
    });

    hc.disconnectionEvent.on(() => {
      console.log('Disconnection event');
      localStorage.removeItem(PAIRING_KEY);
      emit({ status: 'idle' });
    });
  },

  async connect() {
    if (!hc) await this.init();
    if (!hc) return emit({ status: 'error', message: 'HashConnect not initialized' });

    const diag: Diag = {
      embedded: inIframe(),
      extensionMaybePresent: detectExtension(),
      network: NETWORK
    };

    emit({ status: 'connecting', since: Date.now(), diag });

    try {
      // Attendre que l'extension s'injecte (elle peut prendre quelques ms)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Ouvrir le modal de pairing - il détectera automatiquement l'extension
      await hc.openPairingModal();

      // If still connecting after 8s, assume no applicable accounts
      setTimeout(() => {
        if (currentState.status === 'connecting') {
          emit({
            status: 'error',
            message: `Aucun compte ${NETWORK} trouvé dans HashPack. Veuillez créer/importer un compte ${NETWORK}.`,
            diag: { ...diag, timedOut: true }
          });
        }
      }, 8000);
    } catch (e: any) {
      emit({ 
        status: 'error', 
        message: e?.message || 'Échec d\'ouverture de la modal de connexion',
        diag
      });
    }
  },

  async disconnect() {
    try {
      localStorage.removeItem(PAIRING_KEY);
      if (hc) await hc.disconnect();
    } catch {}
    emit({ status: 'idle' });
  }
};

// Legacy compatibility export
export const hashPackService = {
  async connectWallet(): Promise<string> {
    await wallet.connect();
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Wallet connection timeout - Please approve the connection in HashPack'));
      }, 120000);

      const unsubscribe = wallet.subscribe((state) => {
        if (state.status === 'paired') {
          clearTimeout(timeout);
          unsubscribe();
          resolve(state.sessionData?.accountIds?.[0] || '');
        } else if (state.status === 'error') {
          clearTimeout(timeout);
          unsubscribe();
          reject(new Error(state.message));
        }
      });
    });
  },
  async disconnect() {
    await wallet.disconnect();
  },
  getState() {
    const state = wallet.getState();
    return {
      connected: state.status === 'paired',
      accountId: state.status === 'paired' ? state.sessionData?.accountIds?.[0] || null : null,
      network: 'testnet'
    };
  },
  isConnected() {
    return wallet.getState().status === 'paired';
  },
  getAccountId() {
    const state = wallet.getState();
    return state.status === 'paired' ? state.sessionData?.accountIds?.[0] || null : null;
  }
};
