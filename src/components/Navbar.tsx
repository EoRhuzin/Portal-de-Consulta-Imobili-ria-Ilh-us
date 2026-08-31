import React from 'react';

// Official SVG Crest of Municipality of Ilhéus
export const IlheusCoatOfArms: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => {
  return (
    <svg className={className} viewBox="0 0 120 135" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Mural Crown (Coroa Mural de 5 Torres - Cidade) */}
      <g id="crown">
        <path d="M 25 25 L 30 10 L 42 18 L 60 8 L 78 18 L 90 10 L 95 25 Z" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
        <rect x="33" y="16" width="6" height="8" fill="#FEF3C7" stroke="#92400E" strokeWidth="1" />
        <rect x="57" y="14" width="6" height="8" fill="#FEF3C7" stroke="#92400E" strokeWidth="1" />
        <rect x="81" y="16" width="6" height="8" fill="#FEF3C7" stroke="#92400E" strokeWidth="1" />
        <path d="M 23 25 L 97 25 L 94 30 L 26 30 Z" fill="#B45309" stroke="#78350F" strokeWidth="1" />
      </g>

      {/* Main Shield (Escudo Português) */}
      <g id="shield">
        <path d="M 25 30 L 95 30 C 95 30 96 75 60 105 C 24 75 25 30 25 30 Z" fill="#1E3A8A" stroke="#1E1B4B" strokeWidth="2.5" />
        
        {/* Upper division - Yellow/Gold sky with Sun */}
        <path d="M 26 31 L 94 31 L 94 58 L 26 58 Z" fill="#F59E0B" />
        {/* Sun */}
        <circle cx="60" cy="45" r="9" fill="#FEF08A" stroke="#D97706" strokeWidth="1.5" />
        <path d="M 60 30 L 60 34 M 60 56 L 60 60 M 45 45 L 49 45 M 71 45 L 75 45 M 49 34 L 52 37 M 68 53 L 71 56 M 49 56 L 52 53 M 68 37 L 71 34" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />

        {/* Lower division - Sea Waves & Land */}
        <path d="M 26 58 C 38 52 48 64 60 58 C 72 52 82 64 94 58 L 94 85 C 80 100 60 104 60 104 C 60 104 40 100 26 85 Z" fill="#0284C7" />

        {/* Waves */}
        <path d="M 27 68 C 37 63 47 73 60 68 C 73 63 83 73 93 68" stroke="#E0F2FE" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M 29 78 C 39 73 49 83 60 78 C 71 73 81 83 91 78" stroke="#BAE6FD" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Cocoa Pod Motif (Cacau da Costa do Cacau - Ilhéus) */}
        <g id="cocoa" transform="translate(60, 84) scale(0.95)">
          <path d="M 0 -14 C 10 -12 14 0 0 14 C -14 0 -10 -12 0 -14 Z" fill="#D97706" stroke="#78350F" strokeWidth="1.5" />
          <path d="M 0 -14 Q 4 0 0 14" stroke="#FDE68A" strokeWidth="1" strokeLinecap="round" fill="none" />
          <path d="M -4 -8 Q 0 0 -4 8" stroke="#B45309" strokeWidth="1" strokeLinecap="round" fill="none" />
          <path d="M 4 -8 Q 0 0 4 8" stroke="#B45309" strokeWidth="1" strokeLinecap="round" fill="none" />
        </g>
      </g>

      {/* Flanking Cocoa Branches */}
      <g id="branches" stroke="#15803D" strokeWidth="2" strokeLinecap="round">
        {/* Left Branch */}
        <path d="M 23 45 Q 12 60 18 90" fill="none" />
        <path d="M 16 52 Q 8 50 12 44" fill="#166534" stroke="#14532D" strokeWidth="1" />
        <path d="M 18 66 Q 8 68 10 60" fill="#166534" stroke="#14532D" strokeWidth="1" />
        <path d="M 20 80 Q 10 84 14 76" fill="#166534" stroke="#14532D" strokeWidth="1" />
        {/* Right Branch */}
        <path d="M 97 45 Q 108 60 102 90" fill="none" />
        <path d="M 104 52 Q 112 50 108 44" fill="#166534" stroke="#14532D" strokeWidth="1" />
        <path d="M 102 66 Q 112 68 110 60" fill="#166534" stroke="#14532D" strokeWidth="1" />
        <path d="M 100 80 Q 110 84 106 76" fill="#166534" stroke="#14532D" strokeWidth="1" />
      </g>

      {/* Official Ribbon Banner */}
      <g id="ribbon">
        <path d="M 10 102 L 30 100 L 60 110 L 90 100 L 110 102 L 102 116 L 90 110 L 60 122 L 30 110 L 18 116 Z" fill="#1E3A8A" stroke="#0F172A" strokeWidth="1.5" />
        <text x="60" y="117" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.8">ILHÉUS</text>
      </g>
    </svg>
  );
};

export const Navbar: React.FC = () => {
  const [logoLoaded, setLogoLoaded] = React.useState(true);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs font-sans">
      {/* Main Clean Institutional Navigation Bar - Pure White Background */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3.5 sm:py-5 min-h-[76px] sm:min-h-[96px]">
          {/* Top Left: Official Logo of Prefeitura de Ilhéus & Portal Title */}
          <div className="flex items-center space-x-3 sm:space-x-5 min-w-0">
            {/* Municipality Logo Image with Breathing Space */}
            <a href="./" className="flex items-center shrink-0 group py-1">
              {logoLoaded ? (
                <img
                  src="https://www.ilheus.net/wp-content/uploads/2025/01/IMG-20250103-WA0502.jpg"
                  alt="Prefeitura Municipal de Ilhéus"
                  onError={() => setLogoLoaded(false)}
                  className="h-10 sm:h-16 lg:h-18 w-auto object-contain transition-transform group-hover:scale-[1.01]"
                />
              ) : (
                <div className="p-1.5 sm:p-2 rounded-lg bg-slate-50 border border-slate-200/80 shadow-xs flex items-center justify-center shrink-0">
                  <IlheusCoatOfArms className="w-10 h-11 sm:w-12 sm:h-14" />
                </div>
              )}
            </a>

            {/* Vertical Divider Line */}
            <div className="h-9 sm:h-12 w-px bg-slate-200 shrink-0"></div>

            {/* Double-Line Typography Hierarchy */}
            <div className="flex flex-col justify-center min-w-0">
              <h1 className="text-sm sm:text-xl lg:text-2xl font-extrabold text-[#2B2B2B] tracking-tight leading-snug truncate sm:whitespace-normal">
                Portal de Consulta Cadastro Imobiliário Brasileiro (CIB)
              </h1>
              <p className="text-[10px] sm:text-xs lg:text-sm font-normal text-slate-500 mt-0.5 leading-tight truncate sm:whitespace-normal">
                Secretaria da Fazenda e Orçamento – Ilhéus/BA
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
