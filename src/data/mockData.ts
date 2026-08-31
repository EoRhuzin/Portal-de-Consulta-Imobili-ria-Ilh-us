import { Property, AdministrativeProcess } from '../types';

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-001',
    inscricao: '01.02.045.0120.001',
    cib: 'CIB-827.391.042-1',
    contribuinte: 'Maria Aparecida dos Santos',
    cpfCnpj: '123.456.789-00',
    logradouro: 'Avenida Brasil',
    numero: '1045',
    bairro: 'Centro',
    tipo: 'Predial',
    uso: 'Residencial',
    complemento: 'Apto 302',
    cep: '13010-000',
    areaTerreno: 250,
    areaConstruida: 120,
    valorVenal: 285000,
    situacaoFiscal: 'Regular',
    dataAtualizacao: '2026-01-15'
  },
  {
    id: 'prop-002',
    inscricao: '01.05.088.0050.002',
    cib: 'CIB-918.273.645-8',
    contribuinte: 'Maria Aparecida dos Santos',
    cpfCnpj: '123.456.789-00',
    logradouro: 'Rua das Palmeiras',
    numero: '320',
    bairro: 'Jardim das Flores',
    tipo: 'Territorial',
    uso: 'Residencial',
    complemento: 'Lote 12 - Quadra B',
    cep: '13025-100',
    areaTerreno: 360,
    areaConstruida: 0,
    valorVenal: 140000,
    situacaoFiscal: 'Regular',
    dataAtualizacao: '2025-11-20'
  },
  {
    id: 'prop-003',
    inscricao: '02.10.120.0400.001',
    cib: 'CIB-554.321.987-3',
    contribuinte: 'João Carlos de Oliveira',
    cpfCnpj: '987.654.321-11',
    logradouro: 'Rua XV de Novembro',
    numero: '500',
    bairro: 'Comércio',
    tipo: 'Predial',
    uso: 'Comercial',
    complemento: 'Loja 01',
    cep: '13015-200',
    areaTerreno: 400,
    areaConstruida: 320,
    valorVenal: 650000,
    situacaoFiscal: 'Regular',
    dataAtualizacao: '2026-02-01'
  },
  {
    id: 'prop-004',
    inscricao: '03.01.015.0080.005',
    cib: 'CIB-332.114.556-9',
    contribuinte: 'Carlos Eduardo Pereira',
    cpfCnpj: '111.222.333-44',
    logradouro: 'Rua São Paulo',
    numero: '128',
    bairro: 'Vila Nova',
    tipo: 'Predial',
    uso: 'Residencial',
    complemento: 'Casa 01',
    cep: '13040-050',
    areaTerreno: 200,
    areaConstruida: 95,
    valorVenal: 210000,
    situacaoFiscal: 'Pendente',
    dataAtualizacao: '2025-08-10'
  },
  {
    id: 'prop-005',
    inscricao: '03.01.015.0080.006',
    cib: 'CIB-332.114.557-7',
    contribuinte: 'Carlos Eduardo Pereira',
    cpfCnpj: '111.222.333-44',
    logradouro: 'Rua São Paulo',
    numero: '130',
    bairro: 'Vila Nova',
    tipo: 'Predial',
    uso: 'Comercial',
    complemento: 'Salão Comercial',
    cep: '13040-050',
    areaTerreno: 200,
    areaConstruida: 150,
    valorVenal: 310000,
    situacaoFiscal: 'Regular',
    dataAtualizacao: '2026-03-12'
  },
  {
    id: 'prop-006',
    inscricao: '04.08.090.0012.001',
    cib: 'CIB-778.899.001-2',
    contribuinte: 'Empresa Comercial Delta Ltda',
    cpfCnpj: '12.345.678/0001-90',
    logradouro: 'Avenida Industrial',
    numero: '5000',
    bairro: 'Distrito Industrial',
    tipo: 'Predial',
    uso: 'Industrial',
    complemento: 'Galpão 04',
    cep: '13080-000',
    areaTerreno: 2500,
    areaConstruida: 1800,
    valorVenal: 2400000,
    situacaoFiscal: 'Regular',
    dataAtualizacao: '2026-02-28'
  }
];

export const INITIAL_PROCESSES: AdministrativeProcess[] = [
  {
    id: 'proc-101',
    protocolo: 'PROC-2026/01482',
    cpfCnpj: '123.456.789-00',
    requerente: 'Maria Aparecida dos Santos',
    assunto: 'Atualização de Cadastro Imobiliário - Mudança de Uso',
    inscricao: '01.02.045.0120.001',
    dataAbertura: '2026-02-10',
    status: 'Em Análise',
    historico: [
      {
        data: '2026-02-10 09:30',
        setor: 'Atendimento ao Cidadão',
        descricao: 'Abertura de processo protocolada via portal web.'
      },
      {
        data: '2026-02-12 14:15',
        setor: 'Departamento de Cadastro Imobiliário',
        descricao: 'Processo distribuído para vistoria fiscal.'
      }
    ]
  },
  {
    id: 'proc-102',
    protocolo: 'PROC-2026/00912',
    cpfCnpj: '987.654.321-11',
    requerente: 'João Carlos de Oliveira',
    assunto: 'Solicitação de Isenção de IPTU',
    inscricao: '02.10.120.0400.001',
    dataAbertura: '2026-01-18',
    status: 'Deferido',
    historico: [
      {
        data: '2026-01-18 11:00',
        setor: 'Atendimento ao Cidadão',
        descricao: 'Protocolo de requerimento registrado.'
      },
      {
        data: '2026-01-25 16:40',
        setor: 'Divisão de Tributação Municipal',
        descricao: 'Documentação fiscal checada e aprovada. Deferido.'
      }
    ]
  },
  {
    id: 'proc-103',
    protocolo: 'PROC-2025/09812',
    cpfCnpj: '111.222.333-44',
    requerente: 'Carlos Eduardo Pereira',
    assunto: 'Revisão de Área Construída e Valor Venal',
    inscricao: '03.01.015.0080.005',
    dataAbertura: '2025-11-05',
    status: 'Aguardando Documentos',
    historico: [
      {
        data: '2025-11-05 10:15',
        setor: 'Atendimento Virtual',
        descricao: 'Processo instaurado pelo requerente.'
      },
      {
        data: '2025-11-20 13:00',
        setor: 'Setor de Engenharia Cadastral',
        descricao: 'Notificação emitida: Solicita-se planta baixa atualizada e habite-se.'
      }
    ]
  }
];

export const SERVICE_OPTIONS = [
  {
    id: 'inscricao',
    title: 'Consultar Inscrição Mobiliária / Imobiliária',
    description: 'Localize os dados cadastrais do seu imóvel ou cadastro imobiliário/mobiliário com seu CPF/CNPJ.',
    iconName: 'Building2',
    tag: 'Mais Acessado'
  },
  {
    id: 'atualizacao',
    title: 'Atualização de Cadastro Imobiliário',
    description: 'Solicite a alteração de titularidade, logradouro, uso do imóvel ou dados de contato.',
    iconName: 'FileText',
    tag: 'Serviço Online'
  },
  {
    id: 'cib',
    title: 'Consulta Número CIB',
    description: 'Obtenha o Cadastro Imobiliário Brasileiro (CIB) vinculado ao imóvel e à Receita Federal.',
    iconName: 'Search',
    tag: 'Nacional'
  },
  {
    id: 'certidoes',
    title: 'Certidões e Informações Cadastrais',
    description: 'Emita Certidão Negativa de Débitos (CND), Certidão Cadastral e Espelho do Imóvel.',
    iconName: 'Award',
    tag: 'Emissão Rápida'
  },
  {
    id: 'processos',
    title: 'Consultar Processos Administrativos',
    description: 'Acompanhe o andamento de requerimentos, vistorias e recursos pelo número de protocolo ou CPF.',
    iconName: 'Clock',
    tag: 'Acompanhamento'
  },
  {
    id: 'atendimento',
    title: 'Falar com Atendimento / Agendamento',
    description: 'Tire dúvidas com o assistente virtual, fale via WhatsApp da Secretaria ou agende um horário.',
    iconName: 'MessageSquare',
    tag: 'Suporte Direto'
  }
] as const;

export const SAMPLE_PDF_TEXT = `SECRETARIA MUNICIPAL DE FINANÇAS E CADASTRO IMOBILIÁRIO
RELATÓRIO DE CADASTRO IMOBILIÁRIO MUNICIPAL - ABRIL/2026

Inscrição Contribuinte Logradouro N. Porta Bairro Tipo Uso CPF_CNPJ CIB
01.02.045.0120.001 | Maria Aparecida dos Santos | Avenida Brasil | 1045 | Centro | Predial | Residencial | 123.456.789-00 | CIB-827.391.042-1
01.05.088.0050.002 | Maria Aparecida dos Santos | Rua das Palmeiras | 320 | Jardim das Flores | Territorial | Residencial | 123.456.789-00 | CIB-918.273.645-8
02.10.120.0400.001 | João Carlos de Oliveira | Rua XV de Novembro | 500 | Comércio | Predial | Comercial | 987.654.321-11 | CIB-554.321.987-3
03.01.015.0080.005 | Carlos Eduardo Pereira | Rua São Paulo | 128 | Vila Nova | Predial | Residencial | 111.222.333-44 | CIB-332.114.556-9
03.01.015.0080.006 | Carlos Eduardo Pereira | Rua São Paulo | 130 | Vila Nova | Predial | Comercial | 111.222.333-44 | CIB-332.114.557-7
04.08.090.0012.001 | Empresa Comercial Delta Ltda | Avenida Industrial | 5000 | Distrito Industrial | Predial | Industrial | 12.345.678/0001-90 | CIB-778.899.001-2
05.02.030.0010.008 | Fernanda Lima Rezende | Alameda dos Anipôs | 88 | Bairro Alto | Predial | Residencial | 444.555.666-77 | CIB-102.304.506-0
`;
