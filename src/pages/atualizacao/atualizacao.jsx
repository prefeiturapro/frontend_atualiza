import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container, Row, Col, Card, Button, Navbar, ProgressBar, Form, Spinner, Alert, InputGroup 
} from 'react-bootstrap';
import { 
    FaFileUpload, FaArrowLeft, FaExclamationTriangle, FaUniversity, FaSyncAlt, FaInfoCircle, FaMobileAlt, FaCheckCircle, FaEdit, FaMapMarkerAlt, FaEnvelope, FaIdCard
} from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

const Atualizacao = () => {
    const navigate = useNavigate();
    const [dados, setDados] = useState(null);
    const [statusIA, setStatusIA] = useState("esperando");
    const [progresso, setProgresso] = useState(0);
    const [salvando, setSalvando] = useState(false);
    const [erroTitularidade, setErroTitularidade] = useState(null);

    // --- ESTADOS PARA VALIDAÇÃO DE CPF ---
    const [validandoCPF, setValidandoCPF] = useState(false);
    const [cpfValidoOficial, setCpfValidoOficial] = useState(null); 
    const [erroCpfMensagem, setErroCpfMensagem] = useState("");

    // --- ESTADO DE CONFIGURAÇÃO MESTRE ---
    const [stBloqueioResp, setStBloqueioResp] = useState("N"); 

    // --- ESTADOS PARA TRAVA GEOGRÁFICA ---
    const [ehMunicipioOficial, setEhMunicipioOficial] = useState(false);
    const [municipioSede, setMunicipioSede] = useState("");
    const [carregandoConfig, setCarregandoConfig] = useState(true);

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
        nm_rua_extr: "", 
        ds_numero_extr: "",
        nr_cep_extr: "",
        ds_bairro_extr: "",
        ds_cidade_extr: ""
    });

    const [dadosExtraidos, setDadosExtraidos] = useState({
        cd_contribuinte: "", nm_contribuinte: "",
        nr_cpf_atual: "", nm_rua_atual: "",
        ds_numero_atual: "", ds_bairro_atual: "",
        ds_cidade_atual: "", nr_cep_atual: "",
        nr_telefone_atual: "",  ds_email_atual: "",
        ds_obs: "",
        st_responsavel: "N" 
    });

    const [configPrefeitura, setConfigPrefeitura] = useState({ NOME: "", logo: "" });

    // Lógica para travar campos se a autodeclaração for necessária e não estiver como "S"
    const aguardandoDeclaracao = erroTitularidade && stBloqueioResp === 'S' && dadosExtraidos.st_responsavel !== 'S';

    // --- MÁSCARAS ---
    const aplicarMascaraCPF = (v) => {
        v = v.replace(/\D/g, "");
        if (v.length <= 11) {
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        }
        return v;
    };

    // --- CONSULTA CPF NO BACKEND ---
    const consultarCpfNoBackend = async (cpfInformado) => {
        const nrLimpo = cpfInformado.replace(/\D/g, "");
        if (nrLimpo.length !== 11) return;

        setValidandoCPF(true);
        setCpfValidoOficial(null);
        setErroCpfMensagem("");

        try {
            const response = await fetch(`${API_URL}/dadoscontribuintes/validar-cpf/${nrLimpo}`);
            const data = await response.json();

            if (data.status) {
                const nomeReceita = data.result.nome;
                const score = verificarSimilaridade(nomeReceita, dadosExtraidos.nm_contribuinte);

                if (score >= 75) {
                    setCpfValidoOficial(true);
                } else {
                    setCpfValidoOficial(false);
                    setErroCpfMensagem(`ESTE CPF PERTENCE A ${nomeReceita} E NÃO AO TITULAR DO COMPROVANTE.`);
                }
            } else {
                setCpfValidoOficial(false);
                setErroCpfMensagem(data.message || "CPF NÃO LOCALIZADO NA RECEITA.");
            }
        } catch (error) {
            setErroCpfMensagem("ERRO AO CONECTAR COM O SERVIÇO DE VALIDAÇÃO.");
        } finally {
            setValidandoCPF(false);
        }
    };

    // --- BUSCA CONFIGURAÇÕES GERAIS ---
    const carregarDadosGerais = async () => {
        try {
            const response = await fetch(`${API_URL}/dadosgerais/config`); 
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            const data = await response.json();
            if (data.sucesso) {
                const valorLimpo = String(data.st_bloqueioresp || "N").trim().toUpperCase();
                setStBloqueioResp(valorLimpo);
            }
        } catch (error) {
            console.error("Erro ao carregar dados gerais:", error.message);
        }
    };

    const carregarMunicipioSede = async () => {
        try {
            const response = await fetch(`${API_URL}/dadosmunicipios/padrao`, { method: "POST" });
            const data = await response.json();
            if (response.ok) {
                setMunicipioSede(data.nm_municipio);
            }
        } catch (error) {
            console.error("Erro ao carregar município sede:", error);
        } finally {
            setCarregandoConfig(false);
        }
    };

    const validarBairroNoBanco = async (nomeBairro) => {
        if (!nomeBairro) return;
        const nomeLimpo = nomeBairro.trim().toUpperCase();
        try {
            const response = await fetch(`${API_URL}/dadosbairros/validar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nm_bairro: nomeLimpo })
            });
            const result = await response.json();
            if (result.valido) {
                setBairroValido(true);
                setDadosExtraidos(prev => ({ ...prev, ds_bairro_atual: result.nomeOficial }));
            } else { setBairroValido(false); }
            setStEditadoManual("S");
        } catch (error) { console.error("Erro ao validar bairro:", error); }
    };

    const validarLogradouroNoBanco = async (nomeLogradouro) => {
        if (!nomeLogradouro) return;
        const nomeLimpo = nomeLogradouro.trim().toUpperCase();
        try {
            const response = await fetch(`${API_URL}/dadoslogradouros/validar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nm_logradouro: nomeLimpo })
            });
            const result = await response.json();
            if (result.valido) {
                setLogradouroValido(true);
                setDadosExtraidos(prev => ({ ...prev, nm_rua_atual: result.nomeOficial }));
            } else { setLogradouroValido(false); }
            setStEditadoManual("S");
        } catch (error) { console.error("Erro ao validar logradouro:", error); }
    };

    const handleEnviarEmailOtp = async () => {
        if (!dadosExtraidos.ds_email_atual || !dadosExtraidos.ds_email_atual.includes("@")) {
            alert("Por favor, informe um e-mail válido.");
            return;
        }
        setEnviandoEmailOtp(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/enviar-otp-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: dadosExtraidos.ds_email_atual.toLowerCase() })
            });
            if (response.ok) {
                setEmailEnviado(true);
                alert("Código enviado para seu e-mail!");
            }
        } catch (error) { alert("Erro de conexão."); }
        finally { setEnviandoEmailOtp(false); }
    };

    const handleValidarCodigoEmail = async () => {
        setValidandoEmail(true); 
        try {
            const response = await fetch(`${API_URL}/api/auth/validar-otp-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: dadosExtraidos.ds_email_atual.toLowerCase(), codigo: codigoOtpEmail })
            });
            const result = await response.json();
            if (result.sucesso) {
                setEmailVerificado(true);
                alert("E-mail verificado com sucesso!");
            } else { alert("Código inválido."); }
        } catch (error) { alert("Erro ao validar e-mail."); }
        finally { setValidandoEmail(false); }
    };

    const aplicarMascaraTelefone = (valor) => {
        if (!valor) return "";
        valor = valor.replace(/\D/g, "");
        valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2");
        valor = valor.replace(/(\d{5})(\d)/, "$1-$2");
        return valor.substring(0, 15);
    };

    const handleEnviarSms = async () => {
        if (!dadosExtraidos.nr_telefone_atual || dadosExtraidos.nr_telefone_atual.length < 10) {
            alert("Informe um celular válido.");
            return;
        }
        setEnviandoSms(true);
        try {
            const telLimpo = `+55${dadosExtraidos.nr_telefone_atual.replace(/\D/g, "")}`;
            const response = await fetch(`${API_URL}/api/auth/enviar-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ telefone: telLimpo })
            });
            if (response.ok) { setSmsEnviado(true); alert("Código enviado!"); }
        } catch (error) { alert("Erro de conexão."); }
        finally { setEnviandoSms(false); }
    };

    const handleValidarCodigo = async () => {
        setValidandoSms(true);
        try {
            const telLimpo = `+55${dadosExtraidos.nr_telefone_atual.replace(/\D/g, "")}`;
            const response = await fetch(`${API_URL}/api/auth/validar-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ telefone: telLimpo, codigo: codigoOtp })
            });
            const result = await response.json();
            if (result.sucesso) { setTelefoneVerificado(true); alert("Identidade confirmada!"); }
        } catch (error) { alert("Erro ao validar."); }
        finally { setValidandoSms(false); }
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
        carregarMunicipioSede();
        carregarDadosGerais();
    }, [navigate]);

    const processarArquivoReal = async (e) => {
        const arquivo = e.target.files[0];
        if (!arquivo) return;

        // --- ROTINA DE LIMPEZA GERAL ---
        setErroTitularidade(null);
        setCpfValidoOficial(null);
        setErroCpfMensagem("");
        setEmailEnviado(false);
        setEmailVerificado(false);
        setSmsEnviado(false);
        setTelefoneVerificado(false);
        setCodigoOtp("");
        setCodigoOtpEmail("");
        setStEditadoManual("N");
        setLogradouroValido(true);
        setBairroValido(true);
        
        // Limpa os dados extraídos, preservando apenas o código do contribuinte
        setDadosExtraidos({
            cd_contribuinte: dados?.id_dados_imoveis || "",
            nm_contribuinte: "",
            nr_cpf_atual: "",
            nm_rua_atual: "",
            ds_numero_atual: "",
            ds_bairro_atual: "",
            ds_cidade_atual: "",
            nr_cep_atual: "",
            nr_telefone_atual: "",
            ds_email_atual: "",
            ds_obs: "",
            st_responsavel: "N"
        });

        setStatusIA("processando");
        setProgresso(30); 

        const formData = new FormData();
        formData.append('comprovante', arquivo); 
        try {
            const response = await fetch(`${API_URL}/dadoscontribuintes/processar-comprovante`, {
                method: "POST",
                body: formData, 
            });
            const dataOCR = await response.json();
            if (!response.ok) throw new Error(dataOCR.erro || "Falha na leitura.");
            setProgresso(100);
            
            const nomeLido = dataOCR.nm_contribuinte || "";
            const nomeNoSistema = dados.nm_responsavel;
            const score = verificarSimilaridade(nomeNoSistema, nomeLido);

            if (score < 50 && stBloqueioResp === "N") {
                setStatusIA("esperando");
                setErroTitularidade(`BLOQUEIO: O NOME NO COMPROVANTE (${nomeLido}) É DIFERENTE DO PROPRIETÁRIO (${nomeNoSistema}). ESTA PREFEITURA NÃO PERMITE ALTERAÇÕES PARA TERCEIROS.`);
                setDadosExtraidos(prev => ({ ...prev, nm_contribuinte: nomeLido, st_responsavel: "N" }));
            } else {
                setStatusIA("concluido");
                if (score < 50 && stBloqueioResp === "S") {
                    setErroTitularidade(`AVISO: TITULARIDADE DIFERENTE (${nomeLido}), MAS A EDIÇÃO FOI LIBERADA PELA PREFEITURA.`);
                }
                setDadosOriginaisOCR({
                    nm_rua_extr: dataOCR.nm_rua_atual || "",
                    ds_numero_extr: dataOCR.ds_numero_atual || "",
                    nr_cep_extr: dataOCR.nr_cep_atual || "",
                    ds_bairro_extr: dataOCR.ds_bairro_atual || "",
                    ds_cidade_extr: dataOCR.ds_cidade_atual || ""
                });

                setDadosExtraidos(prev => ({ ...prev, ...dataOCR, ds_obs: "Validado via AtualizaAI Vision" }));
                
                const cidadeLida = (dataOCR.ds_cidade_atual || "").toUpperCase().trim();
                const cidadeSede = (municipioSede || "").toUpperCase().trim();

                if (cidadeLida === cidadeSede && cidadeSede !== "") {
                    setEhMunicipioOficial(true);
                    if (dataOCR.ds_bairro_atual) await validarBairroNoBanco(dataOCR.ds_bairro_atual);
                    if (dataOCR.nm_rua_atual) await validarLogradouroNoBanco(dataOCR.nm_rua_atual);
                } else {
                    setEhMunicipioOficial(false); setBairroValido(false); setLogradouroValido(false); setStEditadoManual("S");
                }
            }
        } catch (error) {
            setStatusIA("esperando"); setErroTitularidade(error.message);
        }
    };

    const handleSalvar = async () => {
        if (erroTitularidade && stBloqueioResp === 'S' && dadosExtraidos.st_responsavel !== 'S') {
            alert("Você precisa se declarar responsável pelo imóvel para continuar.");
            return;
        }
        if (cpfValidoOficial !== true) {
            alert("Valide o CPF corretamente antes de prosseguir.");
            return;
        }
        if (!telefoneVerificado) {
            alert("Validação por SMS obrigatória!"); return;
        }
        if (dadosExtraidos.ds_email_atual && !emailVerificado) {
            alert("A verificação do e-mail é obrigatória!"); return;
        }
        setSalvando(true);
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const random = Math.floor(Math.random() * 999).toString().padStart(3, '0');
        const nrProtocolo = `${date}-${random}`;
        
        const dadosParaEnviar = {
            ...dadosExtraidos,
            id_dados_imoveis: dados.id_dados_imoveis,
            ds_inscricao_imovel: dados.ds_inscricao,
            cd_reduzido_imovel: dados.cd_reduzido,
            cd_responsavel: dados.cd_responsavel,
            ds_protocolo: nrProtocolo,
            st_editado_manual: stEditadoManual,
            nm_rua_extr: dadosOriginaisOCR.nm_rua_extr,
            ds_numero_extr: dadosOriginaisOCR.ds_numero_extr,
            nr_cep_extr: dadosOriginaisOCR.nr_cep_extr,
            ds_bairro_extr: dadosOriginaisOCR.ds_bairro_extr,
            ds_cidade_extr: dadosOriginaisOCR.ds_cidade_extr,
            tp_rua_extr: 'RUA'
        };

        try {
            const response = await fetch(`${API_URL}/dadoscontribuintes/salvar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosParaEnviar)
            });
            if (response.ok) {
                localStorage.setItem("protocolo_gerado", nrProtocolo);
                navigate("/conclusao"); 
            } else { alert("Erro ao persistir os dados."); }
        } catch (error) { alert("Erro de conexão."); }
        finally { setSalvando(false); }
    };

    if (!dados || carregandoConfig) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <Navbar bg="white" className="border-bottom py-2 shadow-sm">
                <Container>
                    <Navbar.Brand className="d-flex align-items-center">
                        <img src={configPrefeitura.logo} alt="Brasão" height="40" className="me-3" onError={(e) => { e.target.src = "/brasao_prefeitura.png"; }} />
                        <h5 className="fw-bold mb-0 text-dark">{configPrefeitura.NOME}</h5>
                    </Navbar.Brand>
                </Container>
            </Navbar>

            <Container className="py-4">                
                <Card className="border-0 shadow-sm rounded-4 mb-4" style={{ borderLeft: '8px solid #6c757d' }}>
                    <Card.Body className="bg-light rounded-4 p-4">
                        <div className="mb-3 border-bottom pb-3">
                            <div className="d-flex align-items-center text-secondary mb-1">
                                <FaUniversity className="me-2" />
                                <h6 className="fw-bold mb-0 text-uppercase ls-1">Informações na Base da Prefeitura (Atual)</h6>
                            </div>
                            <small className="text-muted d-flex align-items-center">
                                <FaInfoCircle className="me-1" /> Dados atuais do sistema.
                            </small>
                        </div>
                        <Row className="g-3 small text-muted text-uppercase">
                            <Col md={4}><strong>NOME:</strong><br/><span className="text-dark fw-bold">{dados.nm_responsavel}</span></Col>
                            <Col md={5}><strong>ENDEREÇO:</strong><br/><span className="text-dark fw-bold">{dados.nm_logradouro_resp}, {dados.ds_numero_resp}</span></Col>
                            <Col md={3}><strong>BAIRRO:</strong><br/><span className="text-dark fw-bold">{dados.nm_bairro_resp}</span></Col>
                            <Col md={3}><strong>CIDADE:</strong><br/><span className="text-dark fw-bold">{dados.ds_cidade_resp || 'CRICIÚMA'}</span></Col>
                            <Col md={2}><strong>CEP:</strong><br/><span className="text-dark fw-bold">{dados.nr_cep_resp}</span></Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Row>
                    <Col lg={4} className="mb-4">
                        <Card className={`border-0 shadow-sm rounded-4 p-3 h-100 ${erroTitularidade && stBloqueioResp === 'N' ? 'border-danger border-2' : ''}`}>
                            <div className="border-dashed rounded-4 p-4 text-center d-flex flex-column align-items-center justify-content-center h-100" 
                                 style={{ border: '2px dashed #0d6efd', backgroundColor: '#f8fbff', cursor: 'pointer' }}
                                 onClick={() => document.getElementById('up-doc').click()}>
                                <FaFileUpload size={40} className={erroTitularidade && stBloqueioResp === 'N' ? "text-danger mb-3" : "text-primary mb-3"} />
                                <h6 className={`fw-bold ${erroTitularidade && stBloqueioResp === 'N' ? 'text-danger' : 'text-primary'}`}>ANEXAR COMPROVANTE</h6>
                                <p className="text-muted small">Conta de Luz ou Água recente.</p>
                                <input type="file" id="up-doc" hidden onChange={processarArquivoReal} accept="image/*,.pdf" />
                                {statusIA === "processando" ? <ProgressBar animated now={progresso} className="w-100 mt-2" style={{height: '8px'}} /> : <Button variant={erroTitularidade && stBloqueioResp === 'N' ? "danger" : "outline-primary"} size="sm" className="rounded-pill mt-2 px-4 shadow-sm">Selecionar</Button>}
                            </div>
                        </Card>
                    </Col>

                    <Col lg={8} className="mb-4">
                        {erroTitularidade && (
                            <Alert variant={stBloqueioResp === 'N' ? 'danger' : 'warning'} className="py-2 shadow-sm border-0 mb-3 text-uppercase small">
                                {erroTitularidade}
                            </Alert>
                        )}
                        <Card className="border-0 shadow rounded-4 p-4" style={{ borderTop: '6px solid #198754' }}>
                            <div className="mb-4 border-bottom pb-3">
                                <div className="d-flex align-items-center text-success mb-1">
                                    <FaSyncAlt className="me-2" />
                                    <h6 className="fw-bold mb-0 text-uppercase">Dados Extraídos</h6>
                                </div>
                            </div>

                            <Form className="text-uppercase">
                                <Row className="g-3">
                                    <Col md={12}>
                                        <Form.Label className="small fw-bold text-success">NOME NO DOCUMENTO</Form.Label>
                                        <Form.Control size="sm" className="bg-white fw-bold" value={dadosExtraidos.nm_contribuinte} readOnly />
                                    </Col>

                                    {/* BLOCO DE RESPONSÁVEL */}
                                    {erroTitularidade && stBloqueioResp === 'S' && (
                                        <Col md={12} className="mb-3">
                                            <div className="p-3 border rounded-3 bg-light border-warning shadow-sm">
                                                <Form.Label className="small fw-bold text-dark d-flex align-items-center">
                                                    <FaEdit className="me-2 text-warning"/> VOCÊ É O RESPONSÁVEL PELO IMÓVEL?
                                                </Form.Label>
                                                <Form.Select 
                                                    size="sm" 
                                                    className="fw-bold border-warning"
                                                    value={dadosExtraidos.st_responsavel}
                                                    onChange={(e) => setDadosExtraidos({...dadosExtraidos, st_responsavel: e.target.value})}
                                                >
                                                    <option value="N">SELECIONE UMA OPÇÃO...</option>
                                                    <option value="S">SIM, SOU O RESPONSÁVEL</option>
                                                    <option value="N">NÃO SOU O RESPONSÁVEL</option>
                                                </Form.Select>
                                                <small className="text-muted" style={{fontSize: '11px'}}>* Necessário confirmar para liberar a edição abaixo.</small>
                                            </div>
                                        </Col>
                                    )}

                                    {/* CAMPO CPF */}
                                    <Col md={6}>
                                        <Form.Label className="small fw-bold text-primary"><FaIdCard className="me-1"/> CPF DO RESPONSÁVEL</Form.Label>
                                        <InputGroup size="sm">
                                            <Form.Control 
                                                placeholder="000.000.000-00" 
                                                value={dadosExtraidos.nr_cpf_atual} 
                                                onChange={(e) => setDadosExtraidos({...dadosExtraidos, nr_cpf_atual: aplicarMascaraCPF(e.target.value)})} 
                                                onBlur={(e) => consultarCpfNoBackend(e.target.value)}
                                                readOnly={statusIA !== "concluido" || aguardandoDeclaracao}
                                                className={`fw-bold ${cpfValidoOficial === true ? "border-success" : cpfValidoOficial === false ? "border-danger" : ""}`}
                                            />
                                            {validandoCPF && <InputGroup.Text className="bg-white"><Spinner animation="border" size="sm" /></InputGroup.Text>}
                                        </InputGroup>
                                        {cpfValidoOficial === true && <small className="text-success fw-bold">✓ VALIDADO NA RECEITA</small>}
                                        {cpfValidoOficial === false && <small className="text-danger fw-bold">{erroCpfMensagem}</small>}
                                    </Col>

                                    <Col md={6}></Col>

                                    <Col md={9}>
                                        <Form.Label className="small fw-bold">RUA/LOGRADOURO</Form.Label>
                                        <InputGroup size="sm">
                                            <Form.Control 
                                                value={dadosExtraidos.nm_rua_atual} 
                                                onChange={(e) => {
                                                    setDadosExtraidos({...dadosExtraidos, nm_rua_atual: e.target.value.toUpperCase()});
                                                    if(logradouroValido) setLogradouroValido(false); 
                                                }}
                                                onBlur={(e) => ehMunicipioOficial && validarLogradouroNoBanco(e.target.value)}
                                                readOnly={statusIA !== "concluido" || aguardandoDeclaracao} 
                                                className={`fw-bold ${statusIA === "concluido" && !aguardandoDeclaracao ? (ehMunicipioOficial ? (logradouroValido ? "border-success bg-white" : "border-danger bg-white") : "border-primary bg-white") : "bg-light"}`}
                                            />
                                        </InputGroup>
                                        {statusIA === "concluido" && !aguardandoDeclaracao && (
                                            <small className={`fw-bold ${ehMunicipioOficial ? (logradouroValido ? "text-success" : "text-danger") : "text-primary"}`} style={{fontSize: '10px'}}>
                                                {!ehMunicipioOficial ? <><FaMapMarkerAlt className="me-1"/> Endereço fora de {municipioSede}. Digitação livre permitida.</> : (logradouroValido ? <><FaCheckCircle className="me-1"/> Logradouro oficial localizado.</> : <><FaExclamationTriangle className="me-1"/> Logradouro não encontrado na base oficial de {municipioSede}.</>)}
                                            </small>
                                        )}
                                    </Col>

                                    <Col md={3}>
                                        <Form.Label className="small fw-bold">Nº</Form.Label>
                                        <Form.Control size="sm" value={dadosExtraidos.ds_numero_atual} onChange={(e) => setDadosExtraidos({...dadosExtraidos, ds_numero_atual: e.target.value})} readOnly={statusIA !== "concluido" || (ehMunicipioOficial && dadosExtraidos.ds_numero_atual !== "") || aguardandoDeclaracao} />
                                    </Col>
                                    
                                    <Col md={5}>
                                        <Form.Label className="small fw-bold">BAIRRO</Form.Label>
                                        <InputGroup size="sm">
                                            <Form.Control 
                                                value={dadosExtraidos.ds_bairro_atual} 
                                                onChange={(e) => {
                                                    setDadosExtraidos({...dadosExtraidos, ds_bairro_atual: e.target.value.toUpperCase()});
                                                    if(bairroValido) setBairroValido(false); 
                                                }}
                                                onBlur={(e) => ehMunicipioOficial && validarBairroNoBanco(e.target.value)}
                                                readOnly={statusIA !== "concluido" || (ehMunicipioOficial && bairroValido) || aguardandoDeclaracao}
                                                className={`fw-bold ${statusIA === "concluido" && !aguardandoDeclaracao ? (ehMunicipioOficial ? (bairroValido ? "border-success bg-white" : "border-danger bg-white") : "border-primary bg-white") : "bg-light"}`}
                                            />
                                        </InputGroup>
                                        {statusIA === "concluido" && !aguardandoDeclaracao && (
                                            <small className={`fw-bold ${ehMunicipioOficial ? (bairroValido ? "text-success" : "text-danger") : "text-primary"}`} style={{fontSize: '10px'}}>
                                                {!ehMunicipioOficial ? <><FaMapMarkerAlt className="me-1"/> Endereço de outro município. Digitação livre permitida.</> : (bairroValido ? <><FaCheckCircle className="me-1"/> Bairro oficial localizado.</> : <><FaExclamationTriangle className="me-1"/> Bairro não encontrado na base oficial de {municipioSede}.</>)}
                                            </small>
                                        )}
                                    </Col>

                                    <Col md={4}><Form.Label className="small fw-bold">CIDADE</Form.Label><Form.Control size="sm" value={dadosExtraidos.ds_cidade_atual} onChange={(e) => setDadosExtraidos({...dadosExtraidos, ds_cidade_atual: e.target.value.toUpperCase()})} readOnly={statusIA !== "concluido" || ehMunicipioOficial || aguardandoDeclaracao} /></Col>
                                    <Col md={3}><Form.Label className="small fw-bold">CEP</Form.Label><Form.Control size="sm" value={dadosExtraidos.nr_cep_atual} onChange={(e) => setDadosExtraidos({...dadosExtraidos, nr_cep_atual: e.target.value})} readOnly={statusIA !== "concluido" || ehMunicipioOficial || aguardandoDeclaracao} /></Col>
                                    
                                    <Col md={12} className="mt-3">
                                        <Form.Label className="small fw-bold text-primary"><FaEnvelope className="me-1"/> E-MAIL</Form.Label>
                                        <InputGroup size="sm">
                                            <Form.Control className="text-lowercase fw-bold" value={dadosExtraidos.ds_email_atual} onChange={(e) => setDadosExtraidos({...dadosExtraidos, ds_email_atual: e.target.value})} readOnly={statusIA !== "concluido" || emailVerificado || aguardandoDeclaracao} placeholder="exemplo@email.com" />
                                            {dadosExtraidos.ds_email_atual && !emailVerificado && statusIA === "concluido" && !aguardandoDeclaracao && (
                                                <Button variant="primary" onClick={handleEnviarEmailOtp} disabled={enviandoEmailOtp}>
                                                    {enviandoEmailOtp ? <Spinner size="sm" animation="border" /> : (emailEnviado ? "Reenviar" : "Verificar")}
                                                </Button>
                                            )}
                                        </InputGroup>
                                    </Col>

                                    {emailEnviado && !emailVerificado && !aguardandoDeclaracao && (
                                        <Col md={6}>
                                            <Form.Label className="small fw-bold text-warning">CÓDIGO E-MAIL</Form.Label>
                                            <InputGroup size="sm">
                                                <Form.Control value={codigoOtpEmail} onChange={(e) => setCodigoOtpEmail(e.target.value)} placeholder="CÓDIGO" />
                                                <Button variant="warning" onClick={handleValidarCodigoEmail} disabled={validandoEmail}>Validar</Button>
                                            </InputGroup>
                                        </Col>
                                    )}

                                    <Col md={12} className="mt-4 pt-3 border-top">
                                        <h6 className="fw-bold text-primary mb-3"><FaMobileAlt className="me-2"/>Assinatura via Celular</h6>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label className="small fw-bold text-primary">CELULAR</Form.Label>
                                        <InputGroup size="sm">
                                            <Form.Control value={dadosExtraidos.nr_telefone_atual} onChange={(e) => setDadosExtraidos({...dadosExtraidos, nr_telefone_atual: aplicarMascaraTelefone(e.target.value)})} disabled={telefoneVerificado || statusIA !== "concluido" || aguardandoDeclaracao} placeholder="(48) 99999-9999" />
                                            {!telefoneVerificado && statusIA === "concluido" && !aguardandoDeclaracao && (
                                                <Button variant="primary" onClick={handleEnviarSms} disabled={enviandoSms}>Enviar SMS</Button>
                                            )}
                                        </InputGroup>
                                    </Col>
                                    {smsEnviado && !telefoneVerificado && !aguardandoDeclaracao && (
                                        <Col md={6}>
                                            <Form.Label className="small fw-bold text-warning">CÓDIGO SMS</Form.Label>
                                            <InputGroup size="sm">
                                                <Form.Control value={codigoOtp} onChange={(e) => setCodigoOtp(e.target.value)} />
                                                <Button variant="warning" onClick={handleValidarCodigo} disabled={validandoSms}>Validar</Button>
                                            </InputGroup>
                                        </Col>
                                    )}
                                    {telefoneVerificado && <Col md={12}><Alert variant="success" className="py-2 mb-0 small"><FaCheckCircle className="me-2" />Identidade confirmada!</Alert></Col>}
                                </Row>
                            </Form>
                        </Card>
                    </Col>
                </Row>

                <div className="text-center mt-4 border-top pt-4">
                    <Button 
                        variant="success" size="lg" className="px-5 rounded-pill shadow-lg fw-bold" 
                        disabled={statusIA !== "concluido" || salvando || !telefoneVerificado || (dadosExtraidos.ds_email_atual && !emailVerificado) || aguardandoDeclaracao || cpfValidoOficial !== true} 
                        onClick={handleSalvar}
                    >
                        {salvando ? <Spinner size="sm" animation="border" /> : "Confirmar e Finalizar"}
                    </Button>
                    <div className="mt-3">
                        <Button variant="link" className="text-muted small text-decoration-none" onClick={() => navigate(-1)}><FaArrowLeft className="me-1" /> Voltar</Button>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default Atualizacao;