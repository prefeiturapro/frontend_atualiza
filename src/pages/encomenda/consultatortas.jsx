import React, { useState, useEffect } from "react";

function ConsultaTortas() {
  const [encomendas, setEncomendas] = useState([]);
  const [loading, setLoading] = useState(true);

  // CONFIGURAÇÕES
  const ID_CAMILA = 1;
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";

  // STATUS DE PRODUÇÃO
  const ST_PRODUCAO = {
    EM_PRODUCAO: 1,
    PRONTO: 2,
    CANCELADO: 3
  };

  useEffect(() => {
    carregarEncomendas();
    
    // Auto-refresh a cada 15 segundos para pegar novos pedidos
    const interval = setInterval(carregarEncomendas, 15000);
    return () => clearInterval(interval);
  }, []);

  async function carregarEncomendas() {
    try {
      const res = await fetch(`${API_URL}/encomendas`);
      if (!res.ok) throw new Error("Erro ao carregar encomendas");
      const data = await res.json();

      // 1. Filtra Camila
      // 2. Remove o que já foi ENTREGUE ao cliente (st_status = 2) para limpar a tela
      //    (Opcional: se quiser ver os prontos na tela, remova a condição && enc.st_status != 2)
      const minhasEncomendas = data.filter(enc => {
        const idFuncionario = enc.id_empregado || enc.id_usuarios;
        // Se st_status for 2 (entregue ao cliente), sai da tela da cozinha? 
        // Vou assumir que sim, para não poluir.
        return idFuncionario === ID_CAMILA && enc.st_status != 2; 
      });

      // Ordena: Primeiro os Pendentes (1), depois os Prontos (2), depois por hora
      const ordenadas = minhasEncomendas.sort((a, b) => {
        // Prioridade para o que está em produção (1 vem antes de 2)
        const statusA = a.st_producao || 1;
        const statusB = b.st_producao || 1;
        
        if (statusA !== statusB) return statusA - statusB;
        
        // Desempate por hora
        const horaA = a.hr_horaenc || a.hora || "";
        const horaB = b.hr_horaenc || b.hora || "";
        return horaA.localeCompare(horaB);
      });

      setEncomendas(ordenadas);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Função para atualizar o status no Backend
  async function alterarStatusProducao(idEncomenda, novoStatus) {
    // 1. Atualização Otimista (Muda na tela antes de esperar o banco)
    setEncomendas(prev => prev.map(item => 
      item.id_encomendas === idEncomenda 
        ? { ...item, st_producao: novoStatus } 
        : item
    ));

    try {
      // ATENÇÃO: Você precisará criar essa rota no seu backend Node.js
      // Exemplo: app.put('/encomendas/:id/producao', ...)
      await fetch(`${API_URL}/encomendas/${idEncomenda}/producao`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ st_producao: novoStatus })
      });
      
      // Recarrega para garantir
      carregarEncomendas();
      
    } catch (error) {
      alert("Erro ao atualizar status. Verifique a conexão.");
      carregarEncomendas(); // Desfaz a mudança visual se der erro
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      
      {/* HEADER */}
      <div className="bg-blue-700 p-4 text-white shadow-lg sticky top-0 z-20">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider">Cozinha: Camila</h1>
            <p className="text-xs text-blue-200">Controle de Produção</p>
          </div>
          <button onClick={carregarEncomendas} className="p-2 bg-white/10 rounded-full active:bg-white/20">
            Atualizar
          </button>
        </div>
      </div>

      {/* LISTA DE PEDIDOS */}
      <div className="max-w-lg mx-auto p-4 space-y-4">
        
        {loading && <p className="text-center text-gray-500 mt-10">Carregando...</p>}
        
        {!loading && encomendas.length === 0 && (
           <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300 mt-4 opacity-70">
             <p className="text-xl font-medium text-gray-400">Tudo limpo!</p>
             <p className="text-sm text-gray-400">Nenhum pedido pendente.</p>
           </div>
        )}

        {encomendas.map((enc) => {
          // Garante que o status padrão seja 1 se vier nulo
          const statusProducao = enc.st_producao || ST_PRODUCAO.EM_PRODUCAO;
          const isPronto = statusProducao == ST_PRODUCAO.PRONTO;
          const isCancelado = enc.st_status == 3 || statusProducao == ST_PRODUCAO.CANCELADO;

          // Define as cores do cartão baseado no status
          let cardClass = "bg-white border-l-blue-600"; // Padrão (Em produção)
          if (isPronto) cardClass = "bg-green-100 border-l-green-500";
          if (isCancelado) cardClass = "bg-gray-200 border-l-gray-400 opacity-60";

          return (
            <div key={enc.id_encomendas} className={`relative border-l-8 rounded-r-lg shadow-sm flex flex-col transition-all duration-300 ${cardClass}`}>
              
              {/* Parte Superior: Dados do Pedido */}
              <div className="p-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl font-black text-gray-800 tracking-tight">
                      {enc.hr_horaenc || enc.hora}
                    </span>
                    {isPronto && (
                      <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
                        PRONTO
                      </span>
                    )}
                  </div>
                  
                  <h3 className={`text-xl font-bold leading-tight ${isPronto ? 'text-green-900' : 'text-gray-800'}`}>
                    {enc.produto_nome || "Produto sem nome"}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    Cliente: <b>{enc.nm_nomefantasia}</b>
                  </p>
                </div>
              </div>

              {/* Parte Inferior: Botão de Ação (Apenas se não estiver cancelado) */}
              {!isCancelado && (
                <div className="border-t border-black/5">
                  {!isPronto ? (
                    // BOTÃO: MARCAR COMO PRONTO
                    <button
                      onClick={() => alterarStatusProducao(enc.id_encomendas, ST_PRODUCAO.PRONTO)}
                      className="w-full py-4 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold text-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-colors rounded-br-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Marcar Pronto
                    </button>
                  ) : (
                    // BOTÃO: DESFAZER (Voltar para produção)
                    <button
                      onClick={() => alterarStatusProducao(enc.id_encomendas, ST_PRODUCAO.EM_PRODUCAO)}
                      className="w-full py-2 bg-transparent text-gray-400 text-sm hover:text-gray-600 font-medium uppercase"
                    >
                      Desfazer (Voltar para produção)
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ConsultaTortas;