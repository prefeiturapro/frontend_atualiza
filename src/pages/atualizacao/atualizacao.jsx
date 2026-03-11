import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container, Row, Col, Card, Button, ProgressBar, Spinner, Alert
} from 'react-bootstrap';
import { 
    FaFileUpload, FaArrowLeft
} from 'react-icons/fa';

// --- IMPORTAÇÃO DOS COMPONENTES ---
import HeaderResponsivo from "../../components/HeaderResponsivo";
import QuadroDadosAtuais from "../../components/QuadroDadosAtuais";
import FormularioExtracao from "../../components/FormularioExtracao";
import VerificacaoContato from "../../components/VerificacaoContato";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

// --- FUNÇÃO PARA REMOVER ACENTOS ---
const normalizarTexto = (texto) => {
    if (!texto) return "";
    return texto
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
};

const Atualizacao = () => {
    const navigate = useNavigate();

    // --- TODOS OS ESTADOS ORIGINAIS ---
    const [dados, setDados] = useState(null);
    const [statusIA, setStatusIA] = useState("esperando");
    const [progresso, setProgresso] = useState(0);
    const [salvando, setSalvando] = useState(false);
    const [erroTitularidade, setErroTitularidade] = useState(null);
    const [validandoCPF, setValidandoCPF] = useState(false);
    const [cpfValidoOficial, setCpfValidoOficial] = useState(null); 
    const [erroCpfMensagem, setErroCpfMensagem] = useState("");
    const [stBloqueioResp, setStBloqueioResp] = useState("N"); 
    const [ehMunicipioOficial, setEhMunicipioOficial] = useState(false);
    const [municipioSede, setMunicipioSede] = useState("");
    const [carregandoConfig, setCarregandoConfig] = useState(true);
    const [listaBairros, setListaBairros] = useState([]);
    const [listaLogradouros, setListaLogradouros] = useState([]);
    const [bairroValido, setBairroValido] = useState(true);
    const [logradouroValido, setLogradouroValido] = useState(true);
    const [stEditadoManual, setStEditadoManual] = useState("N");
    const [smsEnviado, setSmsEnviado] = useState(false);
    const [validandoSms, setValidandoSms] = useState(false);
    const [codigoOtp, setCodigoOtp] = useState("");
    const [telefoneVerificado, setTelefoneVerificado] = useState(false);
    const [enviandoSms, setEnviandoSms] = useState(false);
    const [emailEnviado, setEmailEnviado] = useState(false);
    const [validandoEmail, setValidandoEmail] = useState(false);
    const [codigoOtpEmail, setCodigoOtpEmail] = useState("");
    const [emailVerificado, setEmailVerificado] = useState(false);
    const [enviandoEmailOtp, setEnviandoEmailOtp] = useState(false);

    const [dadosOriginaisOCR, setDadosOriginaisOCR] = useState({
        nm_rua_extr: "", ds_numero_extr: "", nr_cep_extr: "", ds_bairro_extr: "", ds_cidade_extr: "", ds_loteamento_extr: "", ds_edificio_extr: "", ds_complemento_extr: ""
    });

    const [dadosExtraidos, setDadosExtraidos] = useState({
        cd_contribuinte: "", nm_contribuinte: "", nr_cpf_atual: "", nm_rua_atual: "",
        ds_numero_atual: "", ds_bairro_atual: "", ds_cidade_atual: "", nr_cep_atual: "",
        nr_telefone_atual: "", ds_email_atual: "", ds_obs: "",
        st_responsavel: "N", ds_loteamento_atual: "", ds_edificio_atual: "", ds_complemento_atual: ""
    });

    const [configPrefeitura, setConfigPrefeitura] = useState({ NOME: "", logo: "" });

    const aguardandoDeclaracao = erroTitularidade && stBloqueioResp === 'S' && dadosExtraidos.st_responsavel !== 'S';

    // --- FUNÇÕES DE SUPORTE E MÁSCARAS ---
    const aplicarMascaraCPF = (v) => {
        v = v.replace(/\D/g, "");
        if (v.length <= 11) {
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        }
        return v;
    };

    const aplicarMascaraTelefone = (valor) => {
        if (!valor) return "";
        valor = valor.replace(/\D/g, "");
        valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2");
        valor = valor.replace(/(\d{5})(\d)/, "$1-$2");
        return valor.substring(0, 15);
    };

    // --- CARREGAMENTO DE DADOS ---
    const carregarListasEndereco = async () => {
        try {
            const [resBairros, resLogradouros] = await Promise.all([
                fetch(`${API_URL}/dadosbairros/listar`),
                fetch(`${API_URL}/dadoslogradouros/listar`)
            ]);
            if (resBairros.ok) setListaBairros(await resBairros.json());
            if (resLogradouros.ok) setListaLogradouros(await resLogradouros.json());
        } catch (error) { console.error("Erro ao carregar listas de seleção:", error); }
    };

    const consultarCpfNoBackend = async (cpfInformado) => {
        const nrLimpo = cpfInformado.replace(/\D/g, "");
        if (nrLimpo.length !== 11) return;
        setValidandoCPF(true); setCpfValidoOficial(null); setErroCpfMensagem("");
        try {
            const response = await fetch(`${API_URL}/dadoscontribuintes/validar-cpf/${nrLimpo}`);
            const data = await response.json();
            if (data.status) {
                const nomeReceita = data.result.nome;
                const score = verificarSimilaridade(nomeReceita, dadosExtraidos.nm_contribuinte);
                if (score >= 75) { setCpfValidoOficial(true); } 
                else { setCpfValidoOficial(false); setErroCpfMensagem(`ESTE CPF PERTENCE A ${nomeReceita} E NÃO AO TITULAR DO COMPROVANTE.`); }
            } else { setCpfValidoOficial(false); setErroCpfMensagem(data.message || "CPF NÃO LOCALIZADO NA RECEITA."); }
        } catch (error) { setErroCpfMensagem("ERRO AO CONECTAR COM O SERVIÇO DE VALIDAÇÃO."); } 
        finally { setValidandoCPF(false); }
    };

    const carregarDadosGerais = async () => {
        try {
            const response = await fetch(`${API_URL}/dadosgerais/config`); 
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            const data = await response.json();
            if (data.sucesso) setStBloqueioResp(String(data.st_bloqueioresp || "N").trim().toUpperCase());
        } catch (error) { console.error("Erro ao carregar dados gerais:", error.message); }
    };

    const carregarMunicipioSede = async () => {
        try {
            const response = await fetch(`${API_URL}/dadosmunicipios/padrao`, { method: "POST" });
            const data = await response.json();
            if (response.ok) setMunicipioSede(data.nm_municipio);
        } catch (error) { console.error("Erro ao carregar município sede:", error); } 
        finally { setCarregandoConfig(false); }
    };

    const validarBairroNoBanco = async (nomeBairro) => {
        if (!nomeBairro) return;
        const nomeLimpo = normalizarTexto(nomeBairro);
        try {
            const response = await fetch(`${API_URL}/dadosbairros/validar`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nm_bairro: nomeLimpo })
            });
            const result = await response.json();
            if (result.valido) { setBairroValido(true); setDadosExtraidos(prev => ({ ...prev, ds_bairro_atual: result.nomeOficial })); } 
            else { setBairroValido(false); }
        } catch (error) { console.error("Erro ao validar bairro:", error); }
    };

    const validarLogradouroNoBanco = async (nomeLogradouro) => {
        if (!nomeLogradouro) return;
        const nomeLimpo = normalizarTexto(nomeLogradouro);
        try {
            const response = await fetch(`${API_URL}/dadoslogradouros/validar`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nm_logradouro: nomeLimpo })
            });
            const result = await response.json();
            if (result.valido) { setLogradouroValido(true); setDadosExtraidos(prev => ({ ...prev, nm_rua_atual: result.nomeOficial })); } 
            else { setLogradouroValido(false); }
        } catch (error) { console.error("Erro ao validar logradouro:", error); }
    };

    // --- FUNÇÕES DE VERIFICAÇÃO (OTP) ---
    const handleEnviarEmailOtp = async () => {
        if (!dadosExtraidos.ds_email_atual || !dadosExtraidos.ds_email_atual.includes("@")) { alert("Informe um e-mail válido."); return; }
        setEnviandoEmailOtp(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/enviar-otp-email`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: dadosExtraidos.ds_email_atual.toLowerCase() })
            });
            if (response.ok) { setEmailEnviado(true); alert("Código enviado para seu e-mail!"); }
        } catch (error) { alert("Erro de conexão."); } finally { setEnviandoEmailOtp(false); }
    };

    const handleValidarCodigoEmail = async () => {
        setValidandoEmail(true); 
        try {
            const response = await fetch(`${API_URL}/api/auth/validar-otp-email`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: dadosExtraidos.ds_email_atual.toLowerCase(), codigo: codigoOtpEmail })
            });
            const result = await response.json();
            if (result.sucesso) { setEmailVerificado(true); alert("E-mail verificado com sucesso!"); } 
            else { alert("Código inválido."); }
        } catch (error) { alert("Erro ao validar e-mail."); } finally { setValidandoEmail(false); }
    };

    const handleEnviarSms = async () => {
        if (!dadosExtraidos.nr_telefone_atual || dadosExtraidos.nr_telefone_atual.length < 10) { alert("Informe um celular válido."); return; }
        setEnviandoSms(true);
        try {
            const telLimpo = `+55${dadosExtraidos.nr_telefone_atual.replace(/\D/g, "")}`;
            const response = await fetch(`${API_URL}/api/auth/enviar-otp`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ telefone: telLimpo })
            });
            if (response.ok) { setSmsEnviado(true); alert("Código enviado!"); }
        } catch (error) { alert("Erro de conexão."); } finally { setEnviandoSms(false); }
    };

    const handleValidarCodigo = async () => {
        setValidandoSms(true);
        try {
            const telLimpo = `+55${dadosExtraidos.nr_telefone_atual.replace(/\D/g, "")}`;
            const response = await fetch(`${API_URL}/api/auth/validar-otp`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ telefone: telLimpo, codigo: codigoOtp })
            });
            const result = await response.json();
            if (result.sucesso) { setTelefoneVerificado(true); alert("Identidade confirmada!"); }
        } catch (error) { alert("Erro ao validar."); } finally { setValidandoSms(false); }
    };

    const verificarSimilaridade = (nomeSistema, nomeExtraido) => {
        if (!nomeExtraido || !nomeSistema) return 0;
        const s1 = nomeSistema.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        const s2 = nomeExtraido.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        if (s1 === s2) return 100;
        const palavrasS1 = s1.split(/\s+/);
        const palavrasS2 = s2.split(/\s+/);
        const matches = palavrasS1.filter(palavra => palavra.length > 2 && palavrasS2.includes(palavra));
        return (matches.length / Math.max(palavrasS1.length, palavrasS2.length)) * 100;
    };

    // --- EFFECTS ---
    useEffect(() => {
        const storedData = localStorage.getItem("dados_imovel");
        const storedConfig = localStorage.getItem("config_prefeitura");
        if (storedData) {
            const parsed = JSON.parse(storedData);
            setDados(parsed);
            setDadosExtraidos(prev => ({ ...prev, cd_contribuinte: parsed.id_dados_imoveis || "" }));
        } else { navigate("/"); }
        if (storedConfig) {
            const config = JSON.parse(storedConfig);
            setConfigPrefeitura({ NOME: config.nm_cliente, logo: config.by_brasaoprefeitura });
        }
        carregarMunicipioSede(); carregarDadosGerais();
    }, [navigate]);

    useEffect(() => { if (municipioSede) carregarListasEndereco(); }, [municipioSede]);

    // --- PROCESSAMENTO OCR ---
    const processarArquivoReal = async (e) => {
        const arquivo = e.target.files[0]; if (!arquivo) return;
        setErroTitularidade(null); setCpfValidoOficial(null); setStatusIA("processando"); setProgresso(30); 
        const formData = new FormData(); formData.append('comprovante', arquivo); 
        try {
            const response = await fetch(`${API_URL}/dadoscontribuintes/processar-comprovante`, { method: "POST", body: formData });
            const dataOCR = await response.json();
            if (!response.ok) throw new Error(dataOCR.erro || "Falha na leitura.");
            setProgresso(100);
            const nomeLido = dataOCR.nm_contribuinte || "";
            const score = verificarSimilaridade(dados.nm_responsavel, nomeLido);
            if (score < 50 && stBloqueioResp === "N") {
                setStatusIA("esperando"); setErroTitularidade(`BLOQUEIO: O NOME NO COMPROVANTE É DIFERENTE DO SISTEMA.`);
                setDadosExtraidos(prev => ({ ...prev, nm_contribuinte: nomeLido, st_responsavel: "N" }));
            } else {
                setStatusIA("concluido");
                if (score < 50 && stBloqueioResp === "S") setErroTitularidade(`AVISO: TITULARIDADE DIFERENTE, MAS A EDIÇÃO FOI LIBERADA.`);
                setDadosOriginaisOCR({ nm_rua_extr: dataOCR.nm_rua_atual || "", ds_numero_extr: dataOCR.ds_numero_atual || "", nr_cep_extr: dataOCR.nr_cep_atual || "", ds_bairro_extr: dataOCR.ds_bairro_atual || "", ds_cidade_extr: dataOCR.ds_cidade_atual || "", ds_loteamento_extr: dataOCR.ds_loteamento_extr || "", ds_edificio_extr: dataOCR.ds_edificio_extr || "", ds_complemento_extr: dataOCR.ds_complemento_extr || "" });
                setDadosExtraidos(prev => ({ ...prev, ...dataOCR, ds_obs: "Validado via AtualizaAI Vision" }));
                setStEditadoManual("N");
                const cidadeLida = (dataOCR.ds_cidade_atual || "").toUpperCase().trim();
                const cidadeSede = (municipioSede || "").toUpperCase().trim();
                if (cidadeLida === cidadeSede && cidadeSede !== "") {
                    setEhMunicipioOficial(true);
                    if (dataOCR.ds_bairro_atual) await validarBairroNoBanco(dataOCR.ds_bairro_atual);
                    if (dataOCR.nm_rua_atual) await validarLogradouroNoBanco(dataOCR.nm_rua_atual);
                } else { setEhMunicipioOficial(false); setBairroValido(false); setLogradouroValido(false); setStEditadoManual("S"); }
            }
        } catch (error) { setStatusIA("esperando"); setErroTitularidade(error.message); }
    };

    // --- SALVAMENTO FINAL ---
    const handleSalvar = async () => {
        if (erroTitularidade && stBloqueioResp === 'S' && dadosExtraidos.st_responsavel !== 'S') { alert("Confirme sua responsabilidade."); return; }
        if (cpfValidoOficial !== true) { alert("Valide o CPF."); return; }
        if (!telefoneVerificado) { alert("Validação SMS obrigatória!"); return; }
        if (dadosExtraidos.ds_email_atual && !emailVerificado) { alert("Verificação de e-mail obrigatória!"); return; }
        setSalvando(true);
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const nrProtocolo = `${date}-${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`;
        const dadosParaEnviar = { ...dadosExtraidos, id_dados_imoveis: dados.id_dados_imoveis, ds_inscricao_imovel: dados.ds_inscricao, cd_reduzido_imovel: dados.cd_reduzido, cd_contribuinte: dados.cd_responsavel, ds_protocolo: nrProtocolo, st_editado_manual: stEditadoManual, nm_rua_extr: dadosOriginaisOCR.nm_rua_extr, ds_numero_extr: dadosOriginaisOCR.ds_numero_extr, nr_cep_extr: dadosOriginaisOCR.nr_cep_extr, ds_bairro_extr: dadosOriginaisOCR.ds_bairro_extr, ds_cidade_extr: dadosOriginaisOCR.ds_cidade_extr, tp_rua_extr: 'RUA', ds_loteamento_extr: dadosOriginaisOCR.ds_loteamento_extr, ds_edificio_extr: dadosOriginaisOCR.ds_edificio_extr, ds_complemento_extr: dadosOriginaisOCR.ds_complemento_extr };
        try {
            const response = await fetch(`${API_URL}/dadoscontribuintes/salvar`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dadosParaEnviar) });
            if (response.ok) {
                localStorage.setItem("protocolo_gerado", nrProtocolo);
                localStorage.setItem("email_usuario", dadosExtraidos.ds_email_atual.toLowerCase());
                localStorage.setItem("nome_usuario", dadosExtraidos.nm_contribuinte);
                navigate("/conclusao"); 
            } else { alert("Erro ao persistir os dados."); }
        } catch (error) { alert("Erro de conexão."); } finally { setSalvando(false); }
    };

    if (!dados || carregandoConfig) return <div className="text-center py-5"><Spinner animation="border" /></div>;

    // --- RENDERIZAÇÃO ---
    return (
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <HeaderResponsivo logo={configPrefeitura.logo} nome={configPrefeitura.NOME} />

            <Container className="py-3 flex-grow-1">
                <QuadroDadosAtuais dados={dados} />

                <Row className="g-3">
                    <Col xs={12} lg={4}>
                        <Card className={`border-0 shadow-sm rounded-4 p-2 h-100 ${erroTitularidade ? 'border-danger border-2' : ''}`}>
                            <div className="border-dashed rounded-4 p-4 text-center d-flex flex-column align-items-center justify-content-center h-100" 
                                 style={{ border: '2px dashed #0d6efd', backgroundColor: '#f8fbff', cursor: 'pointer', minHeight: '180px' }}
                                 onClick={() => document.getElementById('up-doc').click()}>
                                <FaFileUpload size={35} className="text-primary mb-2" />
                                <h6 className="fw-bold small">ANEXAR COMPROVANTE</h6>
                                <p className="text-muted" style={{ fontSize: '11px', lineHeight: '1.2' }}>
                                    Conta de Luz, água ou telefone recente.
                                </p>
                                <input type="file" id="up-doc" hidden onChange={processarArquivoReal} accept="image/*,.pdf" />
                                {statusIA === "processando" ? <ProgressBar animated now={progresso} className="w-100 mt-2" /> : <Button variant="outline-primary" size="sm" className="mt-2">Selecionar</Button>}
                            </div>
                        </Card>
                    </Col>

                    <Col xs={12} lg={8}>                        
                    <FormularioExtracao 
                        dadosExtraidos={dadosExtraidos} 
                        setDadosExtraidos={setDadosExtraidos} 
                        statusIA={statusIA}
                        aguardandoDeclaracao={aguardandoDeclaracao}
                        erroTitularidade={erroTitularidade}
                        stBloqueioResp={stBloqueioResp}
                        validandoCPF={validandoCPF}
                        cpfValidoOficial={cpfValidoOficial}
                        consultarCpfNoBackend={consultarCpfNoBackend}
                        aplicarMascaraCPF={aplicarMascaraCPF}
                        ehMunicipioOficial={ehMunicipioOficial}
                        listaLogradouros={listaLogradouros}
                        setStEditadoManual={setStEditadoManual}
                        setLogradouroValido={setLogradouroValido}
                        logradouroValido={logradouroValido} // <--- ADICIONE ESTA
                        listaBairros={listaBairros}
                        setBairroValido={setBairroValido}
                        bairroValido={bairroValido} // <--- ADICIONE ESTA
                        erroCpfMensagem={erroCpfMensagem} // <--- ADICIONE ESTA
                        municipioSede={municipioSede} // <--- ADICIONE ESTA
                    />

                        <VerificacaoContato 
                            dadosExtraidos={dadosExtraidos} setDadosExtraidos={setDadosExtraidos}
                            statusIA={statusIA} aguardandoDeclaracao={aguardandoDeclaracao}
                            emailVerificado={emailVerificado} handleEnviarEmailOtp={handleEnviarEmailOtp}
                            enviandoEmailOtp={enviandoEmailOtp} emailEnviado={emailEnviado}
                            codigoOtpEmail={codigoOtpEmail} setCodigoOtpEmail={setCodigoOtpEmail}
                            handleValidarCodigoEmail={handleValidarCodigoEmail} validandoEmail={validandoEmail}
                            telefoneVerificado={telefoneVerificado} aplicarMascaraTelefone={aplicarMascaraTelefone}
                            handleEnviarSms={handleEnviarSms} enviandoSms={enviandoSms}
                            smsEnviado={smsEnviado} codigoOtp={codigoOtp} setCodigoOtp={setCodigoOtp}
                            handleValidarCodigo={handleValidarCodigo} validandoSms={validandoSms}
                        />
                    </Col>
                </Row>

                <div className="text-center mt-4 mb-4">
                    <Button variant="success" size="lg" className="w-100 rounded-pill shadow-lg fw-bold py-3" 
                        disabled={statusIA !== "concluido" || salvando || !telefoneVerificado || (dadosExtraidos.ds_email_atual && !emailVerificado)} 
                        onClick={handleSalvar}
                    >
                        {salvando ? <Spinner size="sm" animation="border" /> : "Confirmar e Finalizar"}
                    </Button>
                    <Button variant="link" className="text-muted small mt-2 text-decoration-none" onClick={() => navigate(-1)}><FaArrowLeft className="me-1" /> Voltar</Button>
                </div>
            </Container>

            <footer className="text-center py-3 text-muted bg-white border-top mt-auto" style={{fontSize: '10px'}}>Desenvolvido por <strong>PrefeituraPro</strong>. © 2026</footer>
        </div>
    );
};

export default Atualizacao;