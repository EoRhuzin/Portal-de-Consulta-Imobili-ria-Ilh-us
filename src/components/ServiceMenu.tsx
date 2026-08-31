import React from 'react';
import { 
  Search, 
  ArrowRight,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { QueryResultDisplay } from './SinterQueryResult';
import { subscribeSinterConfig, SinterConfig, DEFAULT_ILHEUS_CONFIG } from '../lib/firebase';

interface FormattedUserError {
  title: string;
  message: string;
  type: 'not_found' | 'auth' | 'unavailable' | 'invalid_input' | 'general';
  suggestions?: string[];
}

function formatUserError(
  searchType: 'cib' | 'inscricao',
  val: string,
  statusCode?: number,
  rawError?: string
): FormattedUserError {
  const cleanVal = val.trim();
  const label = searchType === 'cib' ? 'o Código CIB' : 'a Inscrição Imobiliária';

  if (
    statusCode === 404 ||
    (rawError && (
      rawError.includes('404') ||
      rawError.toLowerCase().includes('não localizado') ||
      rawError.toLowerCase().includes('não foi localizado') ||
      rawError.toLowerCase().includes('not found')
    ))
  ) {
    return {
      type: 'not_found',
      title: 'Imóvel Não Localizado no Cadastro Oficial',
      message: `Não foi localizado nenhum imóvel cadastrado sob ${label} "${cleanVal}" na base de dados do SINTER / Receita Federal.`,
      suggestions: [
        `Verifique se ${label} foi digitado corretamente.`,
        'Em caso de edificações novas ou desmembramentos recentes, a homologação no cadastro da Receita Federal pode estar em andamento.',
        'Se necessitar de orientação sobre o cadastro municipal de Ilhéus, consulte a Secretaria de Tributos.'
      ]
    };
  }

  if (
    statusCode === 401 ||
    (rawError && (
      rawError.includes('401') ||
      rawError.toLowerCase().includes('autenticação') ||
      rawError.toLowerCase().includes('credenciais')
    ))
  ) {
    return {
      type: 'auth',
      title: 'Serviço Temporariamente Indisponível',
      message: 'Não foi possível autenticar a conexão com a base de dados oficial no momento.',
      suggestions: [
        'A conexão de integração segura está em processo de verificação.',
        'Por favor, tente realizar a consulta novamente em alguns minutos.'
      ]
    };
  }

  if (statusCode === 400) {
    return {
      type: 'invalid_input',
      title: 'Preenchimento Necessário',
      message: `Por favor, informe ${label} válido no campo de busca.`,
      suggestions: [
        'Certifique-se de preencher o campo antes de clicar em Consultar.'
      ]
    };
  }

  return {
    type: 'unavailable',
    title: 'Instabilidade Temporária no SINTER',
    message: 'O sistema oficial da Receita Federal (SINTER) não respondeu ao pedido de consulta no momento.',
    suggestions: [
      'Por favor, aguarde alguns minutos e tente realizar a busca novamente.',
      'Se a instabilidade persistir, consulte novamente em outro horário.'
    ]
  };
}

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
  const [queryError, setQueryError] = React.useState<FormattedUserError | null>(null);

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
        error: 'Credenciais de integração não configuradas.'
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
        error: 'Falha na autenticação com os servidores oficiais.'
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
        try { lastDetail = JSON.parse(text); } catch { lastDetail = null; }

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
          ? `Imóvel não localizado`
          : `Erro de comunicação com o servidor`
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
        const formatted = formatUserError(type, val, result?.statusCode || status || 500, result?.error);
        setQueryError(formatted);
      }
    } catch (err: any) {
      const formatted = formatUserError(type, val, 500, err?.message);
      setQueryError(formatted);
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
                placeholder={searchType === 'cib' ? "Informe o Código CIB (ex: C5SXGEBV)" : "Informe a Inscrição Imobiliária (ex: 69461)"}
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
                setSearchValue('C5SXGEBV');
                handleQuerySinter('cib', 'C5SXGEBV');
              }}
              className="bg-[#3D3D3D] hover:bg-[#00509D] hover:text-white border border-[#4D4D4D] px-2.5 py-1 rounded transition-colors font-mono cursor-pointer shadow-xs"
            >
              CIB: C5SXGEBV
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
          <RefreshCw className="w-8 h-8 text-[#00509D] animate-spin" />
          <div className="text-center space-y-1">
            <h4 className="font-bold text-slate-800 text-sm">Consultando Base Oficial SINTER...</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">Conectando aos servidores da Receita Federal do Brasil para consultar o cadastro do imóvel...</p>
          </div>
        </div>
      )}

      {/* SINTER Friendly Citizen Query Errors */}
      {queryError && (
        <div className={`rounded-xl p-6 sm:p-7 shadow-sm border transition-all ${
          queryError.type === 'not_found'
            ? 'bg-amber-50/90 border-amber-200/90 text-amber-950'
            : queryError.type === 'invalid_input'
            ? 'bg-blue-50/90 border-blue-200/90 text-blue-950'
            : 'bg-rose-50/90 border-rose-200/90 text-rose-950'
        }`}>
          <div className="flex items-start space-x-3.5">
            <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
              queryError.type === 'not_found'
                ? 'bg-amber-100 text-amber-700'
                : queryError.type === 'invalid_input'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-rose-100 text-rose-700'
            }`}>
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <h4 className="font-bold text-base text-slate-900">
                  {queryError.title}
                </h4>
                <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                  {queryError.message}
                </p>
              </div>

              {queryError.suggestions && queryError.suggestions.length > 0 && (
                <div className="pt-3 border-t border-slate-200/80">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Orientação ao Cidadão / Usuário:
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {queryError.suggestions.map((sug, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-amber-600 font-bold shrink-0">•</span>
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
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
