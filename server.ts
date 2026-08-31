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
  clientId: process.env.SINTER_CLIENT_ID || '',
  clientSecret: process.env.SINTER_CLIENT_SECRET || '',
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
    const { 
      type, 
      value, 
      ibge, 
      clientId: bodyClientId, 
      clientSecret: bodyClientSecret, 
      tokenUrl: bodyTokenUrl, 
      sinterApiUrl: bodyApiUrl 
    } = req.body || {};

    if (!type || !value) {
      res.status(400).json({ 
        success: false,
        error: 'Os campos "type" (cib ou inscricao) e "value" são obrigatórios.' 
      });
      return;
    }

    const cleanValue = String(value).trim();
    const queryIbge = ibge ? String(ibge).trim() : (sinterConfig.codigoIbge || '2913606');
    const clientId = bodyClientId || sinterConfig.clientId || process.env.SINTER_CLIENT_ID || '';
    const clientSecret = bodyClientSecret || sinterConfig.clientSecret || process.env.SINTER_CLIENT_SECRET || '';

    // If credentials are missing, return 401 directly without generating fake data
    if (!clientId || !clientSecret) {
      res.status(401).json({
        success: false,
        statusCode: 401,
        error: 'Credenciais do SERPRO/SINTER (Client ID e Client Secret) não estão configuradas.',
        details: 'É necessário cadastrar um Client ID e Client Secret válidos no banco Firestore "consulta-imobiliaria-ilheus" (coleção configuracoes/sinter_ilheus) para consultar a base oficial da Receita Federal.'
      });
      return;
    }

    const timestamp = new Date().toISOString();

    // 1. Obtain OAuth token from official SERPRO/SINTER token endpoints
    const tokenUrlsToTry = [
      bodyTokenUrl,
      'https://gateway.apivalidacao.serpro.gov.br/token',
      'https://gateway.apiserpro.serpro.gov.br/token',
      'https://api.sinter.receitafederal.gov.br/v1/keycloak/oidc/token',
      'https://api.receitafederal.gov.br/prr-sinter/v1/keycloak/oidc/token'
    ].filter((url, index, self) => url && self.indexOf(url) === index);

    let token: string | null = null;
    let lastTokenError = '';

    for (const tokenUrl of tokenUrlsToTry) {
      try {
        // Method A: Basic Auth header
        const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const resA = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'CadSinter-Municipal-Backend/1.0'
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

        // Method B: Body parameters
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);

        const resB = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'CadSinter-Municipal-Backend/1.0'
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
      res.status(401).json({
        success: false,
        statusCode: 401,
        error: 'Falha na autenticação OAuth2 com os servidores do SERPRO / SINTER.',
        details: lastTokenError || 'As credenciais (Client ID / Client Secret) foram recusadas pelo portal do SERPRO/Receita Federal.'
      });
      return;
    }

    // 2. Query official SINTER API
    const queryUrlsToTry: string[] = [];
    if (bodyApiUrl && bodyApiUrl.trim()) {
      const base = bodyApiUrl.trim().replace(/\/$/, '');
      queryUrlsToTry.push(type === 'cib' ? `${base}/${encodeURIComponent(cleanValue)}` : `${base}/${encodeURIComponent(queryIbge)}/${encodeURIComponent(cleanValue)}`);
    }

    // Official Receita Federal / SINTER Endpoints
    queryUrlsToTry.push(type === 'cib'
      ? `https://api.sinter.receitafederal.gov.br/api/v1/ui/${encodeURIComponent(cleanValue)}`
      : `https://api.sinter.receitafederal.gov.br/api/v1/${encodeURIComponent(queryIbge)}/ui/${encodeURIComponent(cleanValue)}`
    );

    queryUrlsToTry.push(type === 'cib'
      ? `https://api.receitafederal.gov.br/prr-sinter/api/v1/ui/${encodeURIComponent(cleanValue)}`
      : `https://api.receitafederal.gov.br/prr-sinter/api/v1/${encodeURIComponent(queryIbge)}/ui/${encodeURIComponent(cleanValue)}`
    );

    queryUrlsToTry.push(type === 'cib'
      ? `https://gateway.apiserpro.serpro.gov.br/sinter/v1/ui/${encodeURIComponent(cleanValue)}`
      : `https://gateway.apiserpro.serpro.gov.br/sinter/v1/${encodeURIComponent(queryIbge)}/ui/${encodeURIComponent(cleanValue)}`
    );

    let realData: any = null;
    let lastStatus = 0;
    let lastResponseData: any = null;

    for (const queryUrl of queryUrlsToTry) {
      try {
        const response = await fetch(queryUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'User-Agent': 'CadSinter-Municipal-Backend/1.0'
          }
        });

        lastStatus = response.status;
        const responseText = await response.text();
        
        try {
          lastResponseData = JSON.parse(responseText);
        } catch {
          lastResponseData = { rawResponse: responseText };
        }

        if (response.ok && lastResponseData) {
          realData = lastResponseData;
          break;
        }
      } catch (err: any) {
        lastResponseData = { error: err.message };
      }
    }

    if (realData) {
      res.json({
        success: true,
        source: 'SINTER_OFFICIAL_API',
        data: realData
      });
    } else {
      res.status(lastStatus || 404).json({
        success: false,
        statusCode: lastStatus || 404,
        error: lastStatus === 404 
          ? `Imóvel (${type === 'cib' ? 'CIB' : 'Inscrição'}) "${cleanValue}" não localizado no cadastro oficial do SINTER.`
          : `Serviço de consulta temporariamente indisponível.`
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
