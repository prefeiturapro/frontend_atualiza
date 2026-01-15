import React, { useState, useEffect } from "react";

// Ícone de Fechar
const IconClose = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export function DetalhesTortas({ encomenda, onClose }) {
  const [zoomImagem, setZoomImagem] = useState(false);
  const [imagemUrl, setImagemUrl] = useState(null);

  // URL Base da API (para fallback)
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";

  // --- EFEITO MÁGICO: Converte o Buffer do Banco em Imagem Visível ---
  useEffect(() => {
    if (!encomenda || !encomenda.ds_fototorta) {
        setImagemUrl(null);
        return;
    }

    let urlTemporaria = null;

    // 1. Cenário: Imagem vinda do Banco (Buffer/Binário) - Igual ao Cadastro
    if (encomenda.ds_fototorta.type === 'Buffer' && Array.isArray(encomenda.ds_fototorta.data)) {
        try {
            const buffer = new Uint8Array(encomenda.ds_fototorta.data);
            const blob = new Blob([buffer], { type: 'image/jpeg' });
            urlTemporaria = URL.createObjectURL(blob);
        } catch (err) {
            console.error("Erro ao converter imagem:", err);
        }
    } 
    // 2. Cenário: Imagem vinda como Texto (Nome do arquivo na pasta uploads)
    else if (typeof encomenda.ds_fototorta === 'string') {
        if (encomenda.ds_fototorta.startsWith("http")) {
            urlTemporaria = encomenda.ds_fototorta;
        } else {
            urlTemporaria = `${API_URL}/uploads/${encomenda.ds_fototorta}`;
        }
    }

    setImagemUrl(urlTemporaria);

    // Limpeza de memória quando fechar o modal ou trocar a foto
    return () => {
        if (urlTemporaria && urlTemporaria.startsWith('blob:')) {
            URL.revokeObjectURL(urlTemporaria);
        }
    };
  }, [encomenda]);


  if (!encomenda) return null;

  // Mapeamento dos Opcionais
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
  ].filter(item => item.valor && item.valor != 0 && item.valor != "false" && item.valor != "N");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      
      {/* Container do Modal */}
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* LADO ESQUERDO: FOTO (Com Zoom) */}
        <div className="w-full md:w-1/2 bg-gray-100 relative group min-h-[300px] flex items-center justify-center bg-gray-50">
          {imagemUrl ? (
            <>
              <img 
                src={imagemUrl} 
                alt="Referência da Torta" 
                className="w-full h-full object-contain cursor-zoom-in hover:opacity-95 transition-opacity max-h-[500px]"
                onClick={() => setZoomImagem(true)}
              />
              <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                <span className="bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                  Toque para ampliar
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 p-10">
              <svg className="w-16 h-16 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <span className="text-sm font-medium">Sem foto de referência</span>
            </div>
          )}
        </div>

        {/* LADO DIREITO: DADOS */}
        <div className="w-full md:w-1/2 flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-start bg-blue-50">
                <div>
                    <h2 className="text-xl font-black text-blue-900 uppercase">DETALHES DA PRODUÇÃO</h2>
                    <p className="text-sm text-blue-600 font-bold uppercase">{encomenda.nm_nomefantasia}</p>
                </div>
                <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-500 hover:text-red-600 shadow-sm hover:bg-red-50 transition-colors">
                    <IconClose />
                </button>
            </div>

            {/* Corpo com Scroll */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
                
                {/* RECHEIO E DECORAÇÃO */}
                <div className="space-y-4">
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 shadow-sm">
                        <label className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider block mb-1">Recheio</label>
                        <p className="text-lg font-bold text-gray-800 leading-tight">
                            {encomenda.ds_recheio || "Não informado"}
                        </p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 shadow-sm">
                        <label className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block mb-1">Decoração</label>
                        <p className="text-lg font-bold text-gray-800 leading-tight">
                            {encomenda.ds_decoracao || "Não informado"}
                        </p>
                    </div>
                </div>

                {/* TAMANHO */}
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
                                <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold border border-green-200 shadow-sm">
                                    ✓ {op.label}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* OBSERVAÇÕES */}
                {(encomenda.ds_obstortas || encomenda.ds_observacao) && (
                    <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                        <label className="text-xs font-bold text-red-500 uppercase flex items-center gap-1">
                             Observações Importantes
                        </label>
                        <p className="text-gray-700 italic mt-2 bg-red-50 p-3 rounded-lg border border-red-100 text-sm">
                            "{encomenda.ds_obstortas || encomenda.ds_observacao}"
                        </p>
                    </div>
                )}
            </div>
            
            {/* Rodapé Mobile */}
            <div className="p-4 border-t border-gray-100 md:hidden">
                <button onClick={onClose} className="w-full py-3 bg-gray-800 text-white font-bold rounded-lg shadow-lg">
                    Fechar
                </button>
            </div>
        </div>
      </div>

      {/* MODAL DE ZOOM FULLSCREEN */}
      {zoomImagem && imagemUrl && (
        <div 
            className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-2 cursor-zoom-out"
            onClick={() => setZoomImagem(false)}
        >
            <img 
                src={imagemUrl} 
                alt="Zoom Torta" 
                className="max-w-full max-h-full object-contain" 
            />
            <button className="absolute top-6 right-6 text-white bg-white/20 hover:bg-white/40 p-3 rounded-full transition-colors">
                <IconClose />
            </button>
        </div>
      )}

    </div>
  );
}