import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { Button, Form, Container, Row, Col, Alert, Card, Navbar, Spinner } from 'react-bootstrap';
import logo_prefeiturapro from '../../assets/imagem/logo_prefeiturapro.png';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

const LocalizaImovel = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        ds_inscricao: "",
        nr_cpf_resp: "",
        cd_reduzido: "",
        cd_responsavel: "",
        nm_responsavel: ""
    });

    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(false);
    const [configPronta, setConfigPronta] = useState(false);
    const [metodosLogin, setMetodosLogin] = useState({}); 
    const [configPrefeitura, setConfigPrefeitura] = useState({ nome: "", logo: "", email: "" });

    // Máscara de CPF
    const formatarCPF = (value) => {
        const d = value.replace(/\D/g, "");
        return d
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
            .substring(0, 14);
    };

    // Função de tratamento de imagem (Buffer para URL)
    const tratarImagem = (campo) => {
        if (campo && typeof campo === 'object' && (campo.type === 'Buffer' || Array.isArray(campo.data))) {
            try {
                const arrayBuffer = campo.data ? new Uint8Array(campo.data) : new Uint8Array(campo);
                const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
                return URL.createObjectURL(blob);
            } catch (e) {
                console.error("Erro ao converter brasão:", e);
                return null;
            }
        }
        return campo;
    };

    useEffect(() => {
        const carregarConfiguracoes = async () => {
            try {
                // 1. Busca Identidade (master.dados_clientes)
                const responseCliente = await fetch(`${API_URL}/dadosclientes/dados`, {
                    method: "POST", 
                    headers: { "Content-Type": "application/json" }
                });
                const dataCliente = await responseCliente.json();

                // 2. Busca Regras de Login (master.dados_gerais)
                const responseGerais = await fetch(`${API_URL}/dadosgerais/config`);
                const dataGerais = await responseGerais.json();
            
                if (responseCliente.ok && responseGerais.ok) {
                    setConfigPrefeitura({
                        nome: dataCliente.nm_cliente,
                        logo: tratarImagem(dataCliente.by_brasaoprefeitura),
                        email: dataCliente.ds_email_cliente
                    });

                    setMetodosLogin({
                        cpf: dataGerais.st_logincpf === "S",
                        inscricao: dataGerais.st_logininscricao === "S",
                        reduzido: dataGerais.st_loginreduzido === "S",
                        nome: dataGerais.st_loginpornome === "S",
                        codigoContribuinte: dataGerais.st_login_cod_cont === "S"
                    });

                    setFormData(prev => ({
                        ...prev,
                        ds_inscricao: localStorage.getItem("ultima_inscricao") || "",
                        nr_cpf_resp: formatarCPF(localStorage.getItem("ultimo_cpf") || "")
                    }));

                    localStorage.setItem("config_prefeitura", JSON.stringify(dataCliente));
                }
            } catch (err) {
                console.error("Erro ao carregar dados do backend:", err);
            } finally {
                setConfigPronta(true);
            }
        };

        carregarConfiguracoes();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "nr_cpf_resp") {
            setFormData({ ...formData, [name]: formatarCPF(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleLocalizar = async (e) => {
        e.preventDefault();
        setErro("");
        setLoading(true);

        // CRUCIAL: Filtra para enviar APENAS o que está visível e preenchido
        const dadosParaEnviar = {};
        if (metodosLogin.inscricao && formData.ds_inscricao) dadosParaEnviar.ds_inscricao = formData.ds_inscricao;
        if (metodosLogin.cpf && formData.nr_cpf_resp) dadosParaEnviar.nr_cpf_resp = formData.nr_cpf_resp;
        if (metodosLogin.reduzido && formData.cd_reduzido) dadosParaEnviar.cd_reduzido = formData.cd_reduzido;
        if (metodosLogin.codigoContribuinte && formData.cd_responsavel) dadosParaEnviar.cd_responsavel = formData.cd_responsavel;
        if (metodosLogin.nome && formData.nm_responsavel) dadosParaEnviar.nm_responsavel = formData.nm_responsavel;

        try {
            const response = await fetch(`${API_URL}/dadosimoveis/dados`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosParaEnviar),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.erro || "Cadastro não encontrado.");

            localStorage.setItem("ultima_inscricao", formData.ds_inscricao);
            localStorage.setItem("ultimo_cpf", formData.nr_cpf_resp);
            localStorage.setItem("dados_imovel", JSON.stringify(data));
            
            navigate("/autorizacao"); 
        } catch (err) {
            setErro(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            
            <Navbar bg="white" className="border-bottom py-3 shadow-sm">
                <Container>
                    <Navbar.Brand className="d-flex align-items-center w-100">
                        {configPrefeitura.logo ? (
                            <img src={configPrefeitura.logo} alt="Brasão" height="55" className="me-3" onError={(e) => { e.target.src = "/brasao_prefeitura.png"; }} />
                        ) : (
                            <div style={{ width: '55px', height: '55px' }} className="me-3 bg-light rounded d-flex align-items-center justify-content-center small text-muted">Logo</div>
                        )}
                        <div>
                            <h4 className="fw-bold mb-0 text-dark">{configPrefeitura.nome || "Portal do Cidadão"}</h4>
                            <div className="text-muted small">{configPrefeitura.email}</div>
                        </div>
                    </Navbar.Brand>
                </Container>
            </Navbar>

            <Container className="py-5 flex-grow-1">
                <Row className="justify-content-center text-center mb-4">
                    <Col md={6}>
                        <div className="d-flex justify-content-between align-items-center px-4">
                            <div className="d-flex flex-column align-items-center">
                                <div className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center mb-1" style={{ width: '30px', height: '30px' }}>1</div>
                                <span className="small fw-bold text-primary">Identificação</span>
                            </div>
                            <div className="flex-grow-1 border-top mx-2" style={{ marginTop: '-20px' }}></div>
                            <div className="d-flex flex-column align-items-center">
                                <div className="rounded-circle bg-light text-muted d-flex justify-content-center align-items-center mb-1 border" style={{ width: '30px', height: '30px' }}>2</div>
                                <span className="small text-muted">Autorização</span>
                            </div>
                            <div className="flex-grow-1 border-top mx-2" style={{ marginTop: '-20px' }}></div>
                            <div className="d-flex flex-column align-items-center">
                                <div className="rounded-circle bg-light text-muted d-flex justify-content-center align-items-center mb-1 border" style={{ width: '30px', height: '30px' }}>3</div>
                                <span className="small text-muted">Validação</span>
                            </div>
                        </div>
                    </Col>
                </Row>

                <Row className="justify-content-center">
                    <Col lg={5} md={7}>
                        <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
                            <Card.Body className="p-4 p-md-5">
                                <h4 className="text-center fw-bold mb-4">Identifique seu Imóvel</h4>
                                
                                {!configPronta ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="text-muted mt-2 small">Carregando configurações municipais...</p>
                                    </div>
                                ) : (
                                    <>
                                        {erro && <Alert variant="danger" className="text-center py-2 small">{erro}</Alert>}
                                        <Form onSubmit={handleLocalizar}>
                                            {metodosLogin.inscricao && (
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-bold small text-muted text-uppercase">Inscrição Imobiliária</Form.Label>
                                                    <Form.Control type="text" name="ds_inscricao" placeholder="Digite a inscrição" className="p-3 bg-light" value={formData.ds_inscricao} onChange={handleChange} required />
                                                </Form.Group>
                                            )}
                                            {metodosLogin.cpf && (
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-bold small text-muted text-uppercase">CPF do Proprietário</Form.Label>
                                                    <Form.Control type="text" name="nr_cpf_resp" placeholder="000.000.000-00" className="p-3 bg-light" value={formData.nr_cpf_resp} onChange={handleChange} required />
                                                </Form.Group>
                                            )}
                                            {metodosLogin.reduzido && (
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-bold small text-muted text-uppercase">Código Reduzido</Form.Label>
                                                    <Form.Control type="text" name="cd_reduzido" placeholder="Digite o reduzido" className="p-3 bg-light" value={formData.cd_reduzido} onChange={handleChange} required />
                                                </Form.Group>
                                            )}
                                            {metodosLogin.codigoContribuinte && (
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-bold small text-muted text-uppercase">Código Contribuinte</Form.Label>
                                                    <Form.Control type="text" name="cd_responsavel" placeholder="Digite o código" className="p-3 bg-light" value={formData.cd_responsavel} onChange={handleChange} required />
                                                </Form.Group>
                                            )}
                                            {metodosLogin.nome && (
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-bold small text-muted text-uppercase">Nome do Proprietário</Form.Label>
                                                    <Form.Control type="text" name="nm_responsavel" placeholder="Nome completo" className="p-3 bg-light" value={formData.nm_responsavel} onChange={handleChange} required />
                                                </Form.Group>
                                            )}
                                            <Button variant="primary" type="submit" className="w-100 p-3 fw-bold shadow-sm mt-2 text-uppercase" disabled={loading}>
                                                {loading ? <Spinner size="sm" animation="border" /> : "Localizar Imóvel"}
                                            </Button>
                                        </Form>
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <footer className="text-center py-4 text-muted bg-white border-top">
                <Container>
                    <img src={logo_prefeiturapro} alt="Logo Empresa" style={{ height: '55px' }} className="mb-2" />
                    <div><small>Desenvolvido por <strong>PrefeituraPro Soluções Municipais</strong>. © 2026</small></div>
                </Container>
            </footer>
        </div>
    );
};

export default LocalizaImovel;