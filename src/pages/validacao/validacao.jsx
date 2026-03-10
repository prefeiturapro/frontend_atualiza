import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Container, Row, Col, Card, Button, 
    Navbar, Spinner 
} from 'react-bootstrap';
import { FaMapMarkerAlt, FaUserAlt, FaArrowLeft, FaCheck } from 'react-icons/fa';

const Validacao = () => {
    const navigate = useNavigate();
    const [dados, setDados] = useState(null);
    const [configPrefeitura, setConfigPrefeitura] = useState({ NOME: "", logo: "" });

    useEffect(() => {
        const tratarImagem = (campo) => {
            if (campo && typeof campo === 'object' && campo.type === 'Buffer' && Array.isArray(campo.data)) {
                try {
                    const blob = new Blob([new Uint8Array(campo.data)], { type: 'image/jpeg' });
                    return URL.createObjectURL(blob);
                } catch (e) {
                    console.error("Erro ao converter imagem:", e);
                    return null;
                }
            }
            return campo;
        };

        const storedData = localStorage.getItem("dados_imovel");
        if (storedData) {
            const parsed = JSON.parse(storedData);
            setDados({
                ...parsed,
                ds_fotoimovel: tratarImagem(parsed.ds_fotoimovel),
                ds_foto_resp: tratarImagem(parsed.ds_foto_resp)
            });
        } else {
            navigate("/");
        }

        const storedConfig = localStorage.getItem("config_prefeitura");
        if (storedConfig) {
            const config = JSON.parse(storedConfig);
            setConfigPrefeitura({
                NOME: config.nm_cliente,
                logo: tratarImagem(config.by_brasaoprefeitura) 
            });
        }
    }, [navigate]);

    if (!dados) return (
        <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
            <Spinner animation="border" variant="primary" />
        </div>
    );

    return (
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* CABEÇALHO RESPONSIVO PADRONIZADO */}
            <Navbar bg="white" className="border-bottom py-2 shadow-sm">
                <Container>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '12px' }}>
                        {configPrefeitura.logo && (
                            <img 
                                src={configPrefeitura.logo} 
                                alt="Brasão" 
                                style={{ height: '45px', width: 'auto', flexShrink: 0 }} 
                                onError={(e) => { e.target.src = "/brasao_prefeitura.png"; }} 
                            />
                        )}
                        <div style={{ flexGrow: 1, minWidth: 0 }}>
                            <h6 className="fw-bold mb-0 text-dark" style={{ 
                                fontSize: 'clamp(0.85rem, 4vw, 1.1rem)', 
                                whiteSpace: 'normal',
                                lineHeight: '1.2'
                            }}>
                                {configPrefeitura.NOME || "Prefeitura Municipal"}
                            </h6>
                            <div className="text-muted" style={{ fontSize: '10px', textTransform: 'uppercase' }}>
                                Portal do Cidadão
                            </div>
                        </div>
                    </div>
                </Container>
            </Navbar>

            <Container className="py-4 flex-grow-1">
                {/* Stepper Responsivo */}
                <div className="d-flex justify-content-center mb-4">
                    <div className="d-flex align-items-center w-100" style={{ maxWidth: '300px' }}>
                        <div className="text-center" style={{ flex: 1 }}>
                            <div className="rounded-circle bg-success text-white mx-auto d-flex justify-content-center align-items-center" style={{ width: '25px', height: '25px', fontSize: '0.7rem' }}><FaCheck size={10}/></div>
                            <div className="text-muted mt-1" style={{ fontSize: '0.6rem' }}>Identificação</div>
                        </div>
                        <div className="flex-grow-1 border-top border-success mx-1" style={{ marginBottom: '15px' }}></div>
                        <div className="text-center" style={{ flex: 1 }}>
                            <div className="rounded-circle bg-success text-white mx-auto d-flex justify-content-center align-items-center" style={{ width: '25px', height: '25px', fontSize: '0.7rem' }}><FaCheck size={10}/></div>
                            <div className="text-muted mt-1" style={{ fontSize: '0.6rem' }}>Autorização</div>
                        </div>
                        <div className="flex-grow-1 border-top border-primary mx-1" style={{ marginBottom: '15px' }}></div>
                        <div className="text-center" style={{ flex: 1 }}>
                            <div className="rounded-circle bg-primary text-white mx-auto d-flex justify-content-center align-items-center fw-bold" style={{ width: '25px', height: '25px', fontSize: '0.7rem' }}>3</div>
                            <div className="text-primary mt-1 fw-bold" style={{ fontSize: '0.6rem' }}>Validação</div>
                        </div>
                    </div>
                </div>

                <Row className="justify-content-center g-0">
                    <Col lg={10}>
                        <Card className="border-0 shadow-lg rounded-4 overflow-hidden mx-1">
                            <div className="bg-primary p-3 text-white text-center">
                                <h6 className="mb-0 fw-bold text-uppercase">
                                    <FaMapMarkerAlt className="me-2 mb-1" /> Confirme seu Imóvel
                                </h6>
                            </div>

                            <Card.Body className="p-3 p-md-4">
                                <Row className="g-4">
                                    {/* Imagem do Imóvel: No celular ocupa 100%, no PC lateral */}
                                    <Col xs={12} md={5} className="text-center">
                                        <div className="shadow-sm rounded-4 overflow-hidden border border-light bg-light">
                                            <img 
                                                src={dados.ds_fotoimovel || "/img/casa-placeholder.png"} 
                                                alt="Foto do Imóvel" 
                                                style={{ width: '100%', height: 'auto', maxHeight: '250px', objectFit: 'cover' }} 
                                            />
                                        </div>
                                    </Col>

                                    {/* Informações do Imóvel */}
                                    <Col xs={12} md={7}>
                                        <div className="ps-md-2">
                                            <div className="mb-3 text-center text-md-start">
                                                <label className="text-primary small fw-bold text-uppercase d-block mb-1">
                                                    <FaUserAlt className="me-1 mb-1" /> Proprietário Registrado
                                                </label>
                                                <h4 className="fw-bold text-dark mb-0 text-uppercase" style={{ fontSize: 'clamp(1.1rem, 5vw, 1.5rem)' }}>
                                                    {dados.nm_responsavel}
                                                </h4>
                                            </div>

                                            <Row className="g-2 mb-3">
                                                <Col xs={6}>
                                                    <div className="p-2 bg-light rounded-3 border-start border-primary border-4 shadow-sm text-center">
                                                        <label className="text-muted fw-bold d-block" style={{ fontSize: '9px' }}>REDUZIDO</label>
                                                        <span className="fw-bold text-primary" style={{ fontSize: '0.9rem' }}>{dados.cd_reduzido || "---"}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={6}>
                                                    <div className="p-2 bg-light rounded-3 border-start border-info border-4 shadow-sm text-center">
                                                        <label className="text-muted fw-bold d-block" style={{ fontSize: '9px' }}>INSCRIÇÃO</label>
                                                        <span className="fw-bold text-dark" style={{ fontSize: '0.8rem' }}>{dados.ds_inscricao || "---"}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12}>
                                                    <div className="p-3 bg-light rounded-3 shadow-sm border">
                                                        <label className="text-muted small fw-bold text-uppercase d-block mb-1">Endereço do Imóvel</label>
                                                        <p className="mb-0 fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
                                                            {dados.nm_logradouro_imovel}, {dados.ds_numero_imovel}<br/>
                                                            <span className="text-muted fw-normal">Bairro {dados.nm_bairro_imovel}</span>
                                                        </p>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>

                            <Card.Footer className="bg-white border-top-0 p-4 text-center">
                                <div className="d-grid gap-2">
                                    <Button 
                                        variant="primary" 
                                        size="lg" 
                                        className="rounded-pill shadow fw-bold text-uppercase py-3" 
                                        style={{ fontSize: '0.9rem' }}
                                        onClick={() => navigate("/atualizacao")}
                                    >
                                        Sim, confirmar e prosseguir
                                    </Button>
                                    <Button 
                                        variant="outline-secondary" 
                                        className="rounded-pill fw-bold border-2" 
                                        onClick={() => navigate("/")}
                                    >
                                        <FaArrowLeft className="me-2" /> Não é meu imóvel
                                    </Button>
                                </div>
                            </Card.Footer>
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

export default Validacao;