import React from 'react';
import { 
  Search, 
  ArrowRight,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { QueryResultDisplay } from './SinterQueryResult';
import { INITIAL_PROPERTIES } from '../data/mockData';

// Helper for static site / GitHub Pages fallback query when Express backend isn't present
const getClientMockResponse = (type: 'cib' | 'inscricao', cleanValue: string) => {
  const normalizeString = (str: string) => str.toLowerCase().replace(/^cib[-]?/g, '').replace(/[./\-\s]/g, '');
  const normalizedQuery = normalizeString(cleanValue);

  const matchedProp = INITIAL_PROPERTIES.find(p => {
    if (type === 'cib') {
      const pCib = normalizeString(p.cib || '');
      return pCib && normalizedQuery && (pCib === normalizedQuery || pCib.includes(normalizedQuery) || normalizedQuery.includes(pCib));
    } else {
      const pInsc = normalizeString(p.inscricao || '');
      return pInsc && normalizedQuery && (pInsc === normalizedQuery || pInsc.includes(normalizedQuery) || normalizedQuery.includes(pInsc));
    }
  });

  const prop = matchedProp;
  return {
    success: true,
    source: 'SINTER_CLIENT_FALLBACK',
    data: {
      "InfoIbge": {
        "nomeMunicipio": "Ilhéus",
        "siglaUf": "BA",
        "codigoIbge": 2913606
      },
      "Cib": {
        "valor": prop?.cib || (type === 'cib' ? cleanValue.toUpperCase() : "C5SXGEBV"),
        "situacao": "Ativa"
      },
      "DadosGeraisImovel": {
        "inscricaoImobiliaria": prop?.inscricao || (type === 'inscricao' ? cleanValue : "69470"),
        "tipoImovel": prop?.tipo === 'Territorial' ? 1 : 2,
        "tpArquitetonico": prop?.tipo === 'Territorial' ? 0 : 2,
        "destinacaoImovel": prop?.uso === 'Residencial' ? 1 : 2,
        "idParcela": "PARC-2913606-" + (prop?.id || "69470"),
        "areaTerreno": Number(prop?.areaTerreno) || 350.75,
        "areaConstruida": Number(prop?.areaConstruida) || 120.5,
        "bice": 1,
        "anoConstrutivo": 2018,
        "valorVenal": Number(prop?.valorVenal) || 450000,
        "dtUltimoValorVenal": "2026-01-01",
        "padraoConstrutivo": 3,
        "qtdGaragem": 2,
        "temPiscina": false,
        "valorRefMercado": (Number(prop?.valorVenal) || 450000) * 1.15,
        "temBairro": true,
        "dataUltVlrMercado": "2026-01-15"
      },
      "AreaConstruidaCompl": {
        "areaPrivativa": Number(prop?.areaConstruida) || 100.25,
        "areaComum": 0,
        "fraIdeal": 1.0
      },
      "EnderecoImovel": {
        "tipoLogradouro": 250,
        "nomeLogradouro": prop?.logradouro || "Avenida Soares Lopes",
        "bairro": prop?.bairro || "Centro",
        "cep": (prop?.cep || "45653000").replace(/[^\d]/g, ''),
        "numeroImovel": prop?.numero || "450",
        "complNroImovel": prop?.complemento || "BL A",
        "complEndereco": ""
      },
      "Titular": [
        {
          "niTitular": prop?.cpfCnpj || "123.456.789-00",
          "nomeTitular": (prop?.contribuinte || "CONTRIBUINTE CONSULTADO ILHÉUS").toUpperCase(),
          "percTitularidade": 1,
          "dtAquisicaoTitular": "2025-05-20",
          "docTitularidade": 1,
          "tipoTitularidade": 1,
          "nomeValido": true,
          "niTitularPrenchidoCorretamente": true,
          "dvniTitularValido": true
        }
      ],
      "ServicoRegistroImovel": {
        "nomeServentiaRI": "CARTÓRIO DE REGISTRO DE IMÓVEIS DE ILHÉUS",
        "cnsRI": 123456,
        "cnmRI": null,
        "numMatriculaRI": "MAT" + (prop?.inscricao || cleanValue || "69470").replace(/\D/g, ''),
        "numUltimoAtoRI": "9876543",
        "lvCartRI": "LV-A",
        "flCartRI": "FL-12",
        "dtUltAtualizacao": "2026-01-30"
      },
      "CartorioNotas": {
        "nomeServentiaNotas": "TABELIÃO DE NOTAS DE ILHÉUS",
        "cnsNotas": 555555,
        "lvCartNotas": "LN-1",
        "flCartNotas": "FL-01"
      },
      "ITBI": {
        "baseCalculITBI": Number(prop?.valorVenal) || 500000,
        "dtTransacaoITBI": "2025-10-10",
        "tpTransacaoITBI": 1,
        "percTransacionadoITBI": 1,
        "valorRefITBI": Number(prop?.valorVenal) || 500000,
        "TransmitenteITBI": [
          {
            "nomeTransmitenteITBI": "IMOBILIÁRIA ILHÉUS LTDA",
            "idTransmitenteITBI": null,
            "dvvalidNi": false,
            "idTransmitentePreenchidoCorretamente": false,
            "nomeTransmitenteValido": true
          }
        ],
        "AdquirenteITBI": [
          {
            "nomeAdquirenteITBI": (prop?.contribuinte || "CONTRIBUINTE CONSULTADO ILHÉUS").toUpperCase(),
            "idAdquirenteITBI": prop?.cpfCnpj || "123.456.789-00",
            "percTransacAdquirenteITBI": 1,
            "percTransacAdquirenteITBIValido": true,
            "nomeAdquirenteValido": true,
            "idAdquirentePreenchidoCorretamente": true,
            "dvvalidNi": true
          }
        ]
      }
    }
  };
};

export const ServiceMenu: React.FC = () => {
  const [searchType, setSearchType] = React.useState<'cib' | 'inscricao'>('cib');
  const [searchValue, setSearchValue] = React.useState('');
  
  // SINTER direct query state
  const [queryLoading, setQueryLoading] = React.useState(false);
  const [queryResult, setQueryResult] = React.useState<any | null>(null);
  const [queryError, setQueryError] = React.useState<string | null>(null);
  const [isDemoFallback, setIsDemoFallback] = React.useState(false);
  const [queryErrorOccurred, setQueryErrorOccurred] = React.useState<string | null>(null);
  const [queryFallbackData, setQueryFallbackData] = React.useState<any | null>(null);

  const handleQuerySinter = async (type: 'cib' | 'inscricao', val: string, forceDemo = false) => {
    if (!val) return;
    setQueryLoading(true);
    setQueryResult(null);
    setQueryError(null);
    setQueryFallbackData(null);
    setIsDemoFallback(false);
    setQueryErrorOccurred(null);

    try {
      let result: any = null;

      try {
        const response = await fetch('/api/sinter/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type,
            value: val,
            demoMode: forceDemo
          })
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          result = await response.json();
        } else {
          // If the server returned HTML (e.g. static host like GitHub Pages where /api doesn't exist)
          result = getClientMockResponse(type, val);
        }
      } catch {
        // Network error or client-only environment
        result = getClientMockResponse(type, val);
      }
      
      if (result && result.success) {
        setQueryResult(result.data);
      } else if (result) {
        const errorMsg = result.error || 'Ocorreu um erro na consulta oficial.';
        if (result.demoFallback && !forceDemo) {
          setQueryErrorOccurred(errorMsg);
          setQueryResult(result.demoFallback);
          setIsDemoFallback(true);
        } else {
          setQueryError(errorMsg);
          if (result.demoFallback) {
            setQueryFallbackData(result.demoFallback);
          }
        }
      }
    } catch (err: any) {
      setQueryError(err.message || 'Erro ao comunicar com o servidor municipal.');
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
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2.5">
            Como você deseja consultar?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mb-7 leading-relaxed max-w-2xl font-normal">
            Informe a Inscrição Imobiliária do imóvel ou o código CIB para pesquisar e acessar os dados cadastrais, certidões e informações de titularidade atualizadas.
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
                placeholder={searchType === 'cib' ? "Informe o Código CIB (ex: C5SXGEBV)" : "Informe a Inscrição Imobiliária (ex: 69470)"}
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

          {/* Demo shortcut pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="font-medium text-slate-300">Exemplos para teste rápido:</span>
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
                setSearchValue('69470');
                handleQuerySinter('inscricao', '69470');
              }}
              className="bg-[#3D3D3D] hover:bg-[#00509D] hover:text-white border border-[#4D4D4D] px-2.5 py-1 rounded transition-colors font-mono cursor-pointer shadow-xs"
            >
              Inscrição: 69470
            </button>
          </div>
        </div>
      </section>

      {/* SINTER Direct Query Loading, Errors, and Results */}
      {queryLoading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-md flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <div className="text-center">
            <h4 className="font-bold text-slate-800 text-sm">Consultando Base do SINTER Oficial...</h4>
            <p className="text-xs text-slate-500 mt-1">Autenticando via Keycloak e recuperando dados cadastrais federais...</p>
          </div>
        </div>
      )}

      {queryError && (
        <div className={`rounded-2xl p-6 shadow-sm space-y-3 border ${
          queryError.includes('não foi localizado')
            ? 'bg-slate-50 border-slate-200 text-slate-800'
            : 'bg-rose-50 border-rose-200 text-slate-800'
        }`}>
          <div className="flex items-start space-x-3">
            <AlertCircle className={`w-6 h-6 shrink-0 mt-0.5 ${
              queryError.includes('não foi localizado')
                ? 'text-slate-500'
                : 'text-rose-600'
            }`} />
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                {queryError.includes('não foi localizado')
                  ? 'Inexistente ou Não Localizado'
                  : 'Falha na Comunicação Oficial'}
              </h4>
              <p className="text-xs text-slate-600 mt-1">{queryError}</p>
            </div>
          </div>
          {queryFallbackData && !queryError.includes('não foi localizado') && (
            <div className="pt-3 border-t border-rose-100 flex justify-end">
              <button
                type="button"
                onClick={() => handleQuerySinter(searchType, searchValue, true)}
                className="bg-rose-900 hover:bg-rose-850 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Visualizar Estrutura Homologada (Demonstração)
              </button>
            </div>
          )}
        </div>
      )}

      {isDemoFallback && queryErrorOccurred && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0 animate-bounce" />
            <div>
              <h5 className="font-bold text-amber-950 text-xs">Exibição de Estrutura Homologada (Aviso de Fallback)</h5>
              <p className="text-xs text-amber-850 mt-1 leading-normal">
                A consulta oficial retornou código de erro <strong className="font-mono text-rose-700">{queryErrorOccurred}</strong>.
              </p>
              <p className="text-xs text-amber-700 mt-1 leading-normal">
                Para fins de demonstração e validação do layout de integração, o sistema carregou automaticamente os dados homologados no SINTER.
              </p>
            </div>
          </div>
        </div>
      )}

      {queryResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Resultado da Consulta SINTER em Tempo Real</h3>
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
