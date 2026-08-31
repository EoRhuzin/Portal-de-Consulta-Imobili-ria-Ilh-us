export interface Property {
  id: string;
  inscricao: string; // Inscrição do Contribuinte / Imobiliária
  cib: string; // Cadastro Imobiliário Brasileiro
  contribuinte: string; // Nome do Contribuinte / Proprietário
  cpfCnpj: string; // CPF ou CNPJ formatado ou apenas dígitos
  logradouro: string; // Logradouro (Rua, Av, etc)
  numero: string; // N. Porta
  bairro: string; // Bairro
  tipo: string; // Tipo (Predial, Territorial, etc)
  uso: string; // Uso (Residencial, Comercial, Misto, etc)
  complemento?: string;
  cep?: string;
  areaTerreno?: number; // em m²
  areaConstruida?: number; // em m²
  valorVenal?: number; // R$
  situacaoFiscal: 'Regular' | 'Pendente' | 'Inadimplente';
  dataAtualizacao: string;
}

export interface AdministrativeProcess {
  id: string;
  protocolo: string;
  cpfCnpj: string;
  requerente: string;
  assunto: string;
  inscricao?: string;
  dataAbertura: string;
  status: 'Em Análise' | 'Aguardando Documentos' | 'Deferido' | 'Indeferido' | 'Concluído';
  historico: {
    data: string;
    setor: string;
    descricao: string;
  }[];
}

export type ServiceTypeId =
  | 'inscricao'
  | 'atualizacao'
  | 'cib'
  | 'certidoes'
  | 'processos'
  | 'atendimento'
  | 'admin_import'
  | 'sinter';

export interface ServiceOption {
  id: ServiceTypeId;
  title: string;
  description: string;
  iconName: string;
  tag?: string;
}

export interface CertificateRequest {
  propertyId: string;
  type: 'cnd' | 'dados_cadastrais' | 'espelho_imovel';
  dataEmissao: string;
  codigoValidacao: string;
}
