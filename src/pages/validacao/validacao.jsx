import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Container, Row, Col, Card, Button, 
    Navbar, Spinner 
} from 'react-bootstrap';
import { FaMapMarkerAlt, FaIdCard, FaUserAlt, FaArrowLeft } from 'react-icons/fa';

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
            console.log("Dados recuperados do LocalStorage:", parsed); // Para debug das chaves cd_reduzido e ds_inscricao
            
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
            
            <Navbar bg="white" className="border-bottom py-3 shadow-sm">
                <Container>
                    <Navbar.Brand className="d-flex align-items-center">
                        {configPrefeitura.logo && (
                            <img src={configPrefeitura.logo} alt="Brasão" height="50" className="me-3" onError={(e) => { e.target.src = "/brasao_prefeitura.png"; }} />
                        )}
                        <h4 className="fw-bold mb-0 text-dark">{configPrefeitura.NOME || "Prefeitura Municipal"}</h4>
                    </Navbar.Brand>
                </Container>
            </Navbar>

            <Container className="py-5 flex-grow-1">
                <Row className="justify-content-center">
                    <Col lg={9}>
                        <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
                            <div className="bg-primary p-3 text-white text-center">
                                <h5 className="mb-0 fw-bold text-uppercase italic">
                                    <FaMapMarkerAlt className="me-2 mb-1" /> Confirme se este é o seu Imóvel
                                </h5>
                            </div>

                            <Card.Body className="p-4 p-md-5">
                                <Row className="align-items-center">
                                    {/* Lado Esquerdo: Imagem do Imóvel */}
                                    <Col md={5} className="text-center mb-4 mb-md-0">
                                        <div className="position-relative d-inline-block shadow-sm rounded-4 overflow-hidden border border-light">
                                            <img 
                                                src={dados.ds_fotoimovel || "/img/casa-placeholder.png"} 
                                                alt="Foto do Imóvel" 
                                                style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }} 
                                            />
                                        </div>
                                    </Col>

                                    {/* Lado Direito: Informações Principais em Destaque */}
                                    <Col md={7}>
                                        <div className="ps-md-4">
                                            <div className="mb-4">
                                                <label className="text-primary small fw-bolder text-uppercase ls-1 d-block mb-1">
                                                    <FaUserAlt className="me-1 mb-1" /> Proprietário Registrado
                                                </label>
                                                <h3 className="fw-black text-dark mb-0 text-uppercase" style={{ fontSize: '1.8rem' }}>
                                                    {dados.nm_responsavel}
                                                </h3>
                                            </div>

                                            <Row className="g-4">
                                                <Col xs={12} sm={6}>
                                                    <div className="p-3 bg-light rounded-3 border-start border-primary border-4 shadow-sm">
                                                        <label className="text-muted small fw-bold text-uppercase d-block">Código Reduzido</label>
                                                        <span className="fs-4 fw-bold text-primary">{dados.cd_reduzido || "---"}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} sm={6}>
                                                    <div className="p-3 bg-light rounded-3 border-start border-info border-4 shadow-sm">
                                                        <label className="text-muted small fw-bold text-uppercase d-block">Inscrição Imobiliária</label>
                                                        <span className="fs-5 fw-bold text-dark">{dados.ds_inscricao || "---"}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12}>
                                                    <div className="p-3 bg-light rounded-3 shadow-sm">
                                                        <label className="text-muted small fw-bold text-uppercase d-block">Localização do Imóvel</label>
                                                        <p className="mb-0 fw-semibold text-dark fs-5">
                                                            {dados.nm_logradouro_imovel}, {dados.ds_numero_imovel}<br/>
                                                            <span className="text-muted small">Bairro {dados.nm_bairro_imovel} - CEP: {dados.nr_cep_imovel}</span>
                                                        </p>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>

                            <Card.Footer className="bg-white border-top-0 p-4 text-center">
                                <p className="text-muted mb-4 fs-6 px-md-5">
                                    Os dados acima conferem com o seu imóvel? Clique no botão abaixo para anexar seu comprovante de residência e atualizar seu cadastro.
                                </p>
                                <div className="d-grid gap-2 d-md-block">
                                    <Button 
                                        variant="primary" 
                                        size="lg" 
                                        className="px-5 py-3 rounded-pill shadow fw-black text-uppercase ls-1 me-md-3" 
                                        onClick={() => navigate("/atualizacao")}
                                    >
                                        Sim, confirmar e prosseguir
                                    </Button>
                                    <Button 
                                        variant="outline-secondary" 
                                        className="px-4 py-3 rounded-pill fw-bold border-2" 
                                        onClick={() => navigate("/")}
                                    >
                                        <FaArrowLeft className="me-2 mb-1" /> Não é meu imóvel
                                    </Button>
                                </div>
                            </Card.Footer>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <footer className="text-center py-4 text-muted bg-white border-top">
                <small>Desenvolvido por <strong>PrefeituraPro Soluções Municipais</strong>. © 2026</small>
            </footer>
        </div>
    );
};

export default Validacao;