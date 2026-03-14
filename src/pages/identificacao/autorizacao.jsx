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
                const imovelData = JSON.parse(localStorage.getItem("dados_imovel_buscado") || "{}");
                const configGeral = JSON.parse(localStorage.getItem("config_prefeitura") || "{}");

                const temCMC = imovelData.cd_cmc && imovelData.cd_cmc !== "0" && imovelData.cd_cmc !== 0;
                const permiteCMC = configGeral.st_bloqueiacmc === 'S';

                if (temCMC && !permiteCMC) {
                    alert("Atenção: Este cadastro possui vínculo com CMC e não permite atualização via portal. Por favor, entre em contato com a Secretaria de Fazenda.");
                    return; // Interrompe a navegação
                }

                navigate("/validacao");
        }
    };

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* CABEÇALHO PADRONIZADO E RESPONSIVO */}
            <Navbar bg="white" className="border-bottom py-2 shadow-sm">
                <Container>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '12px' }}>
                        <img 
                            src={configPrefeitura.logo || "/brasao_prefeitura.png"} 
                            alt="Brasão" 
                            style={{ height: '45px', width: 'auto', flexShrink: 0 }} 
                            onError={(e) => { e.target.src = "/brasao_prefeitura.png"; }} 
                        />
                        <div style={{ flexGrow: 1, minWidth: 0 }}>
                            <h6 className="fw-bold mb-0 text-dark" style={{ 
                                fontSize: 'clamp(0.85rem, 4vw, 1.1rem)', 
                                whiteSpace: 'normal',
                                lineHeight: '1.2'
                            }}>
                                {configPrefeitura.nome || "Portal do Cidadão"}
                            </h6>
                            <div className="text-muted" style={{ fontSize: '10px', textTransform: 'uppercase' }}>
                                Termo de Autorização
                            </div>
                        </div>
                    </div>
                </Container>
            </Navbar>

            <Container className="py-4 flex-grow-1 d-flex flex-column justify-content-center">
                <Row className="justify-content-center g-0">
                    <Col xs={12} sm={10} md={8} lg={6}>
                        <Card className="border-0 shadow-lg rounded-4 overflow-hidden mx-1">
                            <div className="bg-primary p-3 p-md-4 text-white text-center">
                                <FaShieldAlt size={40} className="mb-2" />
                                <h5 className="fw-bold mb-0" style={{ fontSize: 'clamp(1rem, 5vw, 1.25rem)' }}>
                                    Consentimento e LGPD
                                </h5>
                            </div>
                            <Card.Body className="p-3 p-md-4">
                                <div className="mb-4 text-muted" style={{ textAlign: 'justify', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                    <p>Para prosseguir com a sua <strong>Atualização Cadastral Imobiliária</strong>, precisamos processar alguns dos seus dados pessoais e documentos.</p>
                                    
                                    <p className="d-flex align-items-start">
                                        <FaLock className="me-2 text-primary mt-1" style={{ flexShrink: 0 }} /> 
                                        <span><strong>Segurança:</strong> Seus dados serão utilizados exclusivamente para a finalidade de atualização tributária municipal (Lei nº 13.709/2018).</span>
                                    </p>
                                    
                                    <p className="mb-2">Ao clicar em aceitar, você autoriza:</p>
                                    <ul className="ps-3 mb-0">
                                        <li>Leitura de documentos via Inteligência Artificial.</li>
                                        <li>Validação de identidade via SMS (OTP).</li>
                                        <li>Armazenamento em base de dados segura.</li>
                                    </ul>
                                </div>

                                <Form.Group className="mb-4 bg-light p-3 rounded-3 border">
                                    <Form.Check 
                                        type="checkbox"
                                        id="check-lgpd"
                                        label="Li e concordo com os termos de uso e processamento de dados pessoais."
                                        className="fw-bold small"
                                        style={{ fontSize: '0.8rem' }}
                                        checked={aceitou}
                                        onChange={(e) => setAceitou(e.target.checked)}
                                    />
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button 
                                        variant="success" 
                                        size="lg" 
                                        className="rounded-pill fw-bold shadow py-3" 
                                        style={{ fontSize: '1rem' }}
                                        disabled={!aceitou}
                                        onClick={handleProsseguir}
                                    >
                                        <FaCheckCircle className="me-2" /> Aceitar e Prosseguir
                                    </Button>
                                    <Button 
                                        variant="link" 
                                        className="text-muted text-decoration-none small"
                                        onClick={() => navigate("/")}
                                    >
                                        Cancelar e Sair
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <footer className="text-center py-3 text-muted mt-auto" style={{ fontSize: '10px' }}>
                Desenvolvido por <strong>PrefeituraPro</strong>. © 2026
            </footer>
        </div>
    );
};

export default Autorizacao;