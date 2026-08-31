import React, { useState } from 'react';
import { Copy, AlertCircle, BookOpen, Search, Filter, ShieldCheck, Tag } from 'lucide-react';

interface QueryResultDisplayProps {
  data: any;
}

// Complete Domain Codes according to official SINTER RFB manual
export const SINTER_DOMAINS = {
  tipoImovel: [
    { code: '01', title: 'Territorial', desc: 'Territorial (sem edificação)' },
    { code: '02', title: 'Predial', desc: 'Predial (com edificação)' },
    { code: '03', title: 'Especial', desc: 'Bem imóvel de características especiais' }
  ],
  tipoArquitetonico: [
    { code: '01', title: 'Casa', desc: 'Edificação de uso residencial, situado ou não em condomínio horizontal, ainda que possua mais de um pavimento (sobrado) ou partilhe divisa em comum com outra edificação (parede de geminação) e com acesso direto à via.' },
    { code: '02', title: 'Apartamento', desc: 'Unidade autônoma de uso residencial existente em condomínio edilício (vertical) à qual pode-se atribuir titularidade individual e independente das demais unidades e que partilha a área comum do condomínio.' },
    { code: '03', title: 'Vaga de garagem', desc: 'Espaço com delimitação definida cuja titularidade é individualizada, que não integra parte de uma unidade residencial ou não residencial e cuja ocupação principal seja a de guarda de veículos.' },
    { code: '04', title: 'Laje', desc: 'Contempla o espaço aéreo ou o subsolo de terrenos públicos ou privados, tomados em projeção vertical, como unidade imobiliária autônoma, não contemplando as demais áreas edificadas ou não pertencentes ao proprietário da construção-base. Não implica a atribuição de fração ideal de terreno ao titular da laje ou a participação proporcional em áreas já edificadas. Para identificar a unidade imobiliária constituída como direito real de laje (art. 1510-A, CC e alterações pela Lei nº 13.465, de 2017).' },
    { code: '05', title: 'Sala', desc: 'Unidade autônoma, de uso não residencial, existente em condomínio edilício, vertical ou horizontal, à qual pode-se atribuir titularidade individual e independente das demais e que partilha a área comum do condomínio.' },
    { code: '06', title: 'Conjunto de salas', desc: 'Conjunto de ambientes, cujo uso e ocupação possam ser individualizados, com acesso independente ou não às áreas individualizadas, situado em edificação vertical ou horizontal, com compartilhamento do uso de áreas comuns e que se encontre sob um mesmo regime de titularidade e constitua uma única unidade imobiliária.' },
    { code: '07', title: 'Loja', desc: 'Unidade autônoma, de uso não residencial, existente em condomínio edilício destinado ao comércio e/ou prestação de serviços, vertical ou horizontal, ou em rua, cuja face permita a visão da área interna sem que nela se adentre.' },
    { code: '08', title: 'Sobreloja', desc: 'Unidade autônoma, de uso não residencial, existente em condomínio edilício vertical, destinado ao comércio e/ou prestação de serviços, cuja face permita a visão da área interna sem que nela se adentre, e que se localiza em mezanino ou lajes intermediárias entre andares.' },
    { code: '09', title: 'Estacionamento', desc: 'Edificação com destinação específica para guarda de veículos que constitua unidade autônoma ou área demarcada (vaga) para guarda de veículos que constitua unidade autônoma, com ou sem fração ideal.' },
    { code: '10', title: 'Barraco', desc: 'Unidade de habitação, na qual emprega-se materiais como madeira ou assemelhados para seu fechamento e com cobertura de palha, telha ou zinco.' },
    { code: '11', title: 'Galpão', desc: 'Edificação coberta, com ou sem fechamentos laterais, com poucas ou sem divisões internas, regularmente utilizada para depósito ou abrigo de produtos, mercadorias, máquinas e semoventes, podendo ou não serem exercidas atividades laborais ou industriais em seu interior.' }
  ],
  bice: [
    { code: '01', title: 'Usinas', desc: 'Usinas nucleares, hidrelétricas e termoelétricas' },
    { code: '02', title: 'Eólica & Solar', desc: 'Parques eólicos e plantas solares' },
    { code: '03', title: 'Petróleo & Gás', desc: 'Plataformas, sondas de prospecção e plantas de refino de petróleo e gás' },
    { code: '04', title: 'Terminais & Portos', desc: 'Portos, eclusas, aeroportos, terminals rodoviários, ferroviários e hidroviários' },
    { code: '05', title: 'Aquedutos & Gasodutos', desc: 'Aquedutos, gasodutos e minerodutos' },
    { code: '06', title: 'Aquíferos & Mineração', desc: 'Aquíferos e jazidas minerais' },
    { code: '07', title: 'Vias & Rodovias', desc: 'Rodovias, estradas, vias vicinais, túneis, pontes e viadutos' },
    { code: '08', title: 'Praças & Espaços Públicos', desc: 'Praças e logradouros' },
    { code: '09', title: 'Patrimônio Histórico', desc: 'Museus, prédios e monumentos históricos e sítios arqueológicos' },
    { code: '10', title: 'Terras Indígenas', desc: 'Terras indígenas e terras devolutas' },
    { code: '11', title: 'Recursos Hídricos', desc: 'Lagos, lagoas, rios, quedas d´água, reservatórios de barragens, açudes, cursos d’água navegáveis, mananciais e espelho d’água' },
    { code: '12', title: 'Áreas Ambientais', desc: 'Parques, florestas, áreas ambientais e unidades de conservação' }
  ],
  destinacaoImovel: [
    { code: '01', title: 'Residencial', desc: 'Residencial' },
    { code: '02', title: 'Comercial', desc: 'Comercial' },
    { code: '03', title: 'Prestação de serviço', desc: 'Prestação de serviço' },
    { code: '04', title: 'Industrial', desc: 'Industrial' },
    { code: '05', title: 'Educacional', desc: 'Educacional' },
    { code: '06', title: 'Lazer', desc: 'Lazer' },
    { code: '07', title: 'Desportos', desc: 'Desportos' },
    { code: '08', title: 'Religioso', desc: 'Religioso' },
    { code: '09', title: 'Institucional', desc: 'Institucional' },
    { code: '10', title: 'Transporte', desc: 'Transporte' },
    { code: '11', title: 'Comunicação', desc: 'Comunicação' },
    { code: '12', title: 'Saúde', desc: 'Saúde' },
    { code: '13', title: 'Hotelaria', desc: 'Hotelaria' },
    { code: '14', title: 'Uso misto', desc: 'Uso misto' },
    { code: '15', title: 'Urbano c/ destinação rural', desc: 'Urbano com destinação rural' },
    { code: '16', title: 'Uso comum do povo', desc: 'Bem de uso comum do povo' },
    { code: '17', title: 'Saneamento', desc: 'Saneamento' },
    { code: '99', title: 'Não Residencial', desc: 'Não Residencial' }
  ],
  padraoConstrutivo: [
    { code: '01', title: 'Popular', desc: 'Popular' },
    { code: '02', title: 'Baixo', desc: 'Baixo' },
    { code: '03', title: 'Normal', desc: 'Normal' },
    { code: '04', title: 'Alto', desc: 'Alto' },
    { code: '05', title: 'Luxo', desc: 'Luxo' }
  ],
  tipoTitularidade: [
    { code: '01', title: 'Proprietário', desc: 'Proprietário' },
    { code: '02', title: 'Nu proprietário', desc: 'Nu proprietário' },
    { code: '03', title: 'Senhorio Direto', desc: 'Senhorio Direto' },
    { code: '04', title: 'Credor Fiduciário', desc: 'Credor Fiduciário' },
    { code: '05', title: 'Possuidor a justo título', desc: 'Possuidor a justo título' },
    { code: '06', title: 'Possuidor por simples ocupação', desc: 'Possuidor por simples ocupação' },
    { code: '07', title: 'Enfiteuta', desc: 'Enfiteuta' },
    { code: '08', title: 'Usufrutuário', desc: 'Usufrutuário' },
    { code: '09', title: 'Devedor Fiduciante', desc: 'Devedor Fiduciante' },
    { code: '10', title: 'Usuário', desc: 'Usuário' },
    { code: '11', title: 'Superficiário', desc: 'Superficiário' },
    { code: '12', title: 'Concessionário de Direito Real', desc: 'Concessionário do Direito Real de Uso' },
    { code: '13', title: 'Habitador', desc: 'Habitador' },
    { code: '14', title: 'Promitente comprador (reg)', desc: 'Promitente comprador (com registro sem cláusula de arrependimento)' },
    { code: '15', title: 'Concessionário (concessão)', desc: 'Concessionário (contrato de concessão de uso)' },
    { code: '16', title: 'Promitente comprador (demais)', desc: 'Promitente comprador (demais)' },
    { code: '17', title: 'Arrendatário', desc: 'Arrendatário' }
  ],
  docTitularidade: [
    { code: '01', title: 'Escritura Pública', desc: 'Escritura Pública' },
    { code: '02', title: 'Contrato força Escritura', desc: 'Contrato com força de Escritura' },
    { code: '03', title: 'Instrumento Particular', desc: 'Instrumento Particular' },
    { code: '04', title: 'Sentença Judicial', desc: 'Sentença Judicial' },
    { code: '05', title: 'Doc Posse Órgão Público', desc: 'Documento de Posse Emitido por Órgão Público' }
  ],
  tipoDesativacao: [
    { code: '01', title: 'Extinção', desc: 'Extinção' },
    { code: '02', title: 'Nulidade', desc: 'Nulidade' }
  ],
  motivoDesativacao: [
    { code: '01', title: 'Desmembramento', desc: 'Desmembramento (Tipo: Extinção)' },
    { code: '02', title: 'Remembramento', desc: 'Remembramento (Tipo: Extinção)' },
    { code: '03', title: 'Incorporação', desc: 'Incorporação (Tipo: Extinção)' },
    { code: '04', title: 'Loteamento', desc: 'Loteamento (Tipo: Extinção)' },
    { code: '05', title: 'Constituição de condomínio', desc: 'Constituição de condomínio (Tipo: Extinção)' },
    { code: '06', title: 'Decisão administrativa', desc: 'Decisão administrativa (Tipo: Extinção e Nulidade)' },
    { code: '07', title: 'Decisão judicial', desc: 'Decisão judicial (Tipo: Extinção e Nulidade)' },
    { code: '08', title: 'Destinação rural', desc: 'Destinação rural (Tipo: Nulidade)' },
    { code: '09', title: 'Duplicidade', desc: 'Duplicidade (Tipo: Nulidade)' },
    { code: '10', title: 'Inscrição indevida', desc: 'Inscrição indevida (Tipo: Nulidade)' }
  ],
  falhas: [
    { code: '0001', title: 'Campo Obrigatório', desc: 'Campo obrigatório não preenchido' },
    { code: '0002', title: 'Formatação Inválida', desc: 'Campo com formatação inválida' },
    { code: '0003', title: 'Tamanho Inválido', desc: 'Campo com tamanho inválido' },
    { code: '0004', title: 'Código não encontrado', desc: 'Campo com código não encontrado em tabela de domínio' },
    { code: '0005', title: 'Valor Inválido', desc: 'Campo com valor inválido' },
    { code: '0006', title: 'Duplicidade UI', desc: 'Unidade Imobiliária já cadastrada no SINTER' },
    { code: '0007', title: 'UI Não Encontrada', desc: 'Unidade Imobiliária não encontrada no SINTER' },
    { code: '0008', title: 'Incompatibilidade CIB/Inscrição', desc: 'CIB incompatível com Inscrição Imobiliária' },
    { code: '0009', title: 'Situação Bloqueante', desc: 'Situação da Unidade Imobiliária não permite alteração' },
    { code: '0010', title: 'Preenchimento Indevido', desc: 'Campo com preenchimento indevido' },
    { code: '0011', title: 'Campos Nulos Exigidos', desc: "Para este 'tipoImovel', 'tpArquitetonico' e 'areaConstruida' devem ser null" },
    { code: '0012', title: 'Campos Obrigatórios', desc: "Para este 'tipoImovel', 'tpArquitetonico' e 'areaConstruida' são obrigatórios e devem ser válidos" },
    { code: '0013', title: 'BICE Obrigatório', desc: "Para este 'tipoImovel', 'bice' é obrigatório e deve ser válido" },
    { code: '0014', title: 'Bairro Obrigatório', desc: "Quando 'DadosGeraisImovel.temBairro' for true, 'EnderecoImovel.bairro' é obrigatório" },
    { code: '0015', title: 'Destinação Obrigatória', desc: "Para este 'tipoImovel', 'destinacaoImovel' é obrigatório e deve ser válido" },
    { code: '0016', title: 'Estrutura Inválida', desc: 'Json com campo inválido ou estrutura inválida' },
    { code: '0101', title: 'Incompatibilidade de Campos', desc: 'Campos com preenchimento incompatível' },
    { code: '0102', title: 'Formato Inválido', desc: 'Campo com formato inválido' },
    { code: '0103', title: 'Tamanho Inválido', desc: 'Campo com tamanho inválido' },
    { code: '0104', title: 'Domínio Não Encontrado', desc: 'Campo com código não encontrado em tabela de domínio' },
    { code: '0105', title: 'Valor Inválido', desc: 'Campo com valor inválido' },
    { code: '0106', title: 'DV CPF/CNPJ Inválido', desc: 'CPF/CNPJ com DV inválido' },
    { code: '0107', title: 'Data Inválida', desc: 'Data com formato inválido' },
    { code: '0108', title: 'Incompletude de Grupo', desc: 'Grupo com preenchimento incompleto ou inválido' },
    { code: '0099', title: 'Erro Técnico', desc: 'Erro técnico no processamento da UI' }
  ],
  tipoTransacao: [
    { code: '01', title: 'COMPRA E VENDA', desc: 'COMPRA E VENDA' },
    { code: '02', title: 'USUFRUTO', desc: 'USUFRUTO' },
    { code: '03', title: 'NUA PROPRIEDADE', desc: 'NUA PROPRIEDADE' },
    { code: '04', title: 'CESSÃO DE DIREITOS', desc: 'CESSÃO DE DIREITOS' },
    { code: '05', title: 'DAÇÃO EM PAGAMENTO', desc: 'DAÇÃO EM PAGAMENTO' },
    { code: '06', title: 'EXTINÇÃO DE CONDOMÍNIO', desc: 'EXTINÇÃO DE CONDOMÍNIO' },
    { code: '07', title: 'INTEGRALIZAÇÃO DE CAPITAL', desc: 'INTEGRALIZAÇÃO DE CAPITAL' },
    { code: '08', title: 'PERMUTA', desc: 'PERMUTA' },
    { code: '09', title: 'INTERVENIÊNCIA', desc: 'INTERVENIÊNCIA' },
    { code: '10', title: 'ADJUDICAÇÃO', desc: 'ADJUDICAÇÃO' },
    { code: '11', title: 'COMPRA E VENDA COM INTERVENIÊNCIA', desc: 'COMPRA E VENDA COM INTERVENIÊNCIA' },
    { code: '12', title: 'CISÃO', desc: 'CISÃO' },
    { code: '13', title: 'ARREMATAÇÃO JUDICIAL', desc: 'ARREMATAÇÃO JUDICIAL' },
    { code: '14', title: 'DISTRATO', desc: 'DISTRATO' },
    { code: '15', title: 'RENÚNCIA DE USUFRUTO', desc: 'RENÚNCIA DE USUFRUTO' },
    { code: '16', title: 'EXTINÇÃO DE PESSOA JURÍDICA', desc: 'EXTINÇÃO DE PESSOA JURÍDICA' },
    { code: '17', title: 'TORNA SOBRE EXTINÇÃO DE CONDOMÍNIO', desc: 'TORNA SOBRE EXTINÇÃO DE CONDOMÍNIO' },
    { code: '18', title: 'DESINCORPORAÇÃO DE CAPITAL', desc: 'DESINCORPORAÇÃO DE CAPITAL' },
    { code: '19', title: 'INCORPORAÇÃO DE SOCIEDADE', desc: 'INCORPORAÇÃO DE SOCIEDADE' },
    { code: '20', title: 'DESAPROPRIAÇÃO', desc: 'DESAPROPRIAÇÃO' },
    { code: '21', title: 'CONSOLIDAÇÃO DA PROPRIEDADE', desc: 'CONSOLIDAÇÃO DA PROPRIEDADE' },
    { code: '22', title: 'DISTRIBUIÇÃO DE LUCROS E RESULTADOS', desc: 'DISTRIBUIÇÃO DE LUCROS E RESULTADOS' },
    { code: '23', title: 'PARTILHA DE BENS EM AÇÃO JUDICIAL (MEAÇÃO)', desc: 'PARTILHA DE BENS EM AÇÃO JUDICIAL (MEAÇÃO)' },
    { code: '24', title: 'REDUÇÃO DE CAPITAL', desc: 'REDUÇÃO DE CAPITAL' },
    { code: '25', title: 'FUSÃO', desc: 'FUSÃO' },
    { code: '26', title: 'TRANSAÇÃO JUDICIAL', desc: 'TRANSAÇÃO JUDICIAL' },
    { code: '27', title: 'USUCAPIÃO', desc: 'USUCAPIÃO' },
    { code: '28', title: 'RESERVA DE ÁGIO', desc: 'RESERVA DE ÁGIO' },
    { code: '29', title: 'RESERVA DE CAPITAL', desc: 'RESERVA DE CAPITAL' },
    { code: '30', title: 'TRANSLAÇÃO DE DOMÍNIO', desc: 'TRANSLAÇÃO DE DOMÍNIO' },
    { code: '31', title: 'DIREITO REAL DE AQUISIÇÃO', desc: 'DIREITO REAL DE AQUISIÇÃO' },
    { code: '32', title: 'CESSÃO DE DIREITOS HEREDITÁRIOS', desc: 'CESSÃO DE DIREITOS HEREDITÁRIOS' },
    { code: '33', title: 'ALIENAÇÃO', desc: 'ALIENAÇÃO' },
    { code: '34', title: 'INSTITUIÇÃO DE DIREITO REAL DE GARANTIA', desc: 'INSTITUIÇÃO DE DIREITO REAL DE GARANTIA' },
    { code: '35', title: 'INSTITUIÇÃO DO DIREITO DE SUPERFÍCIE', desc: 'INSTITUIÇÃO DO DIREITO DE SUPERFÍCIE' },
    { code: '36', title: 'ARREMATAÇÃO EXTRAJUDICIAL', desc: 'ARREMATAÇÃO EXTRAJUDICIAL' },
    { code: '37', title: 'PROMESSA DE COMPRA E VENDA', desc: 'PROMESSA DE COMPRA E VENDA' }
  ],
  tipoLogradouro: [
    { code: '01', title: 'Acampamento', desc: 'Acampamento' },
    { code: '02', title: 'Acesso', desc: 'Acesso' },
    { code: '03', title: 'Açude', desc: 'Açude' },
    { code: '04', title: 'Adro', desc: 'Adro' },
    { code: '05', title: 'Aeroporto', desc: 'Aeroporto' },
    { code: '06', title: 'Afluente', desc: 'Afluente' },
    { code: '07', title: 'Aglomerado', desc: 'Aglomerado' },
    { code: '08', title: 'Agrovila', desc: 'Agrovila' },
    { code: '09', title: 'Alagado', desc: 'Alagado' },
    { code: '10', title: 'Alameda', desc: 'Alameda' },
    { code: '11', title: 'Aldeia', desc: 'Aldeia' },
    { code: '12', title: 'Aleia', desc: 'Aleia' },
    { code: '13', title: 'Alto', desc: 'Alto' },
    { code: '14', title: 'Anel', desc: 'Anel' },
    { code: '15', title: 'Antiga', desc: 'Antiga' },
    { code: '16', title: 'Antigo', desc: 'Antigo' },
    { code: '17', title: 'Area', desc: 'Area' },
    { code: '18', title: 'Areal', desc: 'Areal' },
    { code: '19', title: 'Arraial', desc: 'Arraial' },
    { code: '20', title: 'Arroio', desc: 'Arroio' },
    { code: '21', title: 'Artéria', desc: 'Artéria' },
    { code: '22', title: 'Assentamento', desc: 'Assentamento' },
    { code: '23', title: 'Atalho', desc: 'Atalho' },
    { code: '24', title: 'Aterro', desc: 'Aterro' },
    { code: '25', title: 'Autódromo', desc: 'Autódromo' },
    { code: '26', title: 'Avenida', desc: 'Avenida' },
    { code: '27', title: 'Baia', desc: 'Baia' },
    { code: '28', title: 'Bairro', desc: 'Bairro' },
    { code: '29', title: 'Baixa', desc: 'Baixa' },
    { code: '30', title: 'Baixada', desc: 'Baixada' },
    { code: '31', title: 'Baixadão', desc: 'Baixadão' },
    { code: '32', title: 'Baixão', desc: 'Baixão' },
    { code: '33', title: 'Baixo', desc: 'Baixo' },
    { code: '34', title: 'Balão', desc: 'Balão' },
    { code: '35', title: 'Balneário', desc: 'Balneário' },
    { code: '36', title: 'Barra', desc: 'Barra' },
    { code: '37', title: 'Barragem', desc: 'Barragem' },
    { code: '38', title: 'Barranca', desc: 'Barranca' },
    { code: '39', title: 'Barranco', desc: 'Barranco' },
    { code: '40', title: 'Barreiro', desc: 'Barreiro' },
    { code: '41', title: 'Barro', desc: 'Barro' },
    { code: '42', title: 'Beco', desc: 'Beco' },
    { code: '43', title: 'Beira', desc: 'Beira' },
    { code: '44', title: 'Beirada', desc: 'Beirada' },
    { code: '45', title: 'Belvedere', desc: 'Belvedere' },
    { code: '46', title: 'Bloco', desc: 'Bloco' },
    { code: '47', title: 'Bocaina', desc: 'Bocaina' },
    { code: '48', title: 'Boqueirão', desc: 'Boqueirão' },
    { code: '49', title: 'Bosque', desc: 'Bosque' },
    { code: '50', title: 'Boulevard', desc: 'Boulevard' },
    { code: '51', title: 'Brejo', desc: 'Brejo' },
    { code: '52', title: 'Buraco', desc: 'Buraco' },
    { code: '53', title: 'Cabeceira', desc: 'Cabeceira' },
    { code: '54', title: 'Cachoeira', desc: 'Cachoeira' },
    { code: '55', title: 'Cachoeirinha', desc: 'Cachoeirinha' },
    { code: '56', title: 'Cais', desc: 'Cais' },
    { code: '57', title: 'Calcada', desc: 'Calcada' },
    { code: '58', title: 'Calçadão', desc: 'Calçadão' },
    { code: '59', title: 'Caminho', desc: 'Caminho' },
    { code: '60', title: 'Campo', desc: 'Campo' },
    { code: '61', title: 'Canal', desc: 'Canal' },
    { code: '62', title: 'Canteiro', desc: 'Canteiro' },
    { code: '63', title: 'Capão', desc: 'Capão' },
    { code: '64', title: 'Capoeira', desc: 'Capoeira' },
    { code: '65', title: 'Cartódromo', desc: 'Cartódromo' },
    { code: '66', title: 'Central', desc: 'Central' },
    { code: '67', title: 'Centro', desc: 'Centro' },
    { code: '68', title: 'Cerca', desc: 'Cerca' },
    { code: '69', title: 'Cerrado', desc: 'Cerrado' },
    { code: '70', title: 'Cerro', desc: 'Cerro' },
    { code: '71', title: 'Chácara', desc: 'Chácara' },
    { code: '72', title: 'Chapada', desc: 'Chapada' },
    { code: '73', title: 'Chapadão', desc: 'Chapadão' },
    { code: '74', title: 'Charco', desc: 'Charco' },
    { code: '75', title: 'Cidade', desc: 'Cidade' },
    { code: '76', title: 'Circular', desc: 'Circular' },
    { code: '77', title: 'Cohab', desc: 'Cohab' },
    { code: '78', title: 'Colina', desc: 'Colina' },
    { code: '79', title: 'Colônia', desc: 'Colônia' },
    { code: '80', title: 'Comunidade', desc: 'Comunidade' },
    { code: '81', title: 'Condomínio', desc: 'Condomínio' },
    { code: '82', title: 'Conjunto', desc: 'Conjunto' },
    { code: '83', title: 'Continuação', desc: 'Continuação' },
    { code: '84', title: 'Contorno', desc: 'Contorno' },
    { code: '85', title: 'Corredor', desc: 'Corredor' },
    { code: '86', title: 'Córrego', desc: 'Córrego' },
    { code: '87', title: 'Costa', desc: 'Costa' },
    { code: '88', title: 'Coxilha', desc: 'Coxilha' },
    { code: '89', title: 'Cruzamento', desc: 'Cruzamento' },
    { code: '90', title: 'Descida', desc: 'Descida' },
    { code: '91', title: 'Desvio', desc: 'Desvio' },
    { code: '92', title: 'Dique', desc: 'Dique' },
    { code: '93', title: 'Distrito', desc: 'Distrito' },
    { code: '94', title: 'Divisa', desc: 'Divisa' },
    { code: '95', title: 'Divisão', desc: 'Divisão' },
    { code: '96', title: 'Divisor', desc: 'Divisor' },
    { code: '97', title: 'Edifício', desc: 'Edifício' },
    { code: '98', title: 'Eixo', desc: 'Eixo' },
    { code: '99', title: 'Elevado', desc: 'Elevado' },
    { code: '100', title: 'Encosta', desc: 'Encosta' },
    { code: '101', title: 'Engenho', desc: 'Engenho' },
    { code: '102', title: 'Enseada', desc: 'Enseada' },
    { code: '103', title: 'Entrada', desc: 'Entrada' },
    { code: '104', title: 'Entreposto', desc: 'Entreposto' },
    { code: '105', title: 'Entroncamento', desc: 'Entroncamento' },
    { code: '106', title: 'Escada', desc: 'Escada' },
    { code: '107', title: 'Escadão', desc: 'Escadão' },
    { code: '108', title: 'Escadaria', desc: 'Escadaria' },
    { code: '109', title: 'Escadinha', desc: 'Escadinha' },
    { code: '110', title: 'Espigão', desc: 'Espigão' },
    { code: '111', title: 'Esplanada', desc: 'Esplanada' },
    { code: '112', title: 'Esquina', desc: 'Esquina' },
    { code: '113', title: 'Estação', desc: 'Estação' },
    { code: '114', title: 'Estacionamento', desc: 'Estacionamento' },
    { code: '115', title: 'Estádio', desc: 'Estádio' },
    { code: '116', title: 'Estância', desc: 'Estância' },
    { code: '117', title: 'Estrada', desc: 'Estrada' },
    { code: '118', title: 'Extensão', desc: 'Extensão' },
    { code: '119', title: 'Faixa', desc: 'Faixa' },
    { code: '120', title: 'Favela', desc: 'Favela' },
    { code: '121', title: 'Fazenda', desc: 'Fazenda' },
    { code: '122', title: 'Feira', desc: 'Feira' },
    { code: '123', title: 'Ferrovia', desc: 'Ferrovia' },
    { code: '124', title: 'Final', desc: 'Final' },
    { code: '125', title: 'Floresta', desc: 'Floresta' },
    { code: '126', title: 'Folha', desc: 'Folha' },
    { code: '127', title: 'Fonte', desc: 'Fonte' },
    { code: '128', title: 'Fortaleza', desc: 'Fortaleza' },
    { code: '129', title: 'Freguesia', desc: 'Freguesia' },
    { code: '130', title: 'Fundos', desc: 'Fundos' },
    { code: '131', title: 'Furo', desc: 'Furo' },
    { code: '132', title: 'Galeria', desc: 'Galeria' },
    { code: '133', title: 'Gameleira', desc: 'Gameleira' },
    { code: '134', title: 'Garimpo', desc: 'Garimpo' },
    { code: '135', title: 'Gleba', desc: 'Gleba' },
    { code: '136', title: 'Granja', desc: 'Granja' },
    { code: '137', title: 'Grota', desc: 'Grota' },
    { code: '138', title: 'Habitacional', desc: 'Habitacional' },
    { code: '139', title: 'Haras', desc: 'Haras' },
    { code: '140', title: 'Hipódromo', desc: 'Hipódromo' },
    { code: '141', title: 'Horto', desc: 'Horto' },
    { code: '142', title: 'Igarapé', desc: 'Igarapé' },
    { code: '143', title: 'Ilha', desc: 'Ilha' },
    { code: '144', title: 'Inaplicável', desc: 'Inaplicável' },
    { code: '145', title: 'Invasão', desc: 'Invasão' },
    { code: '146', title: 'Jardim', desc: 'Jardim' },
    { code: '147', title: 'Jardinete', desc: 'Jardinete' },
    { code: '148', title: 'Ladeira', desc: 'Ladeira' },
    { code: '149', title: 'Lado', desc: 'Lado' },
    { code: '150', title: 'Lago', desc: 'Lago' },
    { code: '151', title: 'Lagoa', desc: 'Lagoa' },
    { code: '152', title: 'Lagoinha', desc: 'Lagoinha' },
    { code: '153', title: 'Largo', desc: 'Largo' },
    { code: '154', title: 'Lateral', desc: 'Lateral' },
    { code: '155', title: 'Leito', desc: 'Leito' },
    { code: '156', title: 'Ligação', desc: 'Ligação' },
    { code: '157', title: 'Limeira', desc: 'Limeira' },
    { code: '158', title: 'Limite', desc: 'Limite' },
    { code: '159', title: 'Limites', desc: 'Limites' },
    { code: '160', title: 'Linha', desc: 'Linha' },
    { code: '161', title: 'Lote', desc: 'Lote' },
    { code: '162', title: 'Loteamento', desc: 'Loteamento' },
    { code: '163', title: 'Lugarejo', desc: 'Lugarejo' },
    { code: '164', title: 'Maloca', desc: 'Maloca' },
    { code: '165', title: 'Manancial', desc: 'Manancial' },
    { code: '166', title: 'Mangue', desc: 'Mangue' },
    { code: '167', title: 'Margem', desc: 'Margem' },
    { code: '168', title: 'Margens', desc: 'Margens' },
    { code: '169', title: 'Marginal', desc: 'Marginal' },
    { code: '170', title: 'Marina', desc: 'Marina' },
    { code: '171', title: 'Mata', desc: 'Mata' },
    { code: '172', title: 'Mato', desc: 'Mato' },
    { code: '173', title: 'Módulo', desc: 'Módulo' },
    { code: '174', title: 'Monte', desc: 'Monte' },
    { code: '175', title: 'Morro', desc: 'Morro' },
    { code: '176', title: 'Muro', desc: 'Muro' },
    { code: '177', title: 'Não Especificado', desc: 'Não Especificado' },
    { code: '178', title: 'Núcleo', desc: 'Núcleo' },
    { code: '179', title: 'Oca', desc: 'Oca' },
    { code: '180', title: 'Oleoduto', desc: 'Oleoduto' },
    { code: '181', title: 'Olho', desc: 'Olho' },
    { code: '182', title: 'Olhos', desc: 'Olhos' },
    { code: '183', title: 'Orla', desc: 'Orla' },
    { code: '184', title: 'Outros', desc: 'Outros' },
    { code: '185', title: 'Paco', desc: 'Paco' },
    { code: '186', title: 'Palafita', desc: 'Palafita' },
    { code: '187', title: 'Pântano', desc: 'Pântano' },
    { code: '188', title: 'Parada', desc: 'Parada' },
    { code: '189', title: 'Paradouro', desc: 'Paradouro' },
    { code: '190', title: 'Paralela', desc: 'Paralela' },
    { code: '191', title: 'Parque', desc: 'Parque' },
    { code: '192', title: 'Particular', desc: 'Particular' },
    { code: '193', title: 'Passagem', desc: 'Passagem' },
    { code: '194', title: 'Passarela', desc: 'Passarela' },
    { code: '195', title: 'Passeio', desc: 'Passeio' },
    { code: '196', title: 'Passo', desc: 'Passo' },
    { code: '197', title: 'Pasto', desc: 'Pasto' },
    { code: '198', title: 'Pátio', desc: 'Pátio' },
    { code: '199', title: 'Pavilhão', desc: 'Pavilhão' },
    { code: '200', title: 'Pedra', desc: 'Pedra' },
    { code: '201', title: 'Pedras', desc: 'Pedras' },
    { code: '202', title: 'Pedreira', desc: 'Pedreira' },
    { code: '203', title: 'Penhasco', desc: 'Penhasco' },
    { code: '204', title: 'Perimetral', desc: 'Perimetral' },
    { code: '205', title: 'Perímetro', desc: 'Perímetro' },
    { code: '206', title: 'Perto', desc: 'Perto' },
    { code: '207', title: 'Planalto', desc: 'Planalto' },
    { code: '208', title: 'Plataforma', desc: 'Plataforma' },
    { code: '209', title: 'Ponta', desc: 'Ponta' },
    { code: '210', title: 'Ponte', desc: 'Ponte' },
    { code: '211', title: 'Ponto', desc: 'Ponto' },
    { code: '212', title: 'Porto', desc: 'Porto' },
    { code: '213', title: 'Posto', desc: 'Posto' },
    { code: '214', title: 'Povoado', desc: 'Povoado' },
    { code: '215', title: 'Praça', desc: 'Praça' },
    { code: '216', title: 'Praia', desc: 'Praia' },
    { code: '217', title: 'Projeção', desc: 'Projeção' },
    { code: '218', title: 'Projetada', desc: 'Projetada' },
    { code: '219', title: 'Projeto', desc: 'Projeto' },
    { code: '220', title: 'Prolongamento', desc: 'Prolongamento' },
    { code: '221', title: 'Propriedade', desc: 'Propriedade' },
    { code: '222', title: 'Próximo', desc: 'Próximo' },
    { code: '223', title: 'Quadra', desc: 'Quadra' },
    { code: '224', title: 'Quarteirão', desc: 'Quarteirão' },
    { code: '225', title: 'Quilombo', desc: 'Quilombo' },
    { code: '226', title: 'Quilômetro', desc: 'Quilômetro' },
    { code: '227', title: 'Quinta', desc: 'Quinta' },
    { code: '228', title: 'Quintas', desc: 'Quintas' },
    { code: '229', title: 'Rachão', desc: 'Rachão' },
    { code: '230', title: 'Ramal', desc: 'Ramal' },
    { code: '231', title: 'Rampa', desc: 'Rampa' },
    { code: '232', title: 'Rancho', desc: 'Rancho' },
    { code: '233', title: 'Recanto', desc: 'Recanto' },
    { code: '234', title: 'Região', desc: 'Região' },
    { code: '235', title: 'Represa', desc: 'Represa' },
    { code: '236', title: 'Residencial', desc: 'Residencial' },
    { code: '237', title: 'Reta', desc: 'Reta' },
    { code: '238', title: 'Retiro', desc: 'Retiro' },
    { code: '239', title: 'Retorno', desc: 'Retorno' },
    { code: '240', title: 'Riacho', desc: 'Riacho' },
    { code: '241', title: 'Ribanceira', desc: 'Ribanceira' },
    { code: '242', title: 'Ribeirão', desc: 'Ribeirão' },
    { code: '243', title: 'Rincão', desc: 'Rincão' },
    { code: '244', title: 'Rio', desc: 'Rio' },
    { code: '245', title: 'Rocha', desc: 'Rocha' },
    { code: '246', title: 'Rochedo', desc: 'Rochedo' },
    { code: '247', title: 'Rodovia', desc: 'Rodovia' },
    { code: '248', title: 'Rotatória', desc: 'Rotatória' },
    { code: '249', title: 'Rotula', desc: 'Rotula' },
    { code: '250', title: 'Rua', desc: 'Rua' },
    { code: '251', title: 'Ruela', desc: 'Ruela' },
    { code: '252', title: 'Saco', desc: 'Saco' },
    { code: '253', title: 'Saída', desc: 'Saída' },
    { code: '254', title: 'Sanga', desc: 'Sanga' },
    { code: '255', title: 'Sede', desc: 'Sede' },
    { code: '256', title: 'Sem', desc: 'Sem' },
    { code: '257', title: 'Seringal', desc: 'Seringal' },
    { code: '258', title: 'Serra', desc: 'Serra' },
    { code: '259', title: 'Sertão', desc: 'Sertão' },
    { code: '260', title: 'Servidão', desc: 'Servidão' },
    { code: '261', title: 'Seta', desc: 'Seta' },
    { code: '262', title: 'Setor', desc: 'Setor' },
    { code: '263', title: 'Sitio', desc: 'Sitio' },
    { code: '264', title: 'Sopé', desc: 'Sopé' },
    { code: '265', title: 'Subida', desc: 'Subida' },
    { code: '266', title: 'Superquadra', desc: 'Superquadra' },
    { code: '267', title: 'Tapera', desc: 'Tapera' },
    { code: '268', title: 'Terminal', desc: 'Terminal' },
    { code: '269', title: 'Terra', desc: 'Terra' },
    { code: '270', title: 'Terreno', desc: 'Terreno' },
    { code: '271', title: 'Terrenos', desc: 'Terrenos' },
    { code: '272', title: 'Transversal', desc: 'Transversal' },
    { code: '273', title: 'Travessa', desc: 'Travessa' },
    { code: '274', title: 'Travessão', desc: 'Travessão' },
    { code: '275', title: 'Travessia', desc: 'Travessia' },
    { code: '276', title: 'Trecho', desc: 'Trecho' },
    { code: '277', title: 'Trevo', desc: 'Trevo' },
    { code: '278', title: 'Trilha', desc: 'Trilha' },
    { code: '279', title: 'Trilho', desc: 'Trilho' },
    { code: '280', title: 'Trilhos', desc: 'Trilhos' },
    { code: '281', title: 'Trincheira', desc: 'Trincheira' },
    { code: '282', title: 'Túnel', desc: 'Túnel' },
    { code: '283', title: 'Unidade', desc: 'Unidade' },
    { code: '284', title: 'Usina', desc: 'Usina' },
    { code: '285', title: 'Vala', desc: 'Vala' },
    { code: '286', title: 'Valão', desc: 'Valão' },
    { code: '287', title: 'Vale', desc: 'Vale' },
    { code: '288', title: 'Vargem', desc: 'Vargem' },
    { code: '289', title: 'Variante', desc: 'Variante' },
    { code: '290', title: 'Várzea', desc: 'Várzea' },
    { code: '291', title: 'Velódromo', desc: 'Velódromo' },
    { code: '292', title: 'Vereda', desc: 'Vereda' },
    { code: '293', title: 'Vertente', desc: 'Vertente' },
    { code: '294', title: 'Via', desc: 'Via' },
    { code: '295', title: 'Viaduto', desc: 'Viaduto' },
    { code: '296', title: 'Vicinal', desc: 'Vicinal' },
    { code: '297', title: 'Viela', desc: 'Viela' },
    { code: '298', title: 'Vila', desc: 'Vila' },
    { code: '299', title: 'Vilarejo', desc: 'Vilarejo' },
    { code: '300', title: 'Volta', desc: 'Volta' },
    { code: '301', title: 'Zona', desc: 'Zona' },
    { code: '302', title: '1a Travessa da Avenida', desc: '1a Travessa da Avenida' },
    { code: '303', title: '1a Travessa da Rua', desc: '1a Travessa da Rua' },
    { code: '304', title: '2a Travessa da Avenida', desc: '2a Travessa da Avenida' },
    { code: '305', title: '2a Travessa da Rua', desc: '2a Travessa da Rua' },
    { code: '306', title: '3a Travessa da Avenida', desc: '3a Travessa da Avenida' },
    { code: '307', title: '3a Travessa da Rua', desc: '3a Travessa da Rua' },
    { code: '308', title: '4a Travessa da Avenida', desc: '4a Travessa da Avenida' },
    { code: '309', title: '4a Travessa da Rua', desc: '4a Travessa da Rua' },
    { code: '310', title: '5a Travessa da Avenida', desc: '5a Travessa da Avenida' },
    { code: '311', title: '5a Travessa da Rua', desc: '5a Travessa da Rua' }
  ]
};

export const QueryResultDisplay: React.FC<QueryResultDisplayProps> = ({ data }) => {
  const [activeSubTab, setActiveSubTab] = useState<'geral' | 'endereco' | 'proprietario' | 'itbi' | 'dominios' | 'json'>('geral');
  const [selectedDomainTab, setSelectedDomainTab] = useState<keyof typeof SINTER_DOMAINS>('tipoImovel');
  const [domainFilter, setDomainFilter] = useState('');

  if (!data) return null;

  // Filter tabs bar dynamically to show ONLY tabs that have non-null/non-undefined data in the JSON
  const availableTabs = React.useMemo(() => {
    const tabs: Array<'geral' | 'endereco' | 'proprietario' | 'itbi' | 'dominios' | 'json'> = ['geral'];
    
    // Only show Endereço tab if there is EnderecoImovel or AreaConstruidaCompl
    if (data.EnderecoImovel || data.AreaConstruidaCompl) {
      tabs.push('endereco');
    }
    // Only show Proprietário tab if there is Titular list, ServicoRegistroImovel, or CartorioNotas
    if (data.Titular || data.ServicoRegistroImovel || data.CartorioNotas) {
      tabs.push('proprietario');
    }
    // Only show ITBI tab if there is ITBI data
    if (data.ITBI) {
      tabs.push('itbi');
    }
    
    tabs.push('dominios', 'json');
    return tabs;
  }, [data]);

  // Fallback to first available tab if current one is hidden
  const currentTab = availableTabs.includes(activeSubTab) ? activeSubTab : availableTabs[0];

  // Translation helpers using the exact domain definitions
  const getTipoImovel = (val: any) => {
    const formatted = String(val).padStart(2, '0');
    const match = SINTER_DOMAINS.tipoImovel.find(item => item.code === formatted);
    return match ? `${match.code} - ${match.desc}` : `Código ${val}`;
  };

  const getTipoArquitetonico = (val: any) => {
    if (val === undefined || val === null) return 'Não se aplica';
    const formatted = String(val).padStart(2, '0');
    const match = SINTER_DOMAINS.tipoArquitetonico.find(item => item.code === formatted);
    return match ? `${match.code} - ${match.title}` : `Código ${val}`;
  };

  const getBice = (val: any) => {
    if (val === undefined || val === null) return 'Não se aplica';
    const formatted = String(val).padStart(2, '0');
    const match = SINTER_DOMAINS.bice.find(item => item.code === formatted);
    return match ? `${match.code} - ${match.desc}` : `Código ${val}`;
  };

  const getDestinacaoImovel = (val: any) => {
    const formatted = String(val).padStart(2, '0');
    const match = SINTER_DOMAINS.destinacaoImovel.find(item => item.code === formatted);
    return match ? `${match.code} - ${match.desc}` : `Código ${val}`;
  };

  const getPadraoConstrutivo = (val: any) => {
    const formatted = String(val).padStart(2, '0');
    const match = SINTER_DOMAINS.padraoConstrutivo.find(item => item.code === formatted);
    return match ? `${match.code} - ${match.desc}` : `Código ${val}`;
  };

  const getTipoTitularidade = (val: any) => {
    const formatted = String(val).padStart(2, '0');
    const match = SINTER_DOMAINS.tipoTitularidade.find(item => item.code === formatted);
    return match ? `${match.code} - ${match.desc}` : `Código ${val}`;
  };

  const getDocTitularidade = (val: any) => {
    const formatted = String(val).padStart(2, '0');
    const match = SINTER_DOMAINS.docTitularidade.find(item => item.code === formatted);
    return match ? `${match.code} - ${match.desc}` : `Código ${val}`;
  };

  const getTipoTransacao = (val: any) => {
    const formatted = String(val).padStart(2, '0');
    const match = SINTER_DOMAINS.tipoTransacao.find(item => item.code === formatted);
    return match ? `${match.code} - ${match.desc}` : `Código ${val}`;
  };

  const getTipoLogradouro = (val: any) => {
    if (val === undefined || val === null) return '';
    const formatted = String(val).padStart(2, '0');
    const match = SINTER_DOMAINS.tipoLogradouro.find(item => item.code === formatted || Number(item.code) === Number(val));
    return match ? `${match.code} - ${match.desc}` : `Código ${val}`;
  };

  const getTipoLogradouroDescOnly = (val: any) => {
    if (val === undefined || val === null) return '';
    const formatted = String(val).padStart(2, '0');
    const match = SINTER_DOMAINS.tipoLogradouro.find(item => item.code === formatted || Number(item.code) === Number(val));
    return match ? match.desc : '';
  };

  const isExtinto = React.useMemo(() => {
    const sit = data?.Cib?.situacao?.toLowerCase();
    return sit === 'extinta' || sit === 'extinto' || sit === 'inativo' || sit === 'desativado';
  }, [data]);

  return (
    <div className={`bg-white rounded-xl border shadow-md overflow-hidden text-slate-800 ${
      isExtinto ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200/90'
    }`}>
      {/* Extinct Warning Banner */}
      {isExtinto && (
        <div className="bg-amber-500 text-slate-950 px-5 py-3 text-xs font-bold flex items-center gap-2.5 border-b border-amber-600">
          <svg className="w-4 h-4 shrink-0 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="leading-tight">
            <span>IMÓVEL EXTINTO / DESATIVADO: Este cadastro (CIB) consta como inativo na base oficial do SINTER.</span>
          </div>
        </div>
      )}

      {/* Header of results with pastel state badge */}
      <div className={`p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b ${
        isExtinto ? 'bg-[#3D2800] text-white border-[#F2A900]/40' : 'bg-[#2B2B2B] text-white border-[#3D3D3D]'
      }`}>
        <div>
          {isExtinto ? (
            <span className="bg-[#FFF4DC] text-[#9E6E00] border border-[#F2A900]/40 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1.5 inline-block">
              Homologado SINTER • Extinto / Inativo
            </span>
          ) : (
            <span className="bg-[#E6F4E6] text-[#006400] border border-[#008000]/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1.5 inline-block">
              HOMOLOGADO SINTER - ATIVO
            </span>
          )}
          <h4 className="font-bold text-base sm:text-lg flex items-center space-x-2 text-white">
            <span>CIB: {data.Cib?.valor || 'Não Informado'}</span>
            {data.DadosGeraisImovel?.inscricaoImobiliaria && (
              <span className="text-xs font-normal text-slate-300">| Inscrição: {data.DadosGeraisImovel.inscricaoImobiliaria}</span>
            )}
          </h4>
        </div>
        {data.Cib?.situacao && (
          <div className="text-xs text-slate-300 font-mono text-right bg-[#1E1E1E] px-3 py-1.5 rounded-md border border-[#3D3D3D]">
            Situação: <span className={`${isExtinto ? 'text-[#F2A900]' : 'text-[#008000]'} font-bold`}>{data.Cib.situacao}</span>
          </div>
        )}
      </div>

      {/* Result Sub Tabs - Material Design Style with Underline */}
      <div className="flex border-b border-slate-200 bg-slate-100/70 overflow-x-auto max-w-full shrink-0">
        {availableTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-5 py-3.5 text-xs sm:text-sm transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              currentTab === tab
                ? 'border-[#00509D] text-[#00509D] bg-white font-bold shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
            }`}
          >
            {tab === 'geral' && 'Visão Geral'}
            {tab === 'endereco' && 'Endereço & Área'}
            {tab === 'proprietario' && 'Proprietários & Cartório'}
            {tab === 'itbi' && 'ITBI & Transação'}
            {tab === 'dominios' && 'Dicionário de Códigos RFB'}
            {tab === 'json' && 'Resposta Bruta (JSON)'}
          </button>
        ))}
      </div>

      {/* Result Content */}
      <div className="p-5 text-slate-800">
        {currentTab === 'geral' && (
          <div className="space-y-6">
            {/* Quick Metrics grid - only show metric cards if the corresponding keys are present in JSON */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.DadosGeraisImovel?.valorVenal !== undefined && data.DadosGeraisImovel?.valorVenal !== null && (
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Valor Venal</span>
                  <span className="text-sm font-black text-slate-900">
                    R$ {data.DadosGeraisImovel.valorVenal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  {data.DadosGeraisImovel.dtUltimoValorVenal && (
                    <span className="text-[9px] text-slate-500 block">Ref: {data.DadosGeraisImovel.dtUltimoValorVenal}</span>
                  )}
                </div>
              )}

              {data.DadosGeraisImovel?.valorRefMercado !== undefined && data.DadosGeraisImovel?.valorRefMercado !== null && (
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Valor Ref. Mercado</span>
                  <span className="text-sm font-black text-rose-950">
                    R$ {data.DadosGeraisImovel.valorRefMercado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  {data.DadosGeraisImovel.dataUltVlrMercado && (
                    <span className="text-[9px] text-slate-500 block">Ref: {data.DadosGeraisImovel.dataUltVlrMercado}</span>
                  )}
                </div>
              )}

              {data.DadosGeraisImovel?.areaConstruida !== undefined && data.DadosGeraisImovel?.areaConstruida !== null && (
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Área Construída</span>
                  <span className="text-sm font-black text-slate-900">
                    {data.DadosGeraisImovel.areaConstruida} m²
                  </span>
                  {data.DadosGeraisImovel.areaTerreno && (
                    <span className="text-[9px] text-slate-500 block">Terreno: {data.DadosGeraisImovel.areaTerreno} m²</span>
                  )}
                </div>
              )}

              {data.DadosGeraisImovel?.tipoImovel !== undefined && data.DadosGeraisImovel?.tipoImovel !== null && (
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tipo de Imóvel</span>
                  <span className="text-xs font-bold text-slate-900 truncate block">
                    {getTipoImovel(data.DadosGeraisImovel.tipoImovel)}
                  </span>
                  {data.DadosGeraisImovel.destinacaoImovel !== undefined && data.DadosGeraisImovel.destinacaoImovel !== null && (
                    <span className="text-[9px] text-slate-500 block">Destinação: {getDestinacaoImovel(data.DadosGeraisImovel.destinacaoImovel)}</span>
                  )}
                </div>
              )}
            </div>

            {/* Detailed table of general values - only render table rows if those keys exist in the JSON */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="p-3">Parâmetro de Registro</th>
                    <th className="p-3">Valor de Cadastro Oficial SINTER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.DadosGeraisImovel?.idParcela && (
                    <tr>
                      <td className="p-3 font-semibold text-slate-600">ID da Parcela Geográfica</td>
                      <td className="p-3 font-mono">{data.DadosGeraisImovel.idParcela}</td>
                    </tr>
                  )}
                  {data.DadosGeraisImovel?.tipoImovel !== undefined && data.DadosGeraisImovel?.tipoImovel !== null && (
                    <tr>
                      <td className="p-3 font-semibold text-slate-600">Tipo de Imóvel (Código)</td>
                      <td className="p-3 font-medium">{getTipoImovel(data.DadosGeraisImovel.tipoImovel)}</td>
                    </tr>
                  )}
                  {data.DadosGeraisImovel?.tpArquitetonico !== undefined && data.DadosGeraisImovel?.tpArquitetonico !== null && (
                    <tr>
                      <td className="p-3 font-semibold text-slate-600">Tipo Arquitetônico</td>
                      <td className="p-3 font-medium">{getTipoArquitetonico(data.DadosGeraisImovel.tpArquitetonico)}</td>
                    </tr>
                  )}
                  {data.DadosGeraisImovel?.anoConstrutivo !== undefined && data.DadosGeraisImovel?.anoConstrutivo !== null && (
                    <tr>
                      <td className="p-3 font-semibold text-slate-600">Ano de Construção</td>
                      <td className="p-3">{data.DadosGeraisImovel.anoConstrutivo} {data.DadosGeraisImovel.bice === 1 ? '(BICE Atualizado)' : ''}</td>
                    </tr>
                  )}
                  {(data.DadosGeraisImovel?.biceCode !== undefined || data.DadosGeraisImovel?.bice !== undefined) && (
                    <tr>
                      <td className="p-3 font-semibold text-slate-600">BICE Especialidade</td>
                      <td className="p-3 text-slate-600">{getBice(data.DadosGeraisImovel.biceCode || data.DadosGeraisImovel.bice)}</td>
                    </tr>
                  )}
                  {data.DadosGeraisImovel?.padraoConstrutivo !== undefined && data.DadosGeraisImovel?.padraoConstrutivo !== null && (
                    <tr>
                      <td className="p-3 font-semibold text-slate-600">Padrão Construtivo da Edificação</td>
                      <td className="p-3 font-medium text-slate-950">{getPadraoConstrutivo(data.DadosGeraisImovel.padraoConstrutivo)}</td>
                    </tr>
                  )}
                  {data.DadosGeraisImovel?.qtdGaragem !== undefined && data.DadosGeraisImovel?.qtdGaragem !== null && (
                    <tr>
                      <td className="p-3 font-semibold text-slate-600">Vagas de Garagem do Imóvel</td>
                      <td className="p-3">{data.DadosGeraisImovel.qtdGaragem} vaga(s)</td>
                    </tr>
                  )}
                  {data.DadosGeraisImovel?.temPiscina !== undefined && data.DadosGeraisImovel?.temPiscina !== null && (
                    <tr>
                      <td className="p-3 font-semibold text-slate-600">Possui Piscina no Cadastro</td>
                      <td className="p-3">{data.DadosGeraisImovel.temPiscina ? '✓ Sim, cadastrado' : 'Não possui'}</td>
                    </tr>
                  )}
                  {data.InfoIbge?.nomeMunicipio && (
                    <tr>
                      <td className="p-3 font-semibold text-slate-600">Município / Estado do Órgão Coletor</td>
                      <td className="p-3 font-medium">{data.InfoIbge.nomeMunicipio} - {data.InfoIbge.siglaUf} (Código IBGE: {data.InfoIbge.codigoIbge})</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentTab === 'endereco' && (
          <div className="space-y-5">
            {data.EnderecoImovel && (
              <>
                <h5 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-1.5">
                  <span>Localização Física do Imóvel</span>
                </h5>
                
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {data.EnderecoImovel.nomeLogradouro && (
                      <div>
                        <span className="text-slate-400 font-semibold block mb-0.5">Endereço Completo</span>
                        <span className="font-bold text-slate-900 text-xs">
                          {data.EnderecoImovel.tipoLogradouro ? `${getTipoLogradouroDescOnly(data.EnderecoImovel.tipoLogradouro)} ` : ''}
                          {data.EnderecoImovel.nomeLogradouro}{data.EnderecoImovel.numeroImovel ? `, Nº ${data.EnderecoImovel.numeroImovel}` : ''}
                        </span>
                      </div>
                    )}
                    {data.EnderecoImovel.tipoLogradouro !== undefined && data.EnderecoImovel.tipoLogradouro !== null && (
                      <div>
                        <span className="text-slate-400 font-semibold block mb-0.5">Tipo de Logradouro (SINTER)</span>
                        <span className="font-bold text-slate-950">
                          {getTipoLogradouro(data.EnderecoImovel.tipoLogradouro)}
                        </span>
                      </div>
                    )}
                    {(data.EnderecoImovel.complNroImovel || data.EnderecoImovel.complEndereco) && (
                      <div>
                        <span className="text-slate-400 font-semibold block mb-0.5">Complemento</span>
                        <span className="font-bold text-slate-900">
                          {[data.EnderecoImovel.complNroImovel, data.EnderecoImovel.complEndereco].filter(Boolean).join(' - ')}
                        </span>
                      </div>
                    )}
                    {data.EnderecoImovel.bairro && (
                      <div>
                        <span className="text-slate-400 font-semibold block mb-0.5">Bairro</span>
                        <span className="font-bold text-slate-900">{data.EnderecoImovel.bairro}</span>
                      </div>
                    )}
                    {data.EnderecoImovel.cep && (
                      <div>
                        <span className="text-slate-400 font-semibold block mb-0.5">Código de Endereçamento Postal (CEP)</span>
                        <span className="font-bold text-slate-900 font-mono">{data.EnderecoImovel.cep}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {data.AreaConstruidaCompl && (
              <>
                <h5 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 pt-2">Detalhamento das Áreas Registradas</h5>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  {data.AreaConstruidaCompl.areaPrivativa !== undefined && data.AreaConstruidaCompl.areaPrivativa !== null && (
                    <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
                      <span className="text-slate-500 font-medium block">Área Privativa Real</span>
                      <span className="text-sm font-bold text-slate-900">{data.AreaConstruidaCompl.areaPrivativa} m²</span>
                    </div>
                  )}
                  {data.AreaConstruidaCompl.areaComum !== undefined && data.AreaConstruidaCompl.areaComum !== null && (
                    <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
                      <span className="text-slate-500 font-medium block">Área Comum Real</span>
                      <span className="text-sm font-bold text-slate-900">{data.AreaConstruidaCompl.areaComum} m²</span>
                    </div>
                  )}
                  {data.AreaConstruidaCompl.fraIdeal !== undefined && data.AreaConstruidaCompl.fraIdeal !== null && (
                    <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
                      <span className="text-slate-500 font-medium block">Fração Ideal de Terreno</span>
                      <span className="text-sm font-bold text-slate-900">{data.AreaConstruidaCompl.fraIdeal}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {currentTab === 'proprietario' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.ServicoRegistroImovel && (
                <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50/50">
                  <h5 className="text-xs font-black text-rose-950 uppercase tracking-wide border-b border-rose-100 pb-1.5 flex items-center justify-between">
                    <span>Serviço de Registro de Imóvel (RI)</span>
                    <span className="bg-rose-100 text-rose-900 text-[9px] font-bold px-1.5 py-0.5 rounded">Cartório</span>
                  </h5>
                  <div className="text-xs space-y-1.5">
                    {data.ServicoRegistroImovel.nomeServentiaRI && (
                      <p><span className="text-slate-500">Nome Oficial:</span> <strong className="text-slate-800 block">{data.ServicoRegistroImovel.nomeServentiaRI}</strong></p>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      {data.ServicoRegistroImovel.cnsRI && (
                        <p><span className="text-slate-500">CNS:</span> <strong className="font-mono text-slate-800">{data.ServicoRegistroImovel.cnsRI}</strong></p>
                      )}
                      {data.ServicoRegistroImovel.cnmRI && (
                        <p><span className="text-slate-500">CNM:</span> <strong className="font-mono text-slate-800">{data.ServicoRegistroImovel.cnmRI}</strong></p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {data.ServicoRegistroImovel.numMatriculaRI && (
                        <p><span className="text-slate-500">Matrícula:</span> <strong className="font-mono text-slate-800">{data.ServicoRegistroImovel.numMatriculaRI}</strong></p>
                      )}
                      {data.ServicoRegistroImovel.numUltimoAtoRI && (
                        <p><span className="text-slate-500">Último Ato:</span> <strong className="font-mono text-slate-800">{data.ServicoRegistroImovel.numUltimoAtoRI}</strong></p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {data.ServicoRegistroImovel.lvCartRI && (
                        <p><span className="text-slate-500">Livro:</span> <strong className="text-slate-800">{data.ServicoRegistroImovel.lvCartRI}</strong></p>
                      )}
                      {data.ServicoRegistroImovel.flCartRI && (
                        <p><span className="text-slate-500">Folha:</span> <strong className="text-slate-800">{data.ServicoRegistroImovel.flCartRI}</strong></p>
                      )}
                    </div>
                    {data.ServicoRegistroImovel.dtUltAtualizacao && (
                      <p><span className="text-slate-500">Última Atualização no SINTER:</span> <strong className="text-slate-700">{data.ServicoRegistroImovel.dtUltAtualizacao}</strong></p>
                    )}
                  </div>
                </div>
              )}

              {data.CartorioNotas && (
                <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50/50">
                  <h5 className="text-xs font-black text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1.5 flex items-center justify-between">
                    <span>Cartório de Notas</span>
                    <span className="bg-slate-200 text-slate-800 text-[9px] font-bold px-1.5 py-0.5 rounded">Escritura</span>
                  </h5>
                  <div className="text-xs space-y-2">
                    {data.CartorioNotas.nomeServentiaNotas && (
                      <p><span className="text-slate-500">Nome da Serventia:</span> <strong className="text-slate-800 block">{data.CartorioNotas.nomeServentiaNotas}</strong></p>
                    )}
                    {data.CartorioNotas.cnsNotas && (
                      <p><span className="text-slate-500">CNS (Código Nacional de Serventias):</span> <strong className="font-mono text-slate-800">{data.CartorioNotas.cnsNotas}</strong></p>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      {data.CartorioNotas.lvCartNotas && (
                        <p><span className="text-slate-500">Livro Notas:</span> <strong className="text-slate-800">{data.CartorioNotas.lvCartNotas}</strong></p>
                      )}
                      {data.CartorioNotas.flCartNotas && (
                        <p><span className="text-slate-500">Folha Notas:</span> <strong className="text-slate-800">{data.CartorioNotas.flCartNotas}</strong></p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {data.Titular && data.Titular.length > 0 && (
              <>
                <h5 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">Titulares e Proprietários Declarados</h5>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                        <th className="p-3">Nome do Titular</th>
                        <th className="p-3">Identificação (NI)</th>
                        <th className="p-3">Tipo de Titularidade</th>
                        <th className="p-3">Documentação</th>
                        <th className="p-3 text-right">Participação</th>
                        <th className="p-3">Data de Aquisição</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.Titular.map((titular: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-3 font-bold text-slate-900">
                            <div className="flex flex-col">
                              <span>{titular.nomeTitular || '---'}</span>
                              {titular.nomeValido && (
                                <span className="text-[9px] text-emerald-600 font-semibold mt-0.5">✓ Nome Confirmado pela RFB</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 font-mono text-slate-600">{titular.niTitular || '---'}</td>
                          <td className="p-3 font-medium text-slate-700">{getTipoTitularidade(titular.tipoTitularidade || titular.tpTitularidade || '01')}</td>
                          <td className="p-3 text-slate-600">{getDocTitularidade(titular.docTitularidade || titular.tpDocTitularidade || '01')}</td>
                          <td className="p-3 text-right font-black text-rose-950">
                            {titular.percTitularidade !== undefined ? `${((titular.percTitularidade) * 100).toFixed(0)}%` : '---'}
                          </td>
                          <td className="p-3 text-slate-600">{titular.dtAquisicaoTitular || '---'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {currentTab === 'itbi' && data.ITBI && (
          <div className="space-y-5">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-3">
              <h5 className="text-xs font-bold text-slate-900">Transação de Imposto de Transmissão (ITBI)</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                {data.ITBI.baseCalculITBI !== undefined && data.ITBI.baseCalculITBI !== null && (
                  <div>
                    <span className="text-slate-500 block mb-0.5">Base de Cálculo Declarada</span>
                    <span className="font-extrabold text-slate-950 text-xs">
                      R$ {data.ITBI.baseCalculITBI.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {data.ITBI.valorRefITBI !== undefined && data.ITBI.valorRefITBI !== null && (
                  <div>
                    <span className="text-slate-500 block mb-0.5">Valor de Referência de ITBI</span>
                    <span className="font-extrabold text-slate-950 text-xs">
                      R$ {data.ITBI.valorRefITBI.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {data.ITBI.dtTransacaoITBI && (
                  <div>
                    <span className="text-slate-500 block mb-0.5">Data da Transação</span>
                    <span className="font-bold text-slate-700">{data.ITBI.dtTransacaoITBI}</span>
                  </div>
                )}
                {data.ITBI.percTransacionadoITBI !== undefined && data.ITBI.percTransacionadoITBI !== null && (
                  <div>
                    <span className="text-slate-500 block mb-0.5">Percentual Transacionado</span>
                    <span className="font-extrabold text-rose-900">{((data.ITBI.percTransacionadoITBI) * 100).toFixed(0)}% do Imóvel</span>
                  </div>
                )}
              </div>
              {data.ITBI.tipoTransacao !== undefined && data.ITBI.tipoTransacao !== null && (
                <div className="pt-2 text-xs border-t border-slate-200 flex items-center space-x-2">
                  <span className="text-slate-500 font-semibold">Tipo de Transação Realizada:</span>
                  <span className="bg-rose-100 text-rose-950 font-black px-2.5 py-1 rounded text-[11px] uppercase tracking-wide">
                    {getTipoTransacao(data.ITBI.tipoTransacao)}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.ITBI.TransmitenteITBI && data.ITBI.TransmitenteITBI.length > 0 && (
                <div className="border border-slate-200 rounded-lg p-4 space-y-2">
                  <h6 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1.5">Transmitente (Vendedor)</h6>
                  <table className="w-full text-xs text-left">
                    <tbody className="divide-y divide-slate-100">
                      {data.ITBI.TransmitenteITBI.map((trans: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-2 pr-2 font-bold text-slate-800">{trans.nomeTransmitenteITBI || '---'}</td>
                          <td className="py-2 text-right text-slate-500 font-mono text-[10px]">{trans.idTransmitenteITBI || '---'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {data.ITBI.AdquirenteITBI && data.ITBI.AdquirenteITBI.length > 0 && (
                <div className="border border-slate-200 rounded-lg p-4 space-y-2">
                  <h6 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1.5">Adquirente (Comprador)</h6>
                  <table className="w-full text-xs text-left">
                    <tbody className="divide-y divide-slate-100">
                      {data.ITBI.AdquirenteITBI.map((adq: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-2 pr-2 font-bold text-slate-800">
                            <div>
                              <span>{adq.nomeAdquirenteITBI || '---'}</span>
                              {adq.percTransacAdquirenteITBI !== undefined && (
                                <span className="text-[9px] text-emerald-600 block font-semibold">Participação: {((adq.percTransacAdquirenteITBI) * 100).toFixed(0)}%</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 text-right text-slate-500 font-mono text-[10px]">{adq.idAdquirenteITBI || '---'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'dominios' && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar códigos ou termos nas tabelas de domínio..."
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                  className="w-full bg-white text-slate-800 text-xs rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-rose-800 border border-slate-300"
                />
              </div>

              {/* Select dictionary category */}
              <div className="flex overflow-x-auto gap-1 max-w-full pb-1 shrink-0">
                {(Object.keys(SINTER_DOMAINS) as Array<keyof typeof SINTER_DOMAINS>).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedDomainTab(key);
                      setDomainFilter('');
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                      selectedDomainTab === key
                        ? 'bg-rose-900 text-white shadow'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {key === 'tipoImovel' && 'Tipo Imóvel'}
                    {key === 'tipoArquitetonico' && 'Tipo Arquitetônico'}
                    {key === 'bice' && 'BICE'}
                    {key === 'destinacaoImovel' && 'Destinação'}
                    {key === 'padraoConstrutivo' && 'Padrão Construtivo'}
                    {key === 'tipoTitularidade' && 'Tipo Titularidade'}
                    {key === 'docTitularidade' && 'Doc Titularidade'}
                    {key === 'tipoDesativacao' && 'Desativação'}
                    {key === 'motivoDesativacao' && 'Motivos Desativação'}
                    {key === 'falhas' && 'Códigos de Falhas'}
                    {key === 'tipoTransacao' && 'Tipo Transação'}
                    {key === 'tipoLogradouro' && 'Tipo Logradouro'}
                  </button>
                ))}
              </div>
            </div>

            {/* Render selected table filtered */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white max-h-[400px] overflow-y-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-3 w-20">Código</th>
                    <th className="p-3 w-40">Título</th>
                    <th className="p-3">Descrição SINTER Oficial (RFB)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {SINTER_DOMAINS[selectedDomainTab]
                    ?.filter(item => 
                      item.code.toLowerCase().includes(domainFilter.toLowerCase()) ||
                      item.title.toLowerCase().includes(domainFilter.toLowerCase()) ||
                      item.desc.toLowerCase().includes(domainFilter.toLowerCase())
                    )
                    .map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-mono font-black text-rose-950 bg-slate-50/30">{item.code}</td>
                        <td className="p-3 font-bold text-slate-900">{item.title}</td>
                        <td className="p-3 text-slate-600 text-[11px] leading-relaxed">{item.desc}</td>
                      </tr>
                    ))}
                  {SINTER_DOMAINS[selectedDomainTab]?.filter(item => 
                    item.code.toLowerCase().includes(domainFilter.toLowerCase()) ||
                    item.title.toLowerCase().includes(domainFilter.toLowerCase()) ||
                    item.desc.toLowerCase().includes(domainFilter.toLowerCase())
                  ).length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-slate-400">
                        Nenhum termo encontrado para &quot;{domainFilter}&quot;.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSubTab === 'json' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
              <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider">Formato JSON de Sucesso (SINTER Schema)</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                  alert('JSON copiado com sucesso para a área de transferência!');
                }}
                className="text-[10px] text-rose-900 hover:text-rose-700 font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copiar JSON</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-[10px] overflow-x-auto max-h-[380px] whitespace-pre">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

