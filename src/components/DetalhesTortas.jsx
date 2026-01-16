import React from 'react';

export const DetalhesTortas = ({ encomenda, onClose }) => {
  if (!encomenda) return null;

  // Função para processar a imagem vinda do banco (Buffer ou Base64)
  const getImagemSrc = (enc) => {
    // 1. Se já vier como string Base64 pronta (alguns bancos salvam assim)
    if (typeof enc.ds_fototorta === 'string') {
        return `data:image/jpeg;base64,${enc.ds_fototorta}`;
    }
    // 2. Se vier como Buffer do Postgres ({ type: 'Buffer', data: [...] })
    if (enc.ds_fototorta && enc.ds_fototorta.data) {
        const base64String = btoa(
            new Uint8Array(enc.ds_fototorta.data)
                .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        return `data:image/jpeg;base64,${base64String}`;
    }
    return null; // Sem foto
  };

  const imagemSrc = getImagemSrc(encomenda);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      
      {/* Container Principal - Responsivo */}
      {/* Mobile: Flex-col (Vertical) | Desktop: Flex-row (Horizontal) */}
      <div className="bg-white w-full max-w-5xl h-[90vh] md:h-auto md:max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
        
        {/* BOTÃO FECHAR (X) - Flutuante para fácil acesso */}
        <button 
            onClick={onClose}
            className="absolute top-3 right-3 z-50 bg-white/90 text-gray-800 p-2 rounded-full shadow-lg hover:bg-red-50 hover:text-red-600 transition-all border border-gray-200"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        {/* --- LADO ESQUERDO (OU TOPO NO MOBILE): FOTO --- */}
        <div className="w-full md:w-1/2 bg-gray-100 flex items-center justify-center relative shrink-0">
            {imagemSrc ? (
                <div className="w-full h-56 md:h-full relative group">
                    <img 
                        src={imagemSrc} 
                        alt="Foto da Torta" 
                        className="w-full h-full object-cover md:object-contain bg-gray-50"
                    />
                    {/* Botão de ampliar só visual */}
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm md:hidden">
                        Ver Foto
                    </div>
                </div>
            ) : (
                <div className="h-40 md:h-full flex flex-col items-center justify-center text-gray-400">
                    <svg className="w-16 h-16 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span className="text-sm">Sem foto anexada</span>
                </div>
            )}
        </div>

        {/* --- LADO DIREITO (OU BAIXO NO MOBILE): INFORMAÇÕES --- */}
        <div className="flex-1 flex flex-col min-h-0 bg-white">
            
            {/* Cabeçalho Interno */}
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                    Ordem #{encomenda.id_ordemservicos || encomenda.id_encomendas}
                </p>
                <h2 className="text-2xl font-black text-gray-800 leading-tight uppercase">
                    {encomenda.nm_nomefantasia}
                </h2>
                <div className="flex flex-wrap gap-2 mt-2">
                    {encomenda.vl_tamanho && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold shadow-sm">
                            ⚖️ {encomenda.vl_tamanho} kg
                        </span>
                    )}
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold shadow-sm">
                        📅 {encomenda.dt_formatada}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold shadow-sm">
                        ⏰ {encomenda.hr_horaenc}
                    </span>
                </div>
            </div>

            {/* Conteúdo Rolável (Scroll) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                
                {/* CARD RECHEIO (Destaque Principal) */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-sm">
                    <h3 className="text-xs font-extrabold text-yellow-700 uppercase tracking-wider mb-1">
                        🍰 Recheio / Sabor
                    </h3>
                    <p className="text-lg font-bold text-gray-800 leading-snug">
                        {encomenda.ds_recheio || "Padrão / Não informado"}
                    </p>
                </div>

                {/* CARD DECORAÇÃO */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-l-4 border-purple-400 p-4 rounded-r-lg shadow-sm">
                    <h3 className="text-xs font-extrabold text-purple-700 uppercase tracking-wider mb-1">
                        🎨 Decoração / Tema
                    </h3>
                    <p className="text-lg font-bold text-gray-800 leading-snug">
                        {encomenda.ds_decoracao || "Padrão da casa"}
                    </p>
                </div>

                {/* Grid para detalhes menores */}
                <div className="grid grid-cols-2 gap-3">
                    {encomenda.ds_topo && (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase">Topo</span>
                            <span className="font-semibold text-gray-700">{encomenda.ds_topo}</span>
                        </div>
                    )}
                    {encomenda.ds_papel && (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase">Papel Arroz</span>
                            <span className="font-semibold text-gray-700">{encomenda.ds_papel}</span>
                        </div>
                    )}
                    {encomenda.ds_formato && (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase">Formato</span>
                            <span className="font-semibold text-gray-700">{encomenda.ds_formato}</span>
                        </div>
                    )}
                </div>

                {/* OBSERVAÇÕES (Sempre visível se existir) */}
                {encomenda.ds_obstortas && (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
                        <h3 className="text-xs font-bold text-red-600 uppercase mb-1 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            Observações
                        </h3>
                        <p className="text-red-800 font-medium text-sm">
                            {encomenda.ds_obstortas}
                        </p>
                    </div>
                )}
            </div>

            {/* Rodapé fixo dentro do modal (opcional, para status) */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
                <button 
                    onClick={onClose}
                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow hover:bg-blue-700 active:scale-95 transition-all uppercase text-sm tracking-wider"
                >
                    Fechar Visualização
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};