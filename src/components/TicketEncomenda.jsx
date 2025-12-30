import React from 'react';

// Mapeamento de campos do banco para nomes legíveis no cupom
const dicionarioProdutos = {
    // --- TORTAS ---
    ds_decoracao: "Decoração",
    ds_recheio: "Recheio",
    vl_tamanho: "Tamanho (kg)",
    ds_obstortas: "Obs. Torta",
    ds_topo: "Topo de Bolo",
    ds_papel: "Papel Arroz",
    ds_gliter: "Gliter",
    ds_redonda: "Formato Redondo",
    ds_quadrada: "Formato Quadrado",
    ds_menino: "Dec. Menino",
    ds_menina: "Dec. Menina",
    ds_mulher: "Dec. Mulher",
    ds_homem: "Dec. Homem",
    ds_po: "Pó Decorativo",
    ds_tabuleiro: "Tabuleiro",
    ds_cafeboard: "Cake Board",

    // --- BOLOS ---
    vl_bolpamon: "Bolo Pamonha (kg)",
    vl_bolmilho: "Bolo Milho (kg)",
    vl_bolchoc: "Bolo Chocolate (kg)",
    vl_bolintban: "Bolo Int. Banana (kg)",
    vl_bolmult: "Bolo Multicereais (kg)",
    vl_boltoic: "Toicinho do Céu (kg)",
    vl_bolceno: "Bolo Cenoura (kg)",
    vl_bolamend: "Bolo Amendoim (kg)",
    vl_bolbrownie: "Brownie (kg)",
    vl_bolprest: "Bolo Prestígio (kg)",
    vl_bolbanana: "Bolo Banana (kg)",
    vl_bolaveia: "Bolo Aveia (kg)",
    vl_bollaranj: "Bolo Laranja (kg)",
    vl_bolcuca: "Cuca (kg)",
    ds_obsbolo: "Obs. Bolo",

    // --- SALGADOS ---
    vl_risfrango: "Risoles Frango (UN)",
    vl_rispresque: "Risoles P/Q (UN)",
    vl_coxinha: "Coxinha (UN)",
    vl_pastelcar: "Pastel Carne (UN)",
    vl_pastelban: "Pastel Banana (UN)",
    vl_salsic: "Salsicha (UN)",
    vl_quibe: "Quibe (UN)",
    vl_bolquei: "Bolinha Queijo (UN)",
    vl_rispalm: "Risoles Palmito (UN)",
    vl_pastmil: "Pastel Milho (UN)",
    ds_obssalg: "Obs. Salgados",

    // --- MINI'S ---
    vl_assadfra: "Assado Frango (UN)",
    vl_assadcar: "Assado Carne (UN)",
    vl_assadcho: "Assado Choc. (UN)",
    vl_mindonu: "Donuts (UN)",
    vl_minempa: "Empadinha (UN)",
    vl_miniquic: "Quiche (UN)",
    vl_minibaufr: "Bauru Frango (UN)",
    vl_minibaupr: "Bauru P/Q (UN)",
    vl_minibauca: "Bauru Calabresa (UN)",
    vl_minicook: "Cookies (UN)",
    vl_minix: "Mini X (UN)",
    vl_minisoave: "Sonho Avelã (UN)",
    vl_minicacho: "Cachorro Quente (UN)",
    vl_minipaoca: "Pão Cachorro Q. (UN)",
    vl_minipaofr: "Pão Francês (UN)",
    vl_minisonre: "Sonho s/ Rech. (UN)",
    vl_paominix: "Pão Burguer Mini (UN)",
    vl_mnipizza: "Pizza (UN)",
    ds_obsminis: "Obs. Mini's",

    // --- DIVERSOS ---
    vl_barc: "Barquetes (UN)",
    vl_paofr: "Pão Francês (UN)",
    vl_paodoc: "Pão Doce (UN)",
    vl_sandfrint: "Sand. Frango Int. (UN)",
    vl_sandfr: "Sand. Frango (UN)",
    vl_sandfra: "Sand. Pão Francês (UN)",
    vl_doccam: "Docinho Camuflado (UN)",
    vl_cricri: "Cricri (UN)",
    vl_tortsa: "Torta Salgada (UN)",
    vl_maeben: "Mãe Benta (UN)",
    vl_cookie: "Cookies (UN)",
    vl_paoque: "Pão de Queijo (UN)",
    vl_pudin: "Pudim/Cheesecake (UN)",
    vl_paocach: "Pão Cachorro Q. (UN)",
    vl_paoham: "Pão Hambúrguer (UN)",
    vl_marr: "Marroquino (UN)",
    vl_sonsere: "Sonho s/ Rech. (UN)",
    vl_sonavel: "Sonho Avelã (UN)",
    vl_sondoc: "Sonho Doce Leite (UN)",
    vl_sonbal: "Sonho Baunilha (UN)",
    vl_cava: "Cavaquinho (UN)",
    vl_empad: "Empadinha (UN)",
    vl_quich: "Quiche (UN)",
    vl_empagr: "Empadão (UN)",
    vl_cacho: "Cachorro Quente (UN)",
    vl_pizza: "Pizza (UN)",
    ds_obsdiv: "Obs. Diversos"
};

export const ticketencomenda = ({ dados }) => {
    
    // Se não houver dados, não renderiza nada (evita erros)
    if (!dados) return <div className="p-4 text-center font-mono">Carregando dados do cupom...</div>;

    // Função para renderizar cada linha de produto
    const renderLinha = (chave, valor) => {
        // Ignora valores vazios, zero ou 'N' (Não)
        if (!valor || valor === "0" || valor === 0 || valor === 'N') return null;
        
        const label = dicionarioProdutos[chave] || chave;

        // Se for um Switch (S/N) e estiver 'S', mostra como Adicional
        if (chave.startsWith('ds_') && (valor === 'S' || valor === true)) {
             return (
                <div key={chave} className="flex justify-between text-xs mb-1 pl-2">
                    <span className="font-bold">+ {label}</span>
                    <span>SIM</span>
                </div>
             );
        }

        // Se for Texto ou Número
        return (
            <div key={chave} className="flex justify-between text-xs mb-1 border-b border-dashed border-gray-300 pb-1">
                <span className="font-semibold">{label}:</span>
                <span className="font-bold text-right w-1/3">{valor}</span>
            </div>
        );
    };

    // Campos que NÃO devem aparecer na lista de itens (metadados)
    const camposIgnorados = [
        'id_ordemservicos', 'id_usuarios', 'id_contribuintes', 'st_status', 
        'dt_abertura', 'hr_horaenc', 'nm_nomefantasia', 'nr_telefone', 
        'dt_formatada', 'observacao', 'dt_agendamento', 'ds_fototorta'
    ];

    return (
        <div className="p-4 bg-white text-black font-mono" style={{ width: '80mm', minHeight: '100mm' }}>
            
            {/* --- CABEÇALHO --- */}
            <div className="text-center border-b-2 border-black pb-2 mb-2">
                <h1 className="text-lg font-extrabold uppercase">Café Francesa</h1>
                <p className="text-xs">Pedido: #{dados.id_ordemservicos || 'NOVO'}</p>
                <p className="text-xs">
                    Data: {dados.dt_formatada || dados.dt_abertura} às {dados.hr_horaenc}
                </p>
            </div>

            {/* --- DADOS DO CLIENTE --- */}
            <div className="mb-4 border-b-2 border-black pb-2">
                <p className="text-sm font-bold">CLIENTE:</p>
                <p className="text-sm uppercase truncate">{dados.nm_nomefantasia || "Consumidor Final"}</p>
                <p className="text-sm">{dados.nr_telefone}</p>
                
                <div className="mt-2 text-xs font-bold border border-black p-1 text-center uppercase">
                    {dados.st_status == 1 ? "AGUARDANDO RETIRADA" : 
                     dados.st_status == 2 ? "ENTREGA REALIZADA" : "CANCELADO"}
                </div>
            </div>

            {/* --- ITENS DO PEDIDO --- */}
            <div className="mb-4">
                <p className="text-center font-bold text-sm mb-2 border-b border-black">ITENS DO PEDIDO</p>
                
                {Object.keys(dados).map((chave) => {
                    if (camposIgnorados.includes(chave)) return null;
                    return renderLinha(chave, dados[chave]);
                })}
            </div>

            {/* --- OBSERVAÇÃO GERAL --- */}
            {dados.observacao && (
                <div className="mt-4 border-t-2 border-black pt-2">
                    <p className="font-bold text-xs">OBSERVAÇÕES GERAIS:</p>
                    <p className="text-xs italic">{dados.observacao}</p>
                </div>
            )}

            {/* --- RODAPÉ --- */}
            <div className="mt-8 text-center text-[10px]">
                <p>Obrigado pela preferência!</p>
                <p>www.cafefrancesa.com.br</p>
                <p className="mt-2 text-[8px] text-gray-500">{new Date().toLocaleString()}</p>
            </div>
        </div>
    );
};