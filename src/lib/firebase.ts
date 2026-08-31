import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || 'consulta-imobiliaria-ilheus');

export interface SinterConfig {
  codigoIbge: number;
  nomeMunicipio: string;
  uf: string;
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  sinterApiUrl: string;
  certThumbprint?: string;
  tokenAtual?: string;
  tokenValidoAte?: string;
  modificadoEm?: string;
}

export const DEFAULT_ILHEUS_CONFIG: SinterConfig = {
  codigoIbge: 2913606,
  nomeMunicipio: 'Ilhéus',
  uf: 'BA',
  clientId: '',
  clientSecret: '',
  tokenUrl: 'https://gateway.apivalidacao.serpro.gov.br/token',
  sinterApiUrl: 'https://sinter-api.rfb.gov.br/v1/imoveis',
  certThumbprint: '',
  tokenAtual: '',
  tokenValidoAte: ''
};

const CONFIG_DOC_PATH = ['configuracoes', 'sinter_ilheus'] as const;

/**
 * Busca as credenciais e o código IBGE salvos no Firestore (Banco: consulta-imobiliaria-ilheus)
 */
export async function getSinterConfig(): Promise<SinterConfig> {
  try {
    const docRef = doc(db, CONFIG_DOC_PATH[0], CONFIG_DOC_PATH[1]);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as SinterConfig;
    } else {
      // Salva a configuração padrão se ainda não existir
      await setDoc(docRef, {
        ...DEFAULT_ILHEUS_CONFIG,
        modificadoEm: new Date().toISOString()
      });
      return DEFAULT_ILHEUS_CONFIG;
    }
  } catch (err) {
    console.warn('Erro ao carregar configurações do Firebase Firestore:', err);
    return DEFAULT_ILHEUS_CONFIG;
  }
}

/**
 * Salva credenciais e parâmetros de conexão no banco consulta-imobiliaria-ilheus
 */
export async function saveSinterConfig(config: Partial<SinterConfig>): Promise<void> {
  const docRef = doc(db, CONFIG_DOC_PATH[0], CONFIG_DOC_PATH[1]);
  await setDoc(docRef, {
    ...config,
    modificadoEm: new Date().toISOString()
  }, { merge: true });
}

/**
 * Escuta atualizações em tempo real das credenciais no Firestore
 */
export function subscribeSinterConfig(callback: (config: SinterConfig) => void): () => void {
  const docRef = doc(db, CONFIG_DOC_PATH[0], CONFIG_DOC_PATH[1]);
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as SinterConfig);
    } else {
      callback(DEFAULT_ILHEUS_CONFIG);
    }
  }, (err) => {
    console.warn('Erro no listener do Firestore:', err);
    callback(DEFAULT_ILHEUS_CONFIG);
  });
}
