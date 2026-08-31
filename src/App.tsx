import React from 'react';
import { Navbar } from './components/Navbar';
import { ServiceMenu } from './components/ServiceMenu';

export default function App() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-900 flex flex-col antialiased">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ServiceMenu />
      </main>

      {/* Footer */}
      <footer className="bg-[#2B2B2B] text-slate-300 border-t border-[#3A3A3A] py-6 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© {new Date().getFullYear()} Prefeitura Municipal de Ilhéus — Secretaria da Fazenda e Orçamento. Todos os direitos reservados.</p>
          <p className="text-slate-400">
            Painel Oficial de Integração Homologada em Tempo Real com o SINTER (Receita Federal do Brasil).
          </p>
        </div>
      </footer>
    </div>
  );
}
