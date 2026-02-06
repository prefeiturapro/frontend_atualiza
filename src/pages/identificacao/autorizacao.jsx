import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form, Navbar } from 'react-bootstrap';
import { FaShieldAlt, FaLock, FaCheckCircle } from 'react-icons/fa';

const Autorizacao = () => {
    const navigate = useNavigate();
    const [aceitou, setAceitou] = useState(false);
    const [configPrefeitura, setConfigPrefeitura] = useState({ nome: "", logo: "" });

    useEffect(() => {
        const storedConfig = localStorage.getItem("config_prefeitura");
        if (storedConfig) {
            const config = JSON.parse(storedConfig);
            setConfigPrefeitura({ nome: config.nm_cliente, logo: config.by_brasaoprefeitura });
        }
    }, []);

    const handleProsseguir = () => {
        if (aceitou) {
            navigate("/validacao"); // Segue o fluxo para a validação por SMS
        }
    };

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar bg="white" className="border-bottom shadow-sm py-3">
                <Container>
                    <Navbar.Brand className="d-flex align-items-center">
                        <img src={configPrefeitura.logo || "/brasao_prefeitura.png"} alt="Brasão" height="50" className="me-3" />
                        <div className="fw-bold text-dark">{configPrefeitura.nome}</div>
                    </Navbar.Brand>
                </Container>
            </Navbar>

            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
                            <div className="bg-primary p-4 text-white text-center">
                                <FaShieldAlt size={50} className="mb-3" />
                                <h4 className="fw-bold mb-0">Termo de Consentimento e LGPD</h4>
                            </div>
                            <Card.Body className="p-4">
                                <div className="mb-4 text-muted" style={{ textAlign: 'justify', fontSize: '0.95rem' }}>
                                    <p>Para prosseguir com a sua <strong>Atualização Cadastral Imobiliária</strong>, precisamos processar alguns dos seus dados pessoais e documentos.</p>
                                    
                                    <p><FaLock className="me-2 text-primary" /> <strong>Segurança:</strong> Seus dados serão utilizados exclusivamente para a finalidade de atualização tributária municipal, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
                                    
                                    <p>Ao clicar em aceitar, você autoriza a Prefeitura a:</p>
                                    <ul>
                                        <li>Realizar a leitura de documentos via Inteligência Artificial.</li>
                                        <li>Validar sua identidade através de SMS (OTP).</li>
                                        <li>Armazenar as informações atualizadas em nossa base de dados segura.</li>
                                    </ul>
                                </div>

                                <Form.Group className="mb-4 bg-light p-3 rounded-3 border">
                                    <Form.Check 
                                        type="checkbox"
                                        id="check-lgpd"
                                        label="Li e concordo com os termos de uso e processamento de dados pessoais para fins de atualização cadastral."
                                        className="fw-bold small"
                                        checked={aceitou}
                                        onChange={(e) => setAceitou(e.target.checked)}
                                    />
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button 
                                        variant="success" 
                                        size="lg" 
                                        className="rounded-pill fw-bold shadow" 
                                        disabled={!aceitou}
                                        onClick={handleProsseguir}
                                    >
                                        <FaCheckCircle className="me-2" /> Aceitar e Prosseguir
                                    </Button>
                                    <Button 
                                        variant="link" 
                                        className="text-muted text-decoration-none"
                                        onClick={() => navigate("/")}
                                    >
                                        Cancelar e Sair
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                        <div className="text-center mt-4 text-muted small">
                            © 2026 Prefeitura Municipal - Portal do Cidadão
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Autorizacao;