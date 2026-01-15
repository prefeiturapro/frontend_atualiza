import React, { useState } from "react";

// Ícone de Fechar
const IconClose = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export function DetalhesTortas({ encomenda, onClose }) {
  const [zoomImagem, setZoomImagem] = useState(false);

  if (!encomenda) return null;

  // URL Base da API
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";
  
  // 1. CORREÇÃO DA FOTO: Usando o campo 'ds_fototorta'
  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    // Se a pasta de uploads no servidor for diferente de '/uploads', altere aqui
    return `${API_URL}/uploads/${img}`; 
  };

  const imagemUrl = getImageUrl(encomenda.ds_fototorta);

  // 2. CORREÇÃO DOS OPCIONAIS: Mapeando seus campos 'ds_'
  // A lógica verifica se o valor existe e não é falso/zero
  const opcionais = [
    { label: "Formato Redondo", valor: encomenda.ds_redonda },
    { label: "Formato Quadrado", valor: encomenda.ds_quadrada },
    { label: "Topo de Bolo", valor: encomenda.ds_topo },
    { label: "Papel Arroz", valor: encomenda.ds_papel },
    { label: "Gliter", valor: encomenda.ds_gliter },
    { label: "Pó Decorativo", valor: encomenda.ds_po },
    { label: "Dec. Menino", valor: encomenda.ds_menino },
    { label: "Dec. Menina", valor: encomenda.ds_menina },
    { label: "Dec. Homem", valor: encomenda.ds_homem },
    { label: "Dec. Mulher", valor: encomenda.ds_mulher },
    { label: "Tabuleiro", valor: encomenda.ds_tabuleiro },
    { label: "Cake Board", valor: encomenda.ds_cafeboard },
  ].filter(item => item.valor && item.valor != 0 && item.valor != "false");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      
      {/* Container do Modal */}
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* LADO ESQUERDO: FOTO (Com Zoom) */}
        <div className="w-full md:w-1/2 bg-gray-100 relative group min-h-[300px]">
          {imagemUrl ? (
            <>
              <img 
                src={imagemUrl} 
                alt="Referência da Torta" 
                className="w-full h-full object-cover cursor-zoom-in hover:opacity-95 transition-opacity"
                onClick={() => setZoomImagem(true)}
                onError={(e) => {
                    // Se der erro ao carregar a imagem, mostra o ícone de 'sem foto'
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex'; // Mostra a div de fallback
                }}
              />
              {/* Fallback caso a imagem quebre */}
              <div className="hidden w-full h-full flex-col items-center justify-center text-gray-400 absolute inset-0">
                  <span>Imagem não encontrada</span>
              </div>

              <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                <span className="bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Toque para ampliar
                </span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <span>Sem foto de referência</span>
            </div>
          )}
        </div>

        {/* LADO DIREITO: DADOS */}
        <div className="w-full md:w-1/2 flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-start bg-blue-50">
                <div>
                    <h2 className="text-xl font-black text-blue-900 uppercase">Detalhes da Produção</h2>
                    <p className="text-sm text-blue-600 font-bold">{encomenda.nm_nomefantasia}</p>
                </div>
                <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-500 hover:text-red-600 shadow-sm hover:bg-red-50 transition-colors">
                    <IconClose />
                </button>
            </div>

            {/* Corpo com Scroll */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
                
                {/* RECHEIO E DECORAÇÃO */}
                <div className="space-y-4">
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                        <label className="text-xs font-bold text-yellow-600 uppercase">Recheio</label>
                        <p className="text-lg font-bold text-gray-800 leading-tight">
                            {encomenda.ds_recheio || "Não informado"}
                        </p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <label className="text-xs font-bold text-purple-600 uppercase">Decoração</label>
                        <p className="text-lg font-bold text-gray-800 leading-tight">
                            {encomenda.ds_decoracao || "Não informado"}
                        </p>
                    </div>
                </div>

                {/* TAMANHO (Agora usando vl_tamanho) */}
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Tamanho / Peso</label>
                    <p className="text-2xl font-black text-gray-800">
                        {encomenda.vl_tamanho || "---"} <span className="text-sm text-gray-500 font-normal">kg</span>
                    </p>
                </div>

                {/* ADICIONAIS (Tags) */}
                {opcionais.length > 0 && (
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Opcionais & Acessórios</label>
                        <div className="flex flex-wrap gap-2">
                            {opcionais.map((op, idx) => (
                                <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm font-bold border border-green-200">
                                    ✓ {op.label}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* OBSERVAÇÕES (Agora usando ds_obstortas) */}
                {(encomenda.ds_obstortas || encomenda.ds_observacao) && (
                    <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                        <label className="text-xs font-bold text-red-500 uppercase">⚠ Observações Importantes</label>
                        <p className="text-gray-700 italic mt-1 bg-red-50 p-3 rounded-lg border border-red-100">
                            "{encomenda.ds_obstortas || encomenda.ds_observacao}"
                        </p>
                    </div>
                )}
            </div>
            
            {/* Rodapé Mobile */}
            <div className="p-4 border-t border-gray-100 md:hidden">
                <button onClick={onClose} className="w-full py-3 bg-gray-800 text-white font-bold rounded-lg">
                    Fechar Detalhes
                </button>
            </div>
        </div>
      </div>

      {/* MODAL DE ZOOM FULLSCREEN */}
      {zoomImagem && imagemUrl && (
        <div 
            className="fixed inset-0 z-[60] bg-black flex items-center justify-center p-2 cursor-zoom-out"
            onClick={() => setZoomImagem(false)}
        >
            <img 
                src={imagemUrl} 
                alt="Zoom Torta" 
                className="max-w-full max-h-full object-contain" 
            />
            <button className="absolute top-4 right-4 text-white bg-white/20 p-2 rounded-full">
                <IconClose />
            </button>
        </div>
      )}

    </div>
  );
}