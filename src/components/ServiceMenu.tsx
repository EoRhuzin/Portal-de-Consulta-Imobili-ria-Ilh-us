import React from 'react';
import { 
  Search, 
  ArrowRight,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { QueryResultDisplay } from './SinterQueryResult';
import { subscribeSinterConfig, SinterConfig, DEFAULT_ILHEUS_CONFIG } from '../lib/firebase';

export const ServiceMenu: React.FC = () => {
  const [searchType, setSearchType] = React.useState<'cib' | 'inscricao'>('cib');
  const [searchValue, setSearchValue] = React.useState('');
  
  // Firestore database (consulta-imobiliaria-ilheus) configuration state
  const [dbConfig, setDbConfig] = React.useState<SinterConfig>(DEFAULT_ILHEUS_CONFIG);

  // Always subscribe to real-time changes in Firestore database consulta-imobiliaria-ilheus
  React.useEffect(() => {
    const unsubscribe = subscribeSinterConfig((config) => {
      setDbConfig(config);
    });
    return () => unsubscribe();
  }, []);

  // SINTER direct query state
  const [queryLoading, setQueryLoading] = React.useState(false);
  const [queryResult, setQueryResult] = React.useState<any | null>(null);
  const [queryError, setQueryError] = React.useState<{ error: string; details?: any; statusCode?: number } | null>(null);

  const querySinterDirectClient = async (
    type: 'cib' | 'inscricao',
    cleanValue: string,
    config: SinterConfig
  ) => {
    const { clientId, clientSecret, codigoIbge = '2913606', tokenUrl: customTokenUrl, sinterApiUrl: customApiUrl } = config;

    if (!clientId || !clientSecret) {
      return {
        success: false,
        statusCode: 401,
        error: 'Ambiente estático (GitHub Pages) detectado: Credenciais do SERPRO/SINTER (Client ID e Client Secret) não encontradas nas Configurações.',
        details: 'Para realizar consultas diretamente pelo navegador no GitHub Pages, acesse a aba Configurações e insira o Client ID e Client Secret fornecidos pelo SERPRO.'
      };
    }

    const tokenUrls = [
      customTokenUrl,
      'https://gateway.apivalidacao.serpro.gov.br/token',
      'https://gateway.apiserpro.serpro.gov.br/token',
      'https://api.sinter.receitafederal.gov.br/v1/keycloak/oidc/token'
    ].filter((u, i, arr) => u && arr.indexOf(u) === i);

    let token: string | null = null;
    let lastTokenError = '';

    for (const tUrl of tokenUrls) {
      try {
        const basicAuth = btoa(`${clientId}:${clientSecret}`);
        const resA = await fetch(tUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: 'grant_type=client_credentials'
        });

        if (resA.ok) {
          const data = await resA.json();
          if (data && data.access_token) {
            token = data.access_token;
            break;
          }
        }

        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);

        const resB = await fetch(tUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        });

        if (resB.ok) {
          const data = await resB.json();
          if (data && data.access_token) {
            token = data.access_token;
            break;
          }
        } else {
          lastTokenError = await resB.text();
        }
      } catch (err: any) {
        lastTokenError = err.message;
      }
    }

    if (!token) {
      return {
        success: false,
        statusCode: 401,
        error: 'Falha na autenticação OAuth2 com SERPRO/SINTER via navegador no GitHub Pages.',
        details: lastTokenError || 'Verifique se as credenciais (Client ID / Client Secret) em Configurações estão corretas e ativas no portal SERPRO.'
      };
    }

    const queryIbge = codigoIbge || '2913606';
    const queryUrls: string[] = [];

    if (customApiUrl && customApiUrl.trim()) {
      const base = customApiUrl.trim().replace(/\/$/, '');
      queryUrls.push(type === 'cib' ? `${base}/${encodeURIComponent(cleanValue)}` : `${base}/${encodeURIComponent(queryIbge)}/${encodeURIComponent(cleanValue)}`);
    }

    queryUrls.push(
      type === 'cib'
        ? `https://api.sinter.receitafederal.gov.br/api/v1/ui/${encodeURIComponent(cleanValue)}`
        : `https://api.sinter.receitafederal.gov.br/api/v1/${encodeURIComponent(queryIbge)}/ui/${encodeURIComponent(cleanValue)}`
    );

    queryUrls.push(
      type === 'cib'
        ? `https://api.receitafederal.gov.br/prr-sinter/api/v1/ui/${encodeURIComponent(cleanValue)}`
        : `https://api.receitafederal.gov.br/prr-sinter/api/v1/${encodeURIComponent(queryIbge)}/ui/${encodeURIComponent(cleanValue)}`
    );

    let realData: any = null;
    let lastStatus = 0;
    let lastDetail: any = null;

    for (const qUrl of queryUrls) {
      try {
        const response = await fetch(qUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        lastStatus = response.status;
        const text = await response.text();
        try { lastDetail = JSON.parse(text); } catch { lastDetail = { rawResponse: text }; }

        if (response.ok && lastDetail) {
          realData = lastDetail;
          break;
        }
      } catch (err: any) {
        lastDetail = { error: err.message };
      }
    }

    if (realData) {
      return { success: true, data: realData };
    } else {
      return {
        success: false,
        statusCode: lastStatus || 404,
        error: lastStatus === 404
          ? `Imóvel (${type === 'cib' ? 'CIB' : 'Inscrição'}) "${cleanValue}" não foi localizado na base oficial do SINTER (HTTP 404).`
          : `A API oficial do SINTER retornou código HTTP ${lastStatus} no GitHub Pages.`,
        details: lastDetail
      };
    }
  };

  const handleQuerySinter = async (type: 'cib' | 'inscricao', val: string) => {
    if (!val) return;
    setQueryLoading(true);
    setQueryResult(null);
    setQueryError(null);

    try {
      let isStaticHosting = false;
      let result: any = null;
      let status = 0;

      try {
        const response = await fetch('/api/sinter/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type,
            value: val.trim(),
            ibge: dbConfig.codigoIbge,
            clientId: dbConfig.clientId,
            clientSecret: dbConfig.clientSecret,
            tokenUrl: dbConfig.tokenUrl,
            sinterApiUrl: dbConfig.sinterApiUrl
          })
        });

        status = response.status;
        const contentType = response.headers.get('content-type');

        if (response.status === 405 || !contentType || !contentType.includes('application/json')) {
          isStaticHosting = true;
        } else {
          result = await response.json();
        }
      } catch (fetchErr) {
        // Network error or static hosting without backend route
        isStaticHosting = true;
      }

      // If on static hosting like GitHub Pages (where /api doesn't exist), run direct client-side query
      if (isStaticHosting) {
        result = await querySinterDirectClient(type, val.trim(), dbConfig);
      }

      if (result && result.success && result.data) {
        setQueryResult(result.data);
      } else {
        setQueryError({
          error: result?.error || `A API do SINTER/SERPRO retornou erro HTTP ${status || result?.statusCode || 500}`,
          details: result?.details,
          statusCode: result?.statusCode || status || 500
        });
      }
    } catch (err: any) {
      setQueryError({
        error: 'Erro na execução da consulta imobiliária.',
        details: err.message
      });
    } finally {
      setQueryLoading(false);
    }
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      handleQuerySinter(searchType, searchValue.trim());
    }
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Banner with Quick Search */}
      <section className="relative overflow-hidden rounded-xl bg-[#2B2B2B] text-white p-6 sm:p-9 shadow-xl border border-[#3D3D3D]">
        {/* Subtle Geometric Background Watermark */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#00509D]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
            Como você deseja consultar?
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm mb-4 leading-relaxed max-w-2xl font-normal">
            Informe a Inscrição Imobiliária do imóvel ou o código CIB para pesquisar e acessar os dados cadastrais, certidões e informações de titularidade atualizadas na API oficial do SINTER/Receita Federal.
          </p>

          {/* SINTER Search Mode Selector */}
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              type="button"
              onClick={() => setSearchType('cib')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                searchType === 'cib'
                  ? 'bg-[#00509D] text-white shadow-sm ring-1 ring-[#00509D]/50'
                  : 'bg-[#3D3D3D] hover:bg-[#484848] text-slate-200 border border-[#525252]'
              }`}
            >
              Consulta por CIB
            </button>
            <button
              type="button"
              onClick={() => setSearchType('inscricao')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                searchType === 'inscricao'
                  ? 'bg-[#00509D] text-white shadow-sm ring-1 ring-[#00509D]/50'
                  : 'bg-[#3D3D3D] hover:bg-[#484848] text-slate-200 border border-[#525252]'
              }`}
            >
              Consulta por Inscrição Imobiliária
            </button>
          </div>

          {/* Direct Quick SINTER Search Form */}
          <form onSubmit={handleQuickSubmit} className="bg-[#1E1E1E]/90 backdrop-blur-md p-2.5 sm:p-3 rounded-lg border border-[#3D3D3D] flex flex-col sm:flex-row gap-2.5 max-w-2xl shadow-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={searchType === 'cib' ? "Informe o Código CIB (ex: CIB-582.750.659-5)" : "Informe a Inscrição Imobiliária (ex: 69461)"}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full bg-[#141414] text-white placeholder-slate-400 text-sm rounded-md pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00509D] border border-[#444444] font-mono shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="bg-[#00509D] hover:bg-[#003F7A] text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-md flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#00509D]/30 whitespace-nowrap cursor-pointer active:scale-[0.99]"
            >
              <span>Consultar no SINTER Oficial</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Shortcut search buttons */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="font-medium text-slate-300">Exemplos de busca:</span>
            <button 
              type="button"
              onClick={() => {
                setSearchType('cib');
                setSearchValue('CIB-582.750.659-5');
                handleQuerySinter('cib', 'CIB-582.750.659-5');
              }}
              className="bg-[#3D3D3D] hover:bg-[#00509D] hover:text-white border border-[#4D4D4D] px-2.5 py-1 rounded transition-colors font-mono cursor-pointer shadow-xs"
            >
              CIB: CIB-582.750.659-5
            </button>
            <button 
              type="button"
              onClick={() => {
                setSearchType('inscricao');
                setSearchValue('69461');
                handleQuerySinter('inscricao', '69461');
              }}
              className="bg-[#3D3D3D] hover:bg-[#00509D] hover:text-white border border-[#4D4D4D] px-2.5 py-1 rounded transition-colors font-mono cursor-pointer shadow-xs"
            >
              Inscrição: 69461
            </button>
          </div>
        </div>
      </section>

      {/* SINTER Direct Query Loading */}
      {queryLoading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-md flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <div className="text-center">
            <h4 className="font-bold text-slate-800 text-sm">Consultando API Oficial do SINTER...</h4>
            <p className="text-xs text-slate-500 mt-1">Conectando aos servidores da Receita Federal com as credenciais cadastradas no banco consulta-imobiliaria-ilheus...</p>
          </div>
        </div>
      )}

      {/* SINTER Direct Query Errors */}
      {queryError && (
        <div className={`rounded-xl p-6 shadow-sm space-y-3 border ${
          queryError.statusCode === 404
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-rose-50 border-rose-200 text-rose-950'
        }`}>
          <div className="flex items-start space-x-3">
            <AlertCircle className={`w-6 h-6 shrink-0 mt-0.5 ${
              queryError.statusCode === 404 ? 'text-amber-600' : 'text-rose-600'
            }`} />
            <div className="space-y-1">
              <h4 className="font-bold text-sm">
                {queryError.statusCode === 404
                  ? 'Imóvel Não Localizado na Base Oficial do SINTER'
                  : queryError.statusCode === 401
                  ? 'Falha de Autenticação no SERPRO / SINTER'
                  : 'Erro na Consulta SINTER Oficial'}
              </h4>
              <p className="text-xs leading-relaxed">{queryError.error}</p>
              {queryError.details && (
                <div className="mt-2 p-3 bg-black/5 rounded-lg border border-black/10 text-[11px] font-mono whitespace-pre-wrap overflow-x-auto">
                  {typeof queryError.details === 'string' ? queryError.details : JSON.stringify(queryError.details, null, 2)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SINTER Direct Query Result */}
      {queryResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Resultado Oficial SINTER</h3>
            <button
              type="button"
              onClick={() => {
                setQueryResult(null);
                setSearchValue('');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
            >
              Limpar Consulta
            </button>
          </div>
          <QueryResultDisplay data={queryResult} />
        </div>
      )}
    </div>
  );
};
