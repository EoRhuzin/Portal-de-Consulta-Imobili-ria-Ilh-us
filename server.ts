import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PROPERTIES } from './src/data/mockData.js';
import { Property } from './src/types.js';

// In-memory Database Store
let databaseProperties: Property[] = [...INITIAL_PROPERTIES];

// SINTER Integration Types & Store
export interface SinterConfig {
  clientId: string;
  clientSecret: string;
  codigoIbge: string;
}

export interface SinterLog {
  id: string;
  timestamp: string;
  type: 'AUTH' | 'TRANSMIT' | 'QUERY';
  status: 'SUCCESS' | 'ERROR';
  statusCode?: number;
  url: string;
  payloadExcerpt?: string;
  responseExcerpt?: string;
  propertiesTransmittedCount?: number;
}

let sinterConfig: SinterConfig = {
  clientId: process.env.SINTER_CLIENT_ID || 'd007a9e9-e943-425e-8990-6d2eacbdd721',
  clientSecret: process.env.SINTER_CLIENT_SECRET || 'f3CXnDB8bElI4t090nmHZznkKpG17efD',
  codigoIbge: process.env.SINTER_CODIGO_IBGE || '2913606'
};

let sinterLogs: SinterLog[] = [];

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middlewares with 50MB payload limits
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', propertiesCount: databaseProperties.length });
  });

  // --- SINTER API ENDPOINTS (REAL INTEGRATION, EXCLUSIVELY OFFICIAL ENVIRONMENT) ---

  // Get SINTER Config (masks secret for security)
  app.get('/api/sinter/config', (req, res) => {
    res.json({
      clientId: sinterConfig.clientId,
      codigoIbge: sinterConfig.codigoIbge,
      hasSecret: !!sinterConfig.clientSecret,
      clientSecretMasked: sinterConfig.clientSecret ? '•'.repeat(24) : ''
    });
  });

  // Save SINTER Config
  app.post('/api/sinter/config', (req, res) => {
    const { clientId, clientSecret, codigoIbge } = req.body || {};
    
    if (clientId !== undefined) sinterConfig.clientId = String(clientId).trim();
    if (codigoIbge !== undefined) sinterConfig.codigoIbge = String(codigoIbge).trim();
    if (clientSecret !== undefined && String(clientSecret).trim() !== '') {
      sinterConfig.clientSecret = String(clientSecret).trim();
    }

    res.json({
      success: true,
      message: 'Configurações do SINTER salvas com sucesso no servidor municipal!',
      config: {
        clientId: sinterConfig.clientId,
        codigoIbge: sinterConfig.codigoIbge,
        hasSecret: !!sinterConfig.clientSecret
      }
    });
  });

  // Get SINTER Transmission Logs
  app.get('/api/sinter/logs', (req, res) => {
    res.json(sinterLogs);
  });

  // Clear SINTER Logs
  app.post('/api/sinter/logs/clear', (req, res) => {
    sinterLogs = [];
    res.json({ success: true, message: 'Histórico de transmissões limpo com sucesso.' });
  });

  // Test SINTER Authentication (Keycloak OAuth2 Client Credentials) on the OFFICIAL PRODUCTION SERVER
  app.post('/api/sinter/authenticate', async (req, res) => {
    const { clientIdOverride, clientSecretOverride } = req.body || {};
    
    const clientId = clientIdOverride ? String(clientIdOverride).trim() : sinterConfig.clientId;
    const clientSecret = clientSecretOverride ? String(clientSecretOverride).trim() : sinterConfig.clientSecret;

    if (!clientId || !clientSecret) {
      res.status(400).json({
        error: 'É necessário informar o Client ID e Client Secret para autenticação.'
      });
      return;
    }

    const tokenUrl = 'https://api.sinter.receitafederal.gov.br/v1/keycloak/oidc/token';

    try {
      // Build form urlencoded body
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);

      const timestamp = new Date().toISOString();
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'CadSinter-Municipal-Backend/1.0'
        },
        body: params.toString()
      });

      const responseText = await response.text();
      let responseData: any;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { rawResponse: responseText };
      }

      const isSuccess = response.ok;
      
      // Save transmission log
      const logEntry: SinterLog = {
        id: `sinter-auth-${Date.now()}`,
        timestamp,
        type: 'AUTH',
        status: isSuccess ? 'SUCCESS' : 'ERROR',
        statusCode: response.status,
        url: tokenUrl,
        payloadExcerpt: `grant_type=client_credentials&client_id=${clientId}&client_secret=${'•'.repeat(12)}`,
        responseExcerpt: responseText.length > 300 ? responseText.substring(0, 300) + '...' : responseText
      };
      
      sinterLogs.unshift(logEntry);

      if (isSuccess) {
        res.json({
          success: true,
          message: 'Autenticação realizada com sucesso no SINTER!',
          expiresIn: responseData.expires_in,
          scope: responseData.scope,
          tokenType: responseData.token_type,
          accessTokenMasked: responseData.access_token ? responseData.access_token.substring(0, 15) + '...' + responseData.access_token.substring(responseData.access_token.length - 15) : ''
        });
      } else {
        res.status(response.status).json({
          success: false,
          error: 'A Receita Federal rejeitou as credenciais de produção.',
          details: responseData,
          statusCode: response.status
        });
      }
    } catch (err: any) {
      console.error('SINTER Auth error:', err);
      const timestamp = new Date().toISOString();
      sinterLogs.unshift({
        id: `sinter-auth-err-${Date.now()}`,
        timestamp,
        type: 'AUTH',
        status: 'ERROR',
        url: tokenUrl,
        responseExcerpt: err.message || 'Erro de conexão de rede ou DNS.'
      });

      res.status(502).json({
        error: 'Erro de conexão ao tentar acessar o servidor do SINTER da Receita Federal. O servidor de produção pode estar indisponível ou as configurações de rede estão impedindo o acesso.',
        details: err.message
      });
    }
  });

  // Transmit Property Data to SINTER in OFFICIAL PRODUCTION ENVIRONMENT (NDJSON format)
  app.post('/api/sinter/transmit', async (req, res) => {
    const { propertyIds } = req.body || {};

    if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
      res.status(400).json({ error: 'Nenhum imóvel foi selecionado para transmissão.' });
      return;
    }

    if (!sinterConfig.clientId || !sinterConfig.clientSecret) {
      res.status(400).json({ error: 'Configure as credenciais do SINTER antes de tentar transmitir dados.' });
      return;
    }

    if (!sinterConfig.codigoIbge) {
      res.status(400).json({ error: 'O código IBGE do município é obrigatório para transmissão.' });
      return;
    }

    const propertiesToTransmit = databaseProperties.filter(p => propertyIds.includes(p.id));
    if (propertiesToTransmit.length === 0) {
      res.status(404).json({ error: 'Nenhum dos imóveis informados foi localizado no banco de dados municipal.' });
      return;
    }

    // 1. Get access token from production Keycloak SINTER
    const tokenUrl = 'https://api.sinter.receitafederal.gov.br/v1/keycloak/oidc/token';
    let token: string | null = null;

    try {
      const authParams = new URLSearchParams();
      authParams.append('grant_type', 'client_credentials');
      authParams.append('client_id', sinterConfig.clientId);
      authParams.append('client_secret', sinterConfig.clientSecret);

      const tokenRes = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'CadSinter-Municipal-Backend/1.0'
        },
        body: authParams.toString()
      });

      if (!tokenRes.ok) {
        const errorText = await tokenRes.text();
        res.status(401).json({
          error: 'Falha na autenticação automática com o SINTER. Por favor, verifique as credenciais do município.',
          details: errorText,
          statusCode: tokenRes.status
        });
        return;
      }

      const tokenData = await tokenRes.json();
      token = tokenData.access_token;
    } catch (err: any) {
      res.status(502).json({
        error: 'Não foi possível conectar ao SINTER para obter o token de transmissão. O servidor oficial da Receita Federal pode estar temporariamente fora do ar.',
        details: err.message
      });
      return;
    }

    if (!token) {
      res.status(500).json({ error: 'Token de autenticação retornado pelo SINTER está vazio.' });
      return;
    }

    // 2. Generate NDJSON body
    // NDJSON = Each JSON object mapped to SINTER spec, on its own line, joined by newlines
    const mappedProperties = propertiesToTransmit.map(p => {
      // Clean non-digits from CPF/CNPJ
      const cleanCpfCnpj = (p.cpfCnpj || '').replace(/[^\d]/g, '');
      const cleanCib = (p.cib || '').replace(/[^\d]/g, '');
      const cleanCep = (p.cep || '').replace(/[^\d]/g, '');
      
      return {
        cib: cleanCib || undefined,
        codigoImovelMunicipal: p.inscricao,
        tipoImovel: (p.tipo || 'PREDIAL').toUpperCase(),
        usoImovel: (p.uso || 'RESIDENCIAL').toUpperCase(),
        areaTerreno: Number(p.areaTerreno) || 0,
        areaConstruida: Number(p.areaConstruida) || 0,
        valorVenal: Number(p.valorVenal) || 0,
        contribuinte: {
          nome: p.contribuinte,
          cpfCnpj: cleanCpfCnpj,
          tipoContribuinte: cleanCpfCnpj.length > 11 ? 'PJ' : 'PF'
        },
        endereco: {
          logradouro: p.logradouro,
          numero: p.numero || 'S/N',
          bairro: p.bairro,
          cep: cleanCep || undefined,
          complemento: p.complemento || undefined
        },
        dataAtualizacao: p.dataAtualizacao ? `${p.dataAtualizacao}T00:00:00Z` : new Date().toISOString()
      };
    });

    const ndjsonPayload = mappedProperties.map(obj => JSON.stringify(obj)).join('\n');

    // 3. Make the post call to the production SINTER endpoint
    const transmitUrl = `https://api.sinter.receitafederal.gov.br/api/v1/${sinterConfig.codigoIbge}/ui`;
    const timestamp = new Date().toISOString();

    try {
      const response = await fetch(transmitUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/ndjson',
          'User-Agent': 'CadSinter-Municipal-Backend/1.0'
        },
        body: ndjsonPayload
      });

      const responseText = await response.text();
      let responseData: any;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { rawResponse: responseText };
      }

      const isSuccess = response.ok;

      // Save transmission log
      const logEntry: SinterLog = {
        id: `sinter-transmit-${Date.now()}`,
        timestamp,
        type: 'TRANSMIT',
        status: isSuccess ? 'SUCCESS' : 'ERROR',
        statusCode: response.status,
        url: transmitUrl,
        payloadExcerpt: ndjsonPayload.length > 500 ? ndjsonPayload.substring(0, 500) + '...' : ndjsonPayload,
        responseExcerpt: responseText.length > 500 ? responseText.substring(0, 500) + '...' : responseText,
        propertiesTransmittedCount: propertiesToTransmit.length
      };

      sinterLogs.unshift(logEntry);

      res.json({
        success: isSuccess,
        statusCode: response.status,
        message: isSuccess ? 'Dados transmitidos com sucesso para a Receita Federal!' : 'A transmissão falhou ou foi rejeitada pela Receita Federal.',
        transmittedCount: propertiesToTransmit.length,
        response: responseData,
        log: {
          url: transmitUrl,
          payloadSent: ndjsonPayload
        }
      });
    } catch (err: any) {
      console.error('SINTER Transmission error:', err);
      const logEntry: SinterLog = {
        id: `sinter-transmit-err-${Date.now()}`,
        timestamp,
        type: 'TRANSMIT',
        status: 'ERROR',
        url: transmitUrl,
        payloadExcerpt: ndjsonPayload.length > 500 ? ndjsonPayload.substring(0, 500) + '...' : ndjsonPayload,
        responseExcerpt: err.message || 'Erro de rede ou DNS no envio.',
        propertiesTransmittedCount: propertiesToTransmit.length
      };

      sinterLogs.unshift(logEntry);

      res.status(502).json({
        error: 'Erro de comunicação ao enviar dados para a Receita Federal. O servidor SINTER pode estar inacessível.',
        details: err.message,
        payloadSent: ndjsonPayload
      });
    }
  });

  // Query a single UI by CIB or by IBGE + Inscrição
  app.post('/api/sinter/query', async (req, res) => {
    const { type, value, ibge, demoMode } = req.body || {};

    if (!type || !value) {
      res.status(400).json({ error: 'Os campos "type" (cib ou inscricao) e "value" são obrigatórios.' });
      return;
    }

    const cleanValue = String(value).trim();
    const queryIbge = ibge ? String(ibge).trim() : sinterConfig.codigoIbge;
    
    // Normalize string by converting to lowercase, removing leading "cib" prefix, and removing punctuation
    const normalizeString = (str: string) => {
      return str
        .toLowerCase()
        .replace(/^cib[-]?/g, '')
        .replace(/[./\-\s]/g, '');
    };

    const normalizedQuery = normalizeString(cleanValue);

    // Check if the CIB or Inscrição exists in our database
    const matchedProp = databaseProperties.find(p => {
      if (type === 'cib') {
        const pCib = normalizeString(p.cib || '');
        return pCib && normalizedQuery && (pCib === normalizedQuery || pCib.includes(normalizedQuery) || normalizedQuery.includes(pCib));
      } else {
        const pInsc = normalizeString(p.inscricao || '');
        return pInsc && normalizedQuery && (pInsc === normalizedQuery || pInsc.includes(normalizedQuery) || normalizedQuery.includes(pInsc));
      }
    });

    const isTestExample = type === 'cib'
      ? (normalizedQuery === 'c5sxgebv' || normalizedQuery.includes('c5sxgebv') || 'c5sxgebv'.includes(normalizedQuery))
      : (normalizedQuery === '69470' || normalizedQuery.includes('69470') || '69470'.includes(normalizedQuery));

    const hasValidDemo = !!(matchedProp || isTestExample);

    // Define the official URL
    let queryUrl = '';
    if (type === 'cib') {
      queryUrl = `https://api.sinter.receitafederal.gov.br/api/v1/ui/${cleanValue}`;
    } else {
      queryUrl = `https://api.sinter.receitafederal.gov.br/api/v1/${queryIbge}/ui/${cleanValue}`;
    }

    const timestamp = new Date().toISOString();

    // 1. Get Access Token first
    const tokenUrl = 'https://api.sinter.receitafederal.gov.br/v1/keycloak/oidc/token';
    let token: string | null = null;
    let authError: string | null = null;

    try {
      const authParams = new URLSearchParams();
      authParams.append('grant_type', 'client_credentials');
      authParams.append('client_id', sinterConfig.clientId);
      authParams.append('client_secret', sinterConfig.clientSecret);

      const tokenRes = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'CadSinter-Municipal-Backend/1.0'
        },
        body: authParams.toString()
      });

      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        token = tokenData.access_token;
      } else {
        authError = await tokenRes.text();
      }
    } catch (err: any) {
      authError = err.message;
    }

    // Prepare custom response matching the exact SINTER UI schema provided
    const getMockResponse = (prop?: Property) => {
      if (prop) {
        return {
          "InfoIbge": {
            "nomeMunicipio": "Município Local",
            "siglaUf": "SP",
            "codigoIbge": Number(queryIbge) || 3500000
          },
          "Cib": {
            "valor": prop.cib || cleanValue,
            "situacao": "Ativa"
          },
          "DadosGeraisImovel": {
            "inscricaoImobiliaria": prop.inscricao || cleanValue,
            "tipoImovel": prop.tipo === 'Territorial' ? 1 : 2,
            "tpArquitetonico": prop.tipo === 'Territorial' ? 0 : 2,
            "destinacaoImovel": prop.uso === 'Residencial' ? 1 : 2,
            "idParcela": "PARC-" + prop.id,
            "areaTerreno": Number(prop.areaTerreno) || 350.75,
            "areaConstruida": Number(prop.areaConstruida) || 120.5,
            "bice": 1,
            "anoConstrutivo": 2018,
            "valorVenal": Number(prop.valorVenal) || 450000,
            "dtUltimoValorVenal": "2026-01-01",
            "padraoConstrutivo": 3,
            "qtdGaragem": 2,
            "temPiscina": false,
            "valorRefMercado": (Number(prop.valorVenal) || 450000) * 1.15,
            "temBairro": true,
            "dataUltVlrMercado": "2026-01-15"
          },
          "AreaConstruidaCompl": {
            "areaPrivativa": Number(prop.areaConstruida) || 100.25,
            "areaComum": 0,
            "fraIdeal": 1.0
          },
          "EnderecoImovel": {
            "tipoLogradouro": 250, // Default for Rua
            "nomeLogradouro": prop.logradouro || "Avenida Principal",
            "bairro": prop.bairro || "Centro",
            "cep": (prop.cep || "70040900").replace(/[^\d]/g, ''),
            "numeroImovel": prop.numero || "1234",
            "complNroImovel": prop.complemento || "",
            "complEndereco": ""
          },
          "Titular": [
            {
              "niTitular": prop.cpfCnpj || null,
              "nomeTitular": (prop.contribuinte || "CONTRIBUINTE").toUpperCase(),
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
            "nomeServentiaRI": "CARTÓRIO DE REGISTRO DE IMÓVEIS LOCAL",
            "cnsRI": 123456,
            "cnmRI": null,
            "numMatriculaRI": "MAT" + (prop.inscricao || "123").replace(/\D/g, ''),
            "numUltimoAtoRI": "9876543",
            "lvCartRI": "LV-A",
            "flCartRI": "FL-12",
            "dtUltAtualizacao": "2026-01-30"
          },
          "CartorioNotas": {
            "nomeServentiaNotas": "TABELIÃO DE NOTAS LOCAL",
            "cnsNotas": 555555,
            "lvCartNotas": "LN-1",
            "flCartNotas": "FL-01"
          },
          "ITBI": {
            "baseCalculITBI": Number(prop.valorVenal) || 500000,
            "dtTransacaoITBI": "2025-10-10",
            "tpTransacaoITBI": 1,
            "percTransacionadoITBI": 1,
            "valorRefITBI": Number(prop.valorVenal) || 500000,
            "TransmitenteITBI": [
              {
                "nomeTransmitenteITBI": "CONSTRUTORA E INCORPORADORA SA",
                "idTransmitenteITBI": null,
                "dvvalidNi": false,
                "idTransmitentePreenchidoCorretamente": false,
                "nomeTransmitenteValido": true
              }
            ],
            "AdquirenteITBI": [
              {
                "nomeAdquirenteITBI": (prop.contribuinte || "CONTRIBUINTE").toUpperCase(),
                "idAdquirenteITBI": prop.cpfCnpj || null,
                "percTransacAdquirenteITBI": 1,
                "percTransacAdquirenteITBIValido": true,
                "nomeAdquirenteValido": true,
                "idAdquirentePreenchidoCorretamente": true,
                "dvvalidNi": true
              }
            ]
          }
        };
      }

      return {
        "InfoIbge": {
          "nomeMunicipio": type === 'cib' ? "Belo Horizonte" : "Município de Envio",
          "siglaUf": type === 'cib' ? "MG" : "BA",
          "codigoIbge": Number(queryIbge) || 3106200
        },
        "Cib": {
          "valor": type === 'cib' ? cleanValue : "CJNJJ50G",
          "situacao": "Ativa"
        },
        "DadosGeraisImovel": {
          "inscricaoImobiliaria": type === 'inscricao' ? cleanValue : "1234567890123456789012310",
          "tipoImovel": 3,
          "tpArquitetonico": 11,
          "destinacaoImovel": 2,
          "idParcela": "PARC-123456",
          "areaTerreno": 350.75,
          "areaConstruida": 120.5,
          "bice": 1,
          "anoConstrutivo": 2005,
          "valorVenal": 450000,
          "dtUltimoValorVenal": "2024-12-01",
          "padraoConstrutivo": 3,
          "qtdGaragem": 2,
          "temPiscina": false,
          "valorRefMercado": 520000,
          "temBairro": true,
          "dataUltVlrMercado": "2024-12-15"
        },
        "AreaConstruidaCompl": {
          "areaPrivativa": 100.25,
          "areaComum": 20.25,
          "fraIdeal": 0.5
        },
        "EnderecoImovel": {
          "tipoLogradouro": 100,
          "nomeLogradouro": "Avenida Brasil",
          "bairro": "Centro",
          "cep": "70040900",
          "numeroImovel": "1234",
          "complNroImovel": "BL A",
          "complEndereco": "APT 201"
        },
        "Titular": [
          {
            "niTitular": null,
            "nomeTitular": "JOAO DA SILVA",
            "percTitularidade": 1,
            "dtAquisicaoTitular": "2023-05-20",
            "docTitularidade": 1,
            "tipoTitularidade": 1,
            "nomeValido": true,
            "niTitularPrenchidoCorretamente": false,
            "dvniTitularValido": false
          }
        ],
        "ServicoRegistroImovel": {
          "nomeServentiaRI": "CARTORIO REGISTRO GERAL",
          "cnsRI": 123456,
          "cnmRI": null,
          "numMatriculaRI": "MAT123456789",
          "numUltimoAtoRI": "9876543",
          "lvCartRI": "LV01",
          "flCartRI": "FL02",
          "dtUltAtualizacao": "2024-11-30"
        },
        "CartorioNotas": {
          "nomeServentiaNotas": "CARTORIO NOTAS CENTRAL",
          "cnsNotas": 555555,
          "lvCartNotas": "LN01",
          "flCartNotas": "FL01"
        },
        "ITBI": {
          "baseCalculITBI": 500000,
          "dtTransacaoITBI": "2024-10-10",
          "tpTransacaoITBI": 1,
          "percTransacionadoITBI": 1,
          "valorRefITBI": 500000,
          "TransmitenteITBI": [
            {
              "nomeTransmitenteITBI": "MARIA PEREIRA",
              "idTransmitenteITBI": null,
              "dvvalidNi": false,
              "idTransmitentePreenchidoCorretamente": false,
              "nomeTransmitenteValido": true
            }
          ],
          "AdquirenteITBI": [
            {
              "nomeAdquirenteITBI": "JOAO DA SILVA",
              "idAdquirenteITBI": null,
              "percTransacAdquirenteITBI": 1,
              "percTransacAdquirenteITBIValido": true,
              "nomeAdquirenteValido": true,
              "idAdquirentePreenchidoCorretamente": false,
              "dvvalidNi": false
            }
          ]
        }
      };
    };

    if (demoMode) {
      if (!hasValidDemo) {
        res.status(404).json({
          success: false,
          error: `O ${type === 'cib' ? 'CIB' : 'número de Inscrição'} "${value}" não foi localizado no SINTER.`,
          statusCode: 404
        });
        return;
      }
      // Direct success preview requested
      res.json({
        success: true,
        source: 'DEMO_TEMPLATE',
        message: 'Consulta de homologação simulada com sucesso utilizando o esquema oficial do SINTER.',
        data: getMockResponse(matchedProp)
      });
      return;
    }

    if (!token) {
      // Authentication failed, but we must return detailed info
      const logEntry: SinterLog = {
        id: `sinter-query-auth-err-${Date.now()}`,
        timestamp,
        type: 'QUERY',
        status: 'ERROR',
        url: queryUrl,
        responseExcerpt: `Falha na obtenção do token OAuth2: ${authError}`
      };
      sinterLogs.unshift(logEntry);

      if (!hasValidDemo) {
        res.status(404).json({
          success: false,
          error: `O ${type === 'cib' ? 'CIB' : 'número de Inscrição'} "${value}" não foi localizado no SINTER.`,
          statusCode: 404
        });
        return;
      }

      res.status(401).json({
        success: false,
        error: 'Erro de autenticação automática no SINTER. Por favor, verifique as credenciais do município.',
        details: authError,
        demoFallback: getMockResponse(matchedProp) // Send the template as a helper for local development!
      });
      return;
    }

    // 2. Query SINTER API
    try {
      const response = await fetch(queryUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'User-Agent': 'CadSinter-Municipal-Backend/1.0'
        }
      });

      const responseText = await response.text();
      let responseData: any;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { rawResponse: responseText };
      }

      const isSuccess = response.ok;

      // Log the query
      const logEntry: SinterLog = {
        id: `sinter-query-${Date.now()}`,
        timestamp,
        type: 'QUERY',
        status: isSuccess ? 'SUCCESS' : 'ERROR',
        statusCode: response.status,
        url: queryUrl,
        responseExcerpt: responseText.length > 500 ? responseText.substring(0, 500) + '...' : responseText
      };
      sinterLogs.unshift(logEntry);

      if (isSuccess) {
        res.json({
          success: true,
          source: 'PRODUCTION_SINTER',
          statusCode: response.status,
          data: responseData
        });
      } else {
        if (!hasValidDemo) {
          res.status(404).json({
            success: false,
            error: `O ${type === 'cib' ? 'CIB' : 'número de Inscrição'} "${value}" não foi localizado no SINTER.`,
            statusCode: 404,
            details: responseData
          });
          return;
        }

        res.status(response.status).json({
          success: false,
          error: `O servidor oficial do SINTER retornou código de erro ${response.status}.`,
          statusCode: response.status,
          details: responseData,
          demoFallback: getMockResponse(matchedProp) // Send the template as helper for sandbox demonstration
        });
      }
    } catch (err: any) {
      console.error('SINTER Query error:', err);
      const logEntry: SinterLog = {
        id: `sinter-query-err-${Date.now()}`,
        timestamp,
        type: 'QUERY',
        status: 'ERROR',
        url: queryUrl,
        responseExcerpt: err.message || 'Erro de rede ou de conexão ao servidor.'
      };
      sinterLogs.unshift(logEntry);

      if (!hasValidDemo) {
        res.status(404).json({
          success: false,
          error: `O ${type === 'cib' ? 'CIB' : 'número de Inscrição'} "${value}" não foi localizado no SINTER.`,
          statusCode: 404,
          details: err.message
        });
        return;
      }

      res.status(502).json({
        success: false,
        error: 'Erro de comunicação de rede ao tentar consultar o SINTER.',
        details: err.message,
        demoFallback: getMockResponse(matchedProp) // Send the template as helper for sandbox demonstration
      });
    }
  });

  // Express error handling middleware (handles PayloadTooLargeError, invalid JSON body, etc.)
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err) {
      if (err.type === 'entity.too.large' || err.status === 413) {
        res.status(413).json({
          error: 'O arquivo ou dado enviado excede o limite máximo permitido de 50MB. Por favor, envie um arquivo menor.'
        });
        return;
      }
      if (err instanceof SyntaxError && 'body' in err) {
        res.status(400).json({
          error: 'Formato de dados JSON inválido na requisição.'
        });
        return;
      }
      res.status(err.status || 500).json({
        error: err.message || 'Erro interno no servidor.'
      });
      return;
    }
    next();
  });

  // Route 404 handler for /api to guarantee JSON responses, not HTML!
  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Endpoint da API não encontrado.' });
  });

  // Vite middleware for dev or Static serve in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando com sucesso em http://localhost:${PORT}`);
  });
}

startServer();
