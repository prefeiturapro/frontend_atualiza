import React from 'react';

// --- DADOS FIXOS (Trazendo de volta para não dar tela branca) ---
const labels = {
    // TORTAS
    ds_decoracao: "DECORAÇÃO", ds_recheio: "RECHEIO", vl_tamanho: "TAMANHO (KG)",
    ds_redonda: "FORMATO: REDONDA", ds_quadrada: "FORMATO: QUADRADA",
    ds_topo: "TOPO DE BOLO", ds_papel: "PAPEL ARROZ", ds_gliter: "GLITER",
    ds_tabuleiro: "TABULEIRO", ds_cafeboard: "CAKE BOARD", ds_menino: "DEC. MENINO",
    ds_menina: "DEC. MENINA", ds_mulher: "DEC. MULHER", ds_homem: "DEC. HOMEM",
    ds_po: "PÓ DECORATIVO",

    // BOLOS
    vl_bolpamon: "PAMONHA (KG)", vl_bolmilho: "MILHO (KG)", vl_bolchoc: "CHOCOLATE (KG)",
    vl_bolintban: "INT. BANANA (KG)", vl_bolmult: "MULTICEREAIS (KG)", vl_boltoic: "TOICINHO CÉU (KG)",
    vl_bolceno: "CENOURA (KG)", vl_bolamend: "AMENDOIM (KG)", vl_bolbrownie: "BROWNIE (KG)",
    vl_bolprest: "PRESTÍGIO (KG)", vl_bolbanana: "BANANA (KG)", vl_bolaveia: "AVEIA (KG)",
    vl_bollaranj: "LARANJA (KG)", vl_bolcuca: "CUCA (KG)",

    // SALGADOS
    vl_risfrango: "RISOLES FRANGO", vl_rispresque: "RISOLES P/Q", vl_coxinha: "COXINHA",
    vl_pastelcar: "PASTEL CARNE", vl_pastelban: "PASTEL BANANA", vl_salsic: "SALSICHA",
    vl_quibe: "QUIBE", vl_bolquei: "BOLINHA QUEIJO", vl_rispalm: "RISOLES PALMITO",
    vl_pastmil: "PASTEL MILHO",

    // MINIS
    vl_assadfra: "ASSADO FRANGO", vl_assadcar: "ASSADO CARNE", vl_assadcho: "ASSADO CHOC.",
    vl_mindonu: "DONUTS", vl_minempa: "EMPADINHA", vl_miniquic: "QUICHE",
    vl_minibaufr: "BAURU FRANGO", vl_minibaupr: "BAURU P/Q", vl_minibauca: "BAURU CALABRESA",
    vl_minicook: "COOKIES", vl_minix: "MINI X", vl_minisoave: "SONHO AVELÃ",
    vl_minicacho: "CACHORRO QUENTE", vl_minipaoca: "PÃO CACHORRO Q.", vl_minipaofr: "PÃO FRANCÊS",
    vl_minisonre: "SONHO S/ RECH.", vl_paominix: "PÃO BURGUER MINI", vl_mnipizza: "PIZZA",

    // DIVERSOS
    vl_barc: "BARQUETES", vl_paofr: "PÃO FRANCÊS", vl_paodoc: "PÃO DOCE",
    vl_sandfrint: "SAND. FRANGO INT.", vl_sandfr: "SAND. FRANGO", vl_sandfra: "SAND. PÃO FRANCÊS",
    vl_doccam: "DOCINHO CAMUFLADO", vl_cricri: "CRICRI", vl_tortsa: "TORTA SALGADA",
    vl_maeben: "MÃE BENTA", vl_cookie: "COOKIES", vl_paoque: "PÃO DE QUEIJO",
    vl_pudin: "PUDIM/CHEESECAKE", vl_paocach: "PÃO CACHORRO Q.", vl_paoham: "PÃO HAMBÚRGUER",
    vl_marr: "MARROQUINO", vl_sonsere: "SONHO S/ RECH.", vl_sonavel: "SONHO AVELÃ",
    vl_sondoc: "SONHO DOCE LEITE", vl_sonbal: "SONHO BAUNILHA", vl_cava: "CAVAQUINHO",
    vl_empad: "EMPADINHA", vl_quich: "QUICHE", vl_empagr: "EMPADÃO", vl_cacho: "CACHORRO QUENTE",
    vl_pizza: "PIZZA"
};

const grupos = [
    {
        titulo: "TORTAS",
        campos: ['ds_decoracao', 'ds_recheio', 'vl_tamanho', 'ds_redonda', 'ds_quadrada', 'ds_topo', 'ds_papel', 'ds_gliter', 'ds_tabuleiro', 'ds_cafeboard', 'ds_menino', 'ds_menina', 'ds_mulher', 'ds_homem', 'ds_po'],
        obs: 'ds_obstortas'
    },
    {
        titulo: "BOLOS TRADICIONAIS",
        campos: ['vl_bolpamon', 'vl_bolmilho', 'vl_bolchoc', 'vl_bolintban', 'vl_bolmult', 'vl_boltoic', 'vl_bolceno', 'vl_bolamend', 'vl_bolbrownie', 'vl_bolprest', 'vl_bolbanana', 'vl_bolaveia', 'vl_bollaranj', 'vl_bolcuca'],
        obs: 'ds_obsbolo'
    },
    {
        titulo: "SALGADINHOS DE FESTA",
        campos: ['vl_risfrango', 'vl_rispresque', 'vl_coxinha', 'vl_pastelcar', 'vl_pastelban', 'vl_salsic', 'vl_quibe', 'vl_bolquei', 'vl_rispalm', 'vl_pastmil'],
        obs: 'ds_obssalg'
    },
    {
        titulo: "PRODUTOS - MINI'S",
        campos: ['vl_assadfra', 'vl_assadcar', 'vl_assadcho', 'vl_mindonu', 'vl_minempa', 'vl_miniquic', 'vl_minibaufr', 'vl_minibaupr', 'vl_minibauca', 'vl_minicook', 'vl_minix', 'vl_minisoave', 'vl_minicacho', 'vl_minipaoca', 'vl_minipaofr', 'vl_minisonre', 'vl_paominix', 'vl_mnipizza'],
        obs: 'ds_obsminis'
    },
    {
        titulo: "DIVERSOS - TAMANHO PADRÃO",
        campos: ['vl_barc', 'vl_paofr', 'vl_paodoc', 'vl_sandfrint', 'vl_sandfr', 'vl_sandfra', 'vl_doccam', 'vl_cricri', 'vl_tortsa', 'vl_maeben', 'vl_cookie', 'vl_paoque', 'vl_pudin', 'vl_paocach', 'vl_paoham', 'vl_marr', 'vl_sonsere', 'vl_sonavel', 'vl_sondoc', 'vl_sonbal', 'vl_cava', 'vl_empad', 'vl_quich', 'vl_empagr', 'vl_cacho', 'vl_pizza'],
        obs: 'ds_obsdiv'
    }
];

export const CupomEncomenda = ({ dados }) => {
    // Se não tiver dados, não renderiza nada (mas não quebra)
    if (!dados || Object.keys(dados).length === 0) return null;

    const temItemNoGrupo = (grupo) => {
        const temCampo = grupo.campos.some(key => {
            const val = dados[key];
            if (!val || val === 'N' || val === '0' || val === 0) return false;
            if (!isNaN(parseFloat(val)) && parseFloat(val) === 0) return false;
            return true;
        });
        const temObs = dados[grupo.obs] && dados[grupo.obs].trim().length > 0;
        return temCampo || temObs;
    };

    return (
        <div className="bg-white text-black font-mono text-xs p-2" style={{ width: '80mm', margin: '0 auto' }}>
            {/* Estilo embutido para garantir impressão correta */}
            <style type="text/css" media="print">
                {`@page { size: 80mm auto; margin: 0; } body { margin: 0; }`}
            </style>

            <div className="text-center mb-4 border-b-2 border-dashed border-black pb-2">
                <h1 className="text-xl font-black uppercase tracking-wide">CAFÉ FRANCESA</h1>
                <p className="mt-2 text-[10px]">PEDIDO: #{dados.id_ordemservicos}</p>
            </div>

            <div className="mb-4 border-b-2 border-dashed border-black pb-2 space-y-1">
                <p><span className="font-bold">DATA ENTREGA:</span> {dados.dt_formatada || dados.dt_abertura}</p>
                <p><span className="font-bold">HORA:</span> {dados.hr_horaenc}</p>
                <p><span className="font-bold">FONE:</span> {dados.nr_telefone}</p>
                <p className="text-sm mt-2"><span className="font-bold">CLIENTE:</span> {dados.nm_nomefantasia}</p>
                
                {dados.observacao && (
                    <div className="mt-2 bg-gray-100 p-1 border border-gray-300">
                        <span className="font-bold block">OBSERVAÇÃO GERAL:</span>
                        <span className="uppercase">{dados.observacao}</span>
                    </div>
                )}
            </div>

            {grupos.map((grupo, idx) => {
                if (!temItemNoGrupo(grupo)) return null;

                return (
                    <div key={idx} className="mb-4 border-b-2 border-dashed border-black pb-2">
                        <h2 className="font-black text-sm mb-2 bg-black text-white text-center uppercase">{grupo.titulo}</h2>
                        {grupo.campos.map(key => {
                            const val = dados[key];
                            if (!val || val === 'N' || val === '0' || val === 0) return null;
                            const num = parseFloat(val);
                            if (!isNaN(num) && num === 0) return null;

                            const label = labels[key] || key;
                            
                            if ((val === 'S' || val === true) && (key.startsWith('ds_') || key.startsWith('st_'))) {
                                return (
                                    <div key={key} className="flex justify-between mb-1">
                                        <span>{label}</span>
                                        <span className="font-bold">[ SIM ]</span>
                                    </div>
                                );
                            }

                            return (
                                <div key={key} className="flex justify-between mb-1 border-b border-gray-200 pb-0.5">
                                    <span className="pr-2">{label}:</span>
                                    <span className="font-bold">{val}</span>
                                </div>
                            );
                        })}
                        {dados[grupo.obs] && (
                            <div className="mt-2 text-[10px] italic">
                                <span className="font-bold">OBS:</span> {dados[grupo.obs]}
                            </div>
                        )}
                    </div>
                );
            })}

            <div className="text-center text-[9px] mt-4">
                <p>Obrigado pela preferência!</p>
               
            </div>
        </div>
    );
};