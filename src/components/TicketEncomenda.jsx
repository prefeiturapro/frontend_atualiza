import React, { useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";

const TicketEncomenda = ({ isOpen, onClose, dados }) => {
  const contentRef = useRef();

  // Configuração da impressão
  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    documentTitle: `Pedido_${dados?.id_ordemservicos || '000'}`,
    onAfterPrint: () => console.log("Impressão finalizada"),
  });

  // Tenta imprimir automaticamente ao abrir (pode falhar dependendo do navegador)
  useEffect(() => {
    if (isOpen) {
        // Pequeno delay para garantir que o conteúdo renderizou
        setTimeout(() => {
            handlePrint();
        }, 500);
    }
  }, [isOpen]);

  if (!isOpen || !dados) return null;

  // Formatação de Valores
  const formataData = (dataIso) => {
      if(!dataIso) return "--/--/----";
      return dataIso.split('T')[0].split('-').reverse().join('/');
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:hidden">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        
        {/* CABEÇALHO DO MODAL (Visível apenas na tela) */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                🖨️ Visualizar Impressão
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-red-500 font-bold text-xl">&times;</button>
        </div>

        {/* ÁREA DE ROLAGEM DO CUPOM */}
        <div className="overflow-y-auto p-6 bg-gray-200 flex justify-center">
            
            {/* --- O CUPOM REAL (Área que será impressa) --- */}
            <div ref={contentRef} className="bg-white p-4 w-[80mm] min-h-[100mm] shadow-sm text-[10px] font-mono leading-tight text-black">
                <style type="text/css" media="print">
                    {`
                        @page { size: 80mm auto; margin: 0; }
                        body { margin: 0.5cm; }
                    `}
                </style>

                {/* LOGO / CABEÇALHO */}
                <div className="text-center mb-2">
                    <h1 className="text-sm font-extrabold uppercase">CAFÉ FRANCESA</h1>
                    <p className="mt-1">PEDIDO: #{dados.id_ordemservicos}</p>
                </div>

                <div className="border-b border-dashed border-black my-2"></div>

                {/* DADOS GERAIS */}
                <div className="space-y-1">
                    <p><strong>DATA ENTREGA:</strong> {formataData(dados.dt_abertura)}</p>
                    <p><strong>HORA:</strong> {dados.hr_horaenc}</p>
                    <p><strong>FONE:</strong> {dados.nr_telefone}</p>
                    <p className="uppercase"><strong>CLIENTE:</strong> {dados.nm_nomefantasia}</p>
                </div>

                {/* OBSERVAÇÃO */}
                {dados.observacao && (
                    <div className="mt-2 border border-black p-1 rounded">
                        <p className="font-bold underline">OBSERVAÇÃO GERAL:</p>
                        <p className="uppercase break-words">{dados.observacao}</p>
                    </div>
                )}

                <div className="border-b border-dashed border-black my-2"></div>

                {/* LISTA DE ITENS */}
                <div className="space-y-2">
                    {/* Renderiza as categorias dinamicamente */}
                    <RenderizaGrupo titulo="TORTAS" dados={dados} prefixo="ds_" filtro={['recheio','decoracao']} />
                    <RenderizaGrupo titulo="SALGADINHOS" dados={dados} prefixo="vl_" ignore={['tamanho']} />
                    {/* Você pode adicionar mais grupos aqui se necessário */}
                </div>

                <div className="border-b border-dashed border-black my-4"></div>

                {/* RODAPÉ */}
                <div className="text-center opacity-70 text-[8px]">
                    <p>Obrigado pela preferência!</p>
                    <p className="mt-1">{new Date().toLocaleString()}</p>
                </div>
            </div>
        </div>

        {/* RODAPÉ DO MODAL (BOTOES DE AÇÃO) */}
        <div className="p-4 border-t border-gray-100 flex gap-3 bg-white rounded-b-lg">
            <button 
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-bold"
            >
                Fechar
            </button>
            
            {/* --- O BOTÃO QUE FALTAVA --- */}
            <button 
                onClick={handlePrint}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold flex items-center justify-center gap-2 shadow-lg"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                IMPRIMIR AGORA
            </button>
        </div>
      </div>
    </div>
  );
};

// Componente Auxiliar para listar os itens (Salgados, Bolos, etc)
const RenderizaGrupo = ({ titulo, dados, prefixo, filtro, ignore = [] }) => {
    // Lógica simples para varrer o objeto e achar campos com valor > 0
    const itens = Object.keys(dados).filter(key => {
        // Se for valor numérico (ex: vl_coxinha)
        if (prefixo === 'vl_' && key.startsWith('vl_')) {
            const val = parseFloat(dados[key]);
            return val > 0 && !ignore.includes(key.replace('vl_', ''));
        }
        // Se for texto (ex: ds_recheio)
        if (prefixo === 'ds_' && key.startsWith('ds_') && dados[key]) {
             if (filtro) return filtro.some(f => key.includes(f));
             return true;
        }
        return false;
    });

    if (itens.length === 0) return null;

    return (
        <div className="mb-2">
            <p className="font-bold bg-black text-white px-1 text-center mb-1">{titulo}</p>
            {itens.map(key => {
                const label = key.replace(prefixo, '').replace(/_/g, ' ').toUpperCase();
                const valor = dados[key];
                return (
                    <div key={key} className="flex justify-between border-b border-gray-100 border-dashed">
                        <span>{label}:</span>
                        <span className="font-bold">{valor}</span>
                    </div>
                );
            })}
        </div>
    );
}

export default TicketEncomenda;