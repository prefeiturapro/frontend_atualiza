import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { Button, Form, Container, Row, Col, Alert, Card, Navbar } from 'react-bootstrap';
import logo_prefeiturapro from '../../assets/imagem/logo_prefeiturapro.png';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

const LocalizaImovel = () => {
    const [inscricao, setInscricao] = useState("");
    const [cpf, setCpf] = useState("");
    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(false);
    
    const [configPrefeitura, setConfigPrefeitura] = useState({
        nome: "Portal do Cidadão Municipal",
        logo: "",
        email: ""
    });

    const navigate = useNavigate();

    useEffect(() => {
        let montado = true;

        const ultimaInscricao = localStorage.getItem("ultima_inscricao");
        const ultimoCpf = localStorage.getItem("ultimo_cpf");
        if (ultimaInscricao) setInscricao(ultimaInscricao);
        if (ultimoCpf) setCpf(ultimoCpf);

        const buscarConfiguracoes = async () => {
            try {
                const response = await fetch(`${API_URL}/dadosclientes/dados`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }
                });
                const data = await response.json();
            
                if (response.ok && data.nm_cliente && montado) {
                    setConfigPrefeitura({
                        nome: data.nm_cliente,
                        logo: data.by_brasaoprefeitura,
                        email: data.ds_email_cliente
                    });
                    localStorage.setItem("config_prefeitura", JSON.stringify(data));
                }
            } catch (err) {
                console.error("Erro ao carregar configurações:", err);
            }
        };

        buscarConfiguracoes();
        return () => { montado = false; };
    }, []);

    const handleLocalizar = async (e) => {
        e.preventDefault();
        setErro("");
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/dadosimoveis/dados`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inscricao, cpf }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.erro || "Erro ao localizar imóvel.");
            }

            localStorage.setItem("ultima_inscricao", inscricao);
            localStorage.setItem("ultimo_cpf", cpf);

            // Armazena o objeto vindo do banco (Incluso: id_dados_imoveis, etc)
            localStorage.setItem("dados_imovel", JSON.stringify(data));
            
            // AJUSTE: Agora navega para a tela de Autorização (LGPD) antes da validação
            navigate("/autorizacao"); 

        } catch (err) {
            setErro(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <Navbar bg="white" className="border-bottom shadow-sm py-3">
                <Container>
                    <Navbar.Brand className="d-flex align-items-center">
                        <img
                            src={configPrefeitura.logo || "/brasao_prefeitura.png"} 
                            alt="Brasão"
                            height="55"
                            className="me-3"
                            onError={(e) => { e.target.src = "/brasao_prefeitura.png"; }}
                        />
                        <div>
                            <div className="fw-bold mb-0 h5 text-dark">{configPrefeitura.nome}</div>
                            <div className="text-muted small">{configPrefeitura.email}</div>
                        </div>
                    </Navbar.Brand>
                </Container>
            </Navbar>

            <Container className="flex-grow-1 mt-5">
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
                    <Col md={5}>
                        <Card className="shadow-lg border-0 p-4 rounded-4">
                            <Card.Body>
                                <h4 className="text-center fw-bold mb-4">Identifique seu Imóvel</h4>
                                {erro && <Alert variant="danger" className="py-2 small">{erro}</Alert>}
                                
                                <Form onSubmit={handleLocalizar}>
                                    <Form.Group className="mb-3">
                                        <Form.Control 
                                            type="text" 
                                            name="inscricao_imobiliaria" 
                                            id="inscricao_imobiliaria"
                                            autoComplete="on" 
                                            placeholder="Inscrição Imobiliária (Código Reduzido)" 
                                            className="p-3 bg-light"
                                            value={inscricao}
                                            onChange={(e) => setInscricao(e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <Form.Control 
                                            type="text" 
                                            name="cpf_contribuinte" 
                                            id="cpf_contribuinte"
                                            autoComplete="username" 
                                            placeholder="CPF do Proprietário" 
                                            className="p-3 bg-light"
                                            value={cpf}
                                            onChange={(e) => setCpf(e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                    <Button variant="primary" type="submit" className="w-100 p-3 fw-bold shadow-sm" disabled={loading}>
                                        {loading ? "Buscando..." : "Localizar Imóvel"}
                                    </Button>
                                </Form>
                                <div className="text-center text-muted mt-4" style={{ fontSize: '0.75rem' }}>
                                    <p className="mb-0">Seus dados estão seguros conosco.</p>
                                    <strong>Lei Geral de Proteção de Dados (LGPD).</strong>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <footer className="bg-white border-top py-4 mt-5">
                <Container>
                    <Row className="justify-content-center">
                        <Col md={6} className="d-flex flex-column align-items-center text-center">
                            <div className="d-flex justify-content-center mb-3" style={{ width: '100%' }}>
                                <img
                                    src={logo_prefeiturapro}
                                    alt="Logo Empresa"
                                    style={{ 
                                        height: '60px', 
                                        width: 'auto',
                                        maxWidth: '120px',
                                        display: 'block',
                                        objectFit: 'contain' 
                                    }}
                                />
                            </div>
                            <div className="fw-bold text-dark h6">PrefeituraPro Soluções Municipais</div>
                            <div className="text-muted small">© 2026 Todos os direitos reservados.</div>
                        </Col>
                    </Row>
                </Container>
            </footer>
        </div>
    );
};

export default LocalizaImovel;