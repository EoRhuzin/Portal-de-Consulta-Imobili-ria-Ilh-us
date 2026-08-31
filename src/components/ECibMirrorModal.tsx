import React, { useRef } from 'react';
import { Printer, X, FileText } from 'lucide-react';

interface ECibMirrorModalProps {
  data: any;
  onClose: () => void;
}

export const ECibMirrorModal: React.FC<ECibMirrorModalProps> = ({ data, onClose }) => {
  const printContainerRef = useRef<HTMLDivElement>(null);

  // Extract CIB value
  const cibVal = (data?.Cib?.valor || data?.cib || 'C5SXGEBV').toUpperCase();

  // Extract address
  const enderecoObj = data?.EnderecoImovel || {};
  const nomeLogradouro = enderecoObj.nomeLogradouro || '';
  const numLogradouro = enderecoObj.numeroLogradouro ? `, ${enderecoObj.numeroLogradouro}` : '';
  const complemento = enderecoObj.complemento ? ` - ${enderecoObj.complemento}` : '';
  const bairro = enderecoObj.bairro ? ` - ${enderecoObj.bairro}` : '';
  const municipio = enderecoObj.nomeMunicipio || 'ILHÉUS';
  const uf = enderecoObj.uf || 'BA';

  const enderecoCompleto = [
    `${nomeLogradouro}${numLogradouro}${complemento}`.trim(),
    bairro.replace(/^ - /, ''),
    `${municipio}-${uf}`
  ].filter(Boolean).join(' - ').toUpperCase() || 'RUA DOS FLAMINGOS, 100 - RESIDENCIAL CAPITÃES DE AREIA - 5º ANDAR APT/504 NOSSA SENHORA DA VITÓRIA - ILHÉUS-BA';

  // Area calculation
  const areaTerreno = data?.DadosGeraisImovel?.areaTerreno
    ? Number(data.DadosGeraisImovel.areaTerreno).toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
    : '900,0000';

  const areaConstruida = data?.DadosGeraisImovel?.areaConstruida
    ? Number(data.DadosGeraisImovel.areaConstruida).toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
    : '72,3300';

  // Tipo Imovel
  const tipoImovelCode = data?.DadosGeraisImovel?.tipoImovel;
  const tipoImovelText = tipoImovelCode === '01' ? 'Territorial' : tipoImovelCode === '02' ? 'Predial' : 'Urbano';

  // Situacao
  const situacao = data?.Cib?.situacao || 'Ativa';
  const fonte = data?.DadosGeraisImovel?.nomeFonteInfo || 'Prefeitura Municipal de Ilhéus / BA';
  const denominacao = data?.DadosGeraisImovel?.denominacao || '---';

  const dataEmissao = new Date().toLocaleDateString('pt-BR');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      {/* Printable styles injected dynamically */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #ecib-printable-document, #ecib-printable-document * {
            visibility: visible !important;
          }
          #ecib-printable-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 15mm 15mm !important;
            background: white !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-300">
        
        {/* Modal Header Bar */}
        <div className="no-print bg-[#1E293B] text-white px-6 py-4 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/30 rounded-lg border border-blue-400/30 text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Espelho do e-CIB</h3>
              <p className="text-xs text-slate-300">Secretaria da Fazenda e Orçamento – Prefeitura Municipal de Ilhéus</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-[#00509D] hover:bg-[#003B75] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/60 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Preview Area */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100/80 flex justify-center">
          
          {/* Printable Document Sheet (A4 Proportion) */}
          <div
            id="ecib-printable-document"
            ref={printContainerRef}
            className="bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] p-6 sm:p-10 shadow-lg border border-slate-300 font-sans text-xs flex flex-col justify-between"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            <div>
              {/* Header: Prefeitura Municipal de Ilhéus / Secretaria da Fazenda e Orçamento Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
                <h4 className="font-bold text-xs tracking-wider uppercase text-slate-900">
                  Prefeitura Municipal de Ilhéus – Estado da Bahia
                </h4>
                <h5 className="font-extrabold text-sm uppercase text-slate-900 leading-tight mt-0.5">
                  Secretaria da Fazenda e Orçamento
                </h5>
                <p className="text-[11px] font-semibold uppercase text-slate-700 mt-1">
                  Cadastro Imobiliário Municipal / Integração SINTER
                </p>
                
                <div className="mt-3 pt-2 border-t border-slate-300 inline-block px-6">
                  <h3 className="font-black text-base uppercase tracking-tight text-slate-900">
                    Espelho do e-CIB
                  </h3>
                  <p className="text-[11px] text-slate-600 font-medium uppercase">
                    Consulta de Dados Cadastrais do Imóvel
                  </p>
                </div>
              </div>

              {/* SECTION: Dados Descritivos */}
              <div className="mb-6">
                <h4 className="font-bold text-sm text-slate-900 mb-2">Dados Descritivos</h4>

                <div className="border border-slate-800 divide-y divide-slate-800 text-[11px]">
                  {/* Row 1: CIB | TIPO DE IMÓVEL | ÁREA */}
                  <div className="grid grid-cols-12 divide-x divide-slate-800 bg-white">
                    <div className="col-span-3 p-2.5">
                      <span className="block text-[8.5px] font-bold text-slate-700 uppercase">CIB</span>
                      <span className="font-bold text-slate-900 font-mono text-xs">{cibVal}</span>
                    </div>
                    <div className="col-span-3 p-2.5">
                      <span className="block text-[8.5px] font-bold text-slate-700 uppercase">Tipo de Imóvel</span>
                      <span className="text-slate-900 font-medium">{tipoImovelText}</span>
                    </div>
                    <div className="col-span-6 p-2.5">
                      <span className="block text-[8.5px] font-bold text-slate-700 uppercase">Área</span>
                      <div className="text-slate-900 font-medium leading-tight">
                        <div>Área do Terreno: {areaTerreno} m²</div>
                        <div>Área Construída: {areaConstruida} m²</div>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: ENDEREÇO / LOCALIZAÇÃO DO IMÓVEL */}
                  <div className="p-2.5 bg-white">
                    <span className="block text-[8.5px] font-bold text-slate-700 uppercase">Endereço / Localização do Imóvel</span>
                    <span className="font-bold text-slate-900 leading-tight block uppercase mt-0.5">
                      {enderecoCompleto}
                    </span>
                  </div>

                  {/* Row 3: CADASTRO DE ORIGEM | SITUAÇÃO CADASTRAL */}
                  <div className="grid grid-cols-12 divide-x divide-slate-800 bg-white">
                    <div className="col-span-8 p-2.5">
                      <span className="block text-[8.5px] font-bold text-slate-700 uppercase">Cadastro de Origem / Fonte da Informação</span>
                      <span className="font-semibold text-slate-900">{fonte}</span>
                    </div>
                    <div className="col-span-4 p-2.5">
                      <span className="block text-[8.5px] font-bold text-slate-700 uppercase">Situação Cadastral</span>
                      <span className="font-bold text-slate-900">{situacao}</span>
                    </div>
                  </div>

                  {/* Row 4: DENOMINAÇÃO | DATA DE EMISSÃO */}
                  <div className="grid grid-cols-12 divide-x divide-slate-800 bg-white">
                    <div className="col-span-8 p-2.5">
                      <span className="block text-[8.5px] font-bold text-slate-700 uppercase">Denominação</span>
                      <span className="text-slate-800">{denominacao}</span>
                    </div>
                    <div className="col-span-4 p-2.5">
                      <span className="block text-[8.5px] font-bold text-slate-700 uppercase">Data de Emissão</span>
                      <span className="font-bold text-slate-900 font-mono">{dataEmissao}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Observação */}
              <div className="mt-6 p-3 border border-slate-400 bg-slate-50/50 rounded text-[10px] text-slate-800 leading-relaxed space-y-1.5">
                <p>
                  <strong>Observação:</strong> A inscrição do titular no Cadastro Imobiliário Municipal possui finalidade exclusivamente tributária e cadastral, não constituindo prova de propriedade, domínio ou posse do imóvel.
                </p>
                <p>
                  A presente certidão reflete exclusivamente as informações constantes no Cadastro Imobiliário Municipal na data de sua emissão e é expedida para os fins solicitados pelo interessado.
                </p>
              </div>
            </div>

            {/* Clean Municipal Footer */}
            <div className="mt-auto pt-4 border-t border-slate-300 text-center text-[10px] text-slate-600">
              <p className="font-semibold text-slate-800">
                Prefeitura Municipal de Ilhéus — Secretaria da Fazenda e Orçamento
              </p>
              <p className="mt-0.5">
                Documento emitido para simples consulta do espelho do e-CIB.
              </p>
            </div>

          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="no-print bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Espelho do e-CIB — Secretaria da Fazenda e Orçamento de Ilhéus / BA.
          </span>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Fechar
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-[#00509D] hover:bg-[#003B75] text-white text-xs font-bold rounded-lg transition-colors flex items-center space-x-2 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Baixar espelho do e-CIB (PDF)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
