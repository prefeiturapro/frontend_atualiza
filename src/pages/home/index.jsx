import React, { useState, useEffect } from "react";

function Home() {
  const [encomendas, setEncomendas] = useState([]);
  const [empregados, setEmpregados] = useState([]);
  const [cores, setCores] = useState({});
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(new Date());

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";
  
  const CORES_PALETA = [
    "#2563eb", "#dc2626", "#16a34a", "#d97706", 
    "#7c3aed", "#db2777", "#059669", "#0891b2"
  ];

  useEffect(() => {
    
    // Função para buscar dados (com proteção anti-cache)
    const buscarDados = async () => {
        try {
            console.log("🔄 Buscando atualizações...", new Date().toLocaleTimeString());
            
            // O timestamp (?t=...) evita que o navegador use o cache antigo
            const url = `${API_URL}/encomendas?t=${new Date().getTime()}`;
            
            const res = await fetch(url, {
                headers: { 'Cache-Control': 'no-cache' }
            });

            if (!res.ok) throw new Error("Erro ao atualizar");
            
            const data = await res.json();
            
            // Proteção: Se vier erro, define array vazio para não travar a tela
            if (Array.isArray(data)) {
                setEncomendas(data);
                setUltimaAtualizacao(new Date());
            } else {
                setEncomendas([]); 
            }

        } catch (err) {
            console.error("Erro na atualização automática:", err);
        }
    };

    // Função para buscar empregados (roda só uma vez)
    const buscarEmpregados = async () => {
        try {
            const res = await fetch(`${API_URL}/empregados`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    const ordenados = data.sort((a, b) => a.id_empregados - b.id_empregados);
                    setEmpregados(ordenados);

                    const mapaCores = {};
                    ordenados.forEach((emp, index) => {
                        mapaCores[emp.id_empregados] = CORES_PALETA[index % CORES_PALETA.length];
                    });
                    setCores(mapaCores);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    // 1. Executa imediatamente ao abrir a tela
    buscarEmpregados();
    buscarDados();

    // 2. CONFIGURAÇÃO DE ECONOMIA (POLLING INTELIGENTE)
    const intervalo = setInterval(() => {
        const hora = new Date().getHours();
        
        // REGRA DE OURO: Só busca se for entre 07:00 da manhã e 23:00 da noite.
        // Fora desse horário, o sistema não chama o banco, permitindo o "Scale to Zero".
        if (hora >= 4 && hora < 20) {
            buscarDados();
        } else {
            console.log("💤 Loja fechada (Modo Econômico). O banco pode dormir.");
        }

    }, 240000); // 60000ms = 60 segundos (4 minuto)

    return () => clearInterval(intervalo);

  }, []);

  // --- LÓGICA DE AGRUPAMENTO ---
  const grupos = {};
  
  (empregados || []).forEach(emp => {
    grupos[emp.id_empregados] = {
      nome: emp.nm_nomefantasia,
      lista: []
    };
  });

  (encomendas || []).forEach(enc => {
    const idFuncionario = enc.id_empregado || enc.id_usuarios;
    if (grupos[idFuncionario]) {
      grupos[idFuncionario].lista.push(enc);
    }
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-8 text-gray-800 uppercase">
        Painel de Encomendas
        <span className="block text-xs font-normal text-gray-400 mt-1 lowercase">
            última atualização: {ultimaAtualizacao.toLocaleTimeString()}
        </span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(grupos).map(([id, dadosDoGrupo]) => (
          <div key={id} className="border rounded-lg shadow-md bg-white overflow-hidden flex flex-col">
            
            <div 
              className="p-3 text-white font-bold text-center text-lg uppercase tracking-wider shadow-sm"
              style={{
                backgroundColor: cores[id] || '#9ca3af',
                textShadow: '0px 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              {dadosDoGrupo.nome} 
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 border-b text-center">Hora</th>
                    <th className="px-4 py-3 border-b">Cliente</th>
                    <th className="px-4 py-3 border-b">Produto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dadosDoGrupo.lista.map((enc, i) => {
                    const isEntregue = enc.st_status == 2;
                    const isCancelado = enc.st_status == 3;

                    let rowClass = "hover:bg-gray-50 transition-colors";
                    let textStyle = "text-gray-700";
                    let horaStyle = "font-bold text-red-600";

                    if (isEntregue) {
                        rowClass = "bg-green-50 hover:bg-green-100 opacity-70"; 
                        textStyle = "text-green-800 line-through decoration-green-600 font-medium";
                        horaStyle = "text-green-800 line-through decoration-green-600";
                    } else if (isCancelado) {
                        rowClass = "bg-red-50 hover:bg-red-100 opacity-70";
                        textStyle = "text-red-800 line-through decoration-red-600 font-medium";
                        horaStyle = "text-red-800 line-through decoration-red-600";
                    }

                    return (
                      <tr key={i} className={rowClass}>
                        <td className={`px-4 py-3 border-r text-center ${horaStyle}`}>
                            {enc.hr_horaenc || enc.hora}
                        </td>
                        <td className={`px-4 py-3 border-r truncate max-w-[150px] ${textStyle}`} title={enc.nm_nomefantasia || enc.cliente}>
                          {enc.nm_nomefantasia || enc.cliente}
                        </td>
                        <td className={`px-4 py-3 ${textStyle}`}>
                          {enc.produto_nome || enc.ds_grupo || "Encomenda"} 
                        </td>
                      </tr>
                    );
                  })}
                  
                  {dadosDoGrupo.lista.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-gray-400 text-center italic">
                        Nenhuma encomenda hoje
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;