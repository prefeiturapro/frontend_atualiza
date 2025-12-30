import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { TicketEncomenda } from "../../components/ticketencomenda"; // Garanta que o nome do arquivo/export esteja correto

// --- ÍCONES ---
const IconSearch = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const IconPlus = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>;
const IconClock = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconPhone = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const IconFilter = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;
const IconCheck = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;
const IconX = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;
const IconPrinter = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>;

const Sidebar = () => (
  <aside className="w-64 bg-white shadow-xl flex flex-col z-10 border-r border-gray-200 hidden md:flex">
    <div className="p-8 flex flex-col items-center justify-center border-b border-gray-100 bg-gray-50/50">
       <img src="/logo-cafe-francesa.png" alt="Logo" className="w-20 h-20 mb-3 object-contain rounded-full bg-white p-1 border border-gray-100 shadow-sm" onError={(e) => {e.target.style.display='none'}} />
       <div className="text-center"><span className="block text-red-700 font-extrabold text-xl tracking-wider">CAFÉ</span><span className="block text-gray-600 font-semibold tracking-wide text-sm">FRANCESA</span></div>
    </div>
  </aside>
);

function ConsultaEncomenda() {
  const navigate = useNavigate();
  const API_URL = "http://127.0.0.1:3001";

  const dataHoje = new Date().toISOString().split('T')[0];

  const [filtros, setFiltros] = useState({
    nm_nomefantasia: "",
    nr_telefone: "",
    dt_abertura: dataHoje,
    hr_horaenc: ""
  });

  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buscaRealizada, setBuscaRealizada] = useState(false);

  // --- LÓGICA DE IMPRESSÃO ---
  const componentRef = useRef(null); 
  const [dadosParaImpressao, setDadosParaImpressao] = useState(null); 

  const handlePrint = useReactToPrint({
      content: () => componentRef.current,
      documentTitle: `Pedido_${dadosParaImpressao?.id_ordemservicos || 'novo'}`,
      onAfterPrint: () => console.log("Impressão finalizada"),
      onPrintError: (error) => console.error("Erro na impressão:", error),
  });

  const prepararImpressao = (item) => {
      console.log("1. Carregando dados para impressão:", item.nm_nomefantasia);
      setDadosParaImpressao(item);
      
      // Delay de segurança para o React atualizar o componente escondido
      setTimeout(() => {
          if (componentRef.current) {
              console.log("2. Ref encontrado. Iniciando janela de impressão...");
              handlePrint();
          } else {
              console.error("ERRO: O componente de impressão não foi encontrado no DOM.");
              alert("Erro técnico: Componente de impressão não carregou.");
          }
      }, 500);
  };
  // ---------------------------

  useEffect(() => {
    handlePesquisar();
  }, []);

  const handleChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const mascaraTelefone = (valor) => {
    valor = valor.replace(/\D/g, "").substring(0, 11);
    if (valor.length <= 10) {
        valor = valor.replace(/^(\d{2})(\d)/, "$1-$2").replace(/-(\d{4})(\d)/, "-$1-$2");
    } else {
        valor = valor.replace(/^(\d{2})(\d)/, "$1-$2").replace(/-(\d{5})(\d)/, "-$1-$2");
    }
    return valor;
  };

  const handlePhoneChange = (e) => {
    setFiltros({ ...filtros, nr_telefone: mascaraTelefone(e.target.value) });
  };

  const handlePesquisar = async (e) => {
    if(e) e.preventDefault();
    setLoading(true);
    setBuscaRealizada(true);

    try {
      const response = await fetch(`${API_URL}/encomendas/filtrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filtros)
      });

      if (response.ok) {
        const data = await response.json();
        setResultados(data);
      } else {
        alert("Erro ao buscar encomendas.");
      }
    } catch (error) {
      console.error("Erro na busca:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e, id, novoStatus) => {
    e.stopPropagation();

    const acao = novoStatus === 2 ? "CONCLUIR" : "CANCELAR";
    if (!window.confirm(`Deseja realmente ${acao} está encomenda?`)) return;

    try {
        const response = await fetch(`${API_URL}/encomendas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ st_status: novoStatus })
        });

        if (response.ok) {
            setResultados(prev => prev.map(item => 
                item.id_ordemservicos === id ? { ...item, st_status: novoStatus } : item
            ));
        } else {
            alert("Erro ao atualizar status");
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro de conexão");
    }
  };

  const handleEditar = (encomenda) => {
    navigate('/cadastro-encomendas', { state: { encomendaParaEditar: encomenda } });
  };

  const handleNovaEncomenda = () => {
    navigate('/cadastro-encomendas');
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* --- COMPONENTE INVISÍVEL PARA IMPRESSÃO ---
            Técnica corrigida: 
            1. Usamos overflow hidden com altura/largura zero (não display none).
            2. REMOVEMOS A CONDIÇÃO {dados && ...}. O componente é renderizado sempre.
               Isso garante que o 'ref' sempre aponte para um elemento DOM real.
        */}
        <div style={{ overflow: "hidden", height: 0, width: 0 }}>
            <div ref={componentRef}>
                <TicketEncomenda dados={dadosParaImpressao} />
            </div>
        </div>

        <header className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center shadow-sm z-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-red-600 bg-red-50 p-2 rounded-lg"><IconSearch /></span>
              Consulta de Encomendas
            </h1>
            <p className="text-sm text-gray-500 mt-1">Gerencie e localize pedidos rapidamente.</p>
          </div>
          
          <div className="flex gap-3">
             <button onClick={() => navigate('/menu')} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                Voltar Menu
             </button>
             <button onClick={handleNovaEncomenda} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                <IconPlus /> Nova Encomenda
             </button>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          
          <form onSubmit={handlePesquisar} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8 animate-fadeIn">
            <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold border-b border-gray-100 pb-2">
                <IconFilter /> Filtros de Pesquisa
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cliente</label>
                <input type="text" name="nm_nomefantasia" value={filtros.nm_nomefantasia} onChange={handleChange} placeholder="Nome do cliente..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50" />
              </div>
              
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone</label>
                <input type="text" name="nr_telefone" value={filtros.nr_telefone} onChange={handlePhoneChange} placeholder="(00) 00000-0000" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data</label>
                <input type="date" name="dt_abertura" value={filtros.dt_abertura} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hora</label>
                <input type="time" name="hr_horaenc" value={filtros.hr_horaenc} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50" />
              </div>

              <div className="md:col-span-1 flex items-end">
                <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-colors shadow-sm flex justify-center items-center">
                  {loading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : <IconSearch />}
                </button>
              </div>
            </div>
          </form>

          <div className="space-y-4">
            {resultados.length > 0 ? (
              resultados.map((item, index) => {
                
                const status = item.st_status;
                let cardColorClass = "border-gray-200 hover:border-gray-300";
                let badgeClass = "bg-gray-100 text-gray-700 border-gray-200";
                let statusText = "Desconhecido";

                if (status == 1) { 
                    cardColorClass = "border-yellow-200 bg-yellow-50/30 hover:border-yellow-400";
                    badgeClass = "bg-yellow-100 text-yellow-800 border-yellow-200";
                    statusText = "🕒 Aguardando";
                } else if (status == 2) { 
                    cardColorClass = "border-green-200 bg-green-50/30 hover:border-green-400";
                    badgeClass = "bg-green-100 text-green-800 border-green-200";
                    statusText = "✅ Entrega realizada";
                } else if (status == 3) {
                    cardColorClass = "border-red-200 bg-red-50/30 hover:border-red-400 opacity-75";
                    badgeClass = "bg-red-100 text-red-800 border-red-200";
                    statusText = "🚫 Entrega cancelada";
                }

                return (
                    <div 
                      key={item.id_ordemservicos || index} 
                      onClick={() => handleEditar(item)}
                      className={`p-5 rounded-xl border shadow-sm hover:shadow-md cursor-pointer transition-all flex justify-between items-center group ${cardColorClass}`}
                    >
                      <div className="flex gap-6 items-center">
                        <div className={`px-4 py-2 rounded-lg text-center min-w-[90px] border transition-colors bg-white ${status == 3 ? 'border-red-100' : 'border-gray-100'}`}>
                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Entrega</div>
                            <div className="text-lg font-extrabold text-gray-800">{item.dt_formatada || item.dt_abertura}</div>
                            <div className="text-sm font-semibold text-gray-600 flex items-center justify-center gap-1">
                                <IconClock /> {item.hr_horaenc}
                            </div>
                        </div>

                        <div>
                            <h3 className={`text-lg font-bold flex items-center gap-2 transition-colors ${status == 3 ? 'text-gray-500 line-through' : 'text-gray-800 group-hover:text-red-600'}`}>
                                {item.nm_nomefantasia || "Cliente sem nome"}
                            </h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                <span className="flex items-center gap-1"><IconPhone /> {item.nr_telefone || "Sem telefone"}</span>
                                <span className="flex items-center gap-1 bg-white border border-gray-100 px-2 py-0.5 rounded text-xs font-medium">
                                    ID: {item.id_ordemservicos}
                                </span>
                            </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                          
                          {/* Badge de Status */}
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${badgeClass}`}>
                             {statusText}
                          </span>

                          {/* --- BOTÃO DE IMPRIMIR NA LISTA --- */}
                          <button 
                            onClick={(e) => { e.stopPropagation(); prepararImpressao(item); }}
                            title="Imprimir Cupom"
                            className="p-2 text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-gray-800 transition-all shadow-sm"
                          >
                              <IconPrinter />
                          </button>

                          {/* BOTÕES DE AÇÃO */}
                          {status == 1 && (
                              <div className="flex gap-2 pl-2 border-l border-gray-200">
                                  <button 
                                    onClick={(e) => handleStatusChange(e, item.id_ordemservicos, 2)}
                                    title="Concluir Entrega"
                                    className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 hover:scale-110 transition-all"
                                  >
                                      <IconCheck />
                                  </button>
                                  <button 
                                    onClick={(e) => handleStatusChange(e, item.id_ordemservicos, 3)}
                                    title="Cancelar Encomenda"
                                    className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 hover:scale-110 transition-all"
                                  >
                                      <IconX />
                                  </button>
                              </div>
                          )}

                          {status != 1 && (
                              <svg className="w-6 h-6 text-gray-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                          )}
                      </div>
                    </div>
                );
              })
            ) : (
              buscaRealizada && !loading && (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="inline-block p-4 bg-gray-50 rounded-full mb-3 text-gray-400">
                        <IconSearch />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600">Nenhuma encomenda encontrada</h3>
                    <p className="text-gray-400 text-sm mt-1">Tente mudar os filtros ou cadastre um novo pedido.</p>
                </div>
              )
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default ConsultaEncomenda;