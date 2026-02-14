import React, { useState, useEffect } from "react";
import { 
    Container, Card, Form, Button, Row, Col, Spinner, 
    Alert, Tabs, Tab, Navbar 
} from 'react-bootstrap';
import { FaSave, FaCogs, FaServer, FaShieldAlt, FaGlobeAmericas, FaUniversity } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

const DadosGerais = () => {
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [status, setStatus] = useState(null);
    const [form, setForm] = useState({});
    const [configPrefeitura, setConfigPrefeitura] = useState({ NOME: "", logo: "" });

    useEffect(() => {
        const storedConfig = localStorage.getItem("config_prefeitura");
        if (storedConfig) {
            const config = JSON.parse(storedConfig);
            setConfigPrefeitura({ NOME: config.nm_cliente, logo: config.by_brasaoprefeitura });
        }
        buscarConfig();
    }, []);

    const buscarConfig = async () => {
        try {
            const res = await fetch(`${API_URL}/dadosgerais/config`);
            const data = await res.json();
            
            if (data.sucesso) {
                // Se o seu backend retorna os dados dentro de um objeto 'config', usamos data.config
                // Caso contrário, usamos o objeto data direto
                const configData = data.config || data;
                setForm(configData); 
            }
        } catch (e) {
            setStatus({ type: 'danger', msg: 'Erro ao carregar configurações.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const valFinal = type === 'checkbox' || type === 'switch' ? (checked ? 'S' : 'N') : value;
        setForm(prev => ({ ...prev, [name]: valFinal }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSalvando(true);
        setStatus(null);
        try {
            const res = await fetch(`${API_URL}/dadosgerais/config/${form.id_dados_gerais}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const result = await res.json();
            if (res.ok) {
                setStatus({ type: 'success', msg: 'Configurações atualizadas com sucesso!' });
                buscarConfig(); 
            } else {
                throw new Error(result.erro || 'Erro ao salvar');
            }
        } catch (e) {
            setStatus({ type: 'danger', msg: 'Falha ao gravar alterações: ' + e.message });
        } finally {
            setSalvando(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
            <Spinner animation="border" variant="primary" />
        </div>
    );

    return (
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <Navbar bg="white" className="border-bottom py-2 shadow-sm mb-4">
                <Container>
                    <Navbar.Brand className="d-flex align-items-center">
                        <img src={configPrefeitura.logo} alt="Brasão" height="40" className="me-3" onError={(e) => { e.target.src = "/brasao_prefeitura.png"; }} />
                        <h5 className="fw-bold mb-0 text-dark text-uppercase">{configPrefeitura.NOME} - ADMIN</h5>
                    </Navbar.Brand>
                </Container>
            </Navbar>

            <Container>
                <Card className="border-0 shadow-sm mb-4 rounded-4">
                    <Card.Body>
                        <Row className="align-items-center">
                            <Col md={12}>
                                <div className="d-flex align-items-center text-primary">
                                    <FaUniversity className="me-2" size={20}/>
                                    <h5 className="fw-bold mb-0 text-uppercase">Configurações Gerais do Sistema</h5>
                                </div>
                                <p className="text-muted small mb-0">Gerenciamento de parâmetros mestre e regras de negócio.</p>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
                    <Card.Body className="p-4">
                        {status && <Alert variant={status.type} dismissible onClose={() => setStatus(null)}>{status.msg}</Alert>}
                        
                        <Form onSubmit={handleSubmit}>
                            <Tabs defaultActiveKey="geral" className="mb-4 text-uppercase small fw-bold">
                                <Tab eventKey="geral" title={<span><FaGlobeAmericas className="me-1"/> Geral</span>}>
                                    <Row className="g-3">
                                        <Col md={4}>
                                            <Form.Label className="fw-bold small text-muted">EXERCÍCIO ATUAL</Form.Label>
                                            <Form.Control type="number" name="nr_exercicio" value={form.nr_exercicio || ''} onChange={handleChange} />
                                        </Col>
                                        
                                        {/* REMOVIDO O CAMPO DE ID MUNICÍPIO CONFORME SOLICITADO */}
                                        
                                        <Col md={8}>
                                            <Form.Label className="fw-bold small text-muted">NOME DO MUNICÍPIO SEDE (BASE)</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                // Mapeia o campo nm_municipio_sede que vem do JOIN do backend
                                                value={form.nm_municipio_sede || 'NOME NÃO CARREGADO'} 
                                                disabled 
                                                className="bg-light fw-bold text-primary border-primary" 
                                            />
                                            <Form.Text className="text-muted" style={{fontSize: '10px'}}>
                                                * Este nome é recuperado automaticamente com base no ID configurado no banco.
                                            </Form.Text>
                                        </Col>

                                        <Col md={12} className="mt-4">
                                            <div className="p-3 bg-light rounded border">
                                                <Form.Check type="switch" label="BLOQUEAR ALTERAÇÃO POR TERCEIROS (RESPONSÁVEL)" name="st_bloqueioresp" checked={form.st_bloqueioresp === 'S'} onChange={handleChange} />
                                                <Form.Check type="switch" label="VALIDAR CPF NA RECEITA FEDERAL" name="st_checkcpf" checked={form.st_checkcpf === 'S'} onChange={handleChange} className="mt-2" />
                                                <Form.Check type="switch" label="VALIDAR CNPJ NA RECEITA FEDERAL" name="st_checkcnpj" checked={form.st_checkcnpj === 'S'} onChange={handleChange} className="mt-2" />
                                                <Form.Check type="switch" label="APROVAÇÃO AUTOMÁTICA DE ATUALIZAÇÕES" name="st_aprovacaoaut" checked={form.st_aprovacaoaut === 'S'} onChange={handleChange} className="mt-2 text-primary fw-bold" />
                                            </div>
                                        </Col>
                                    </Row>
                                </Tab>

                                <Tab eventKey="acesso" title={<span><FaShieldAlt className="me-1"/> Métodos de Login</span>}>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <div className="border p-3 rounded h-100 bg-white shadow-sm">
                                                <h6 className="fw-bold border-bottom pb-2 mb-3 small">AUTENTICAÇÃO LOCAL</h6>
                                                <Form.Check label="LOGIN POR CPF" name="st_logincpf" checked={form.st_logincpf === 'S'} onChange={handleChange} />
                                                <Form.Check label="LOGIN POR INSCRIÇÃO" name="st_logininscricao" checked={form.st_logininscricao === 'S'} onChange={handleChange} className="mt-2" />
                                                <Form.Check label="LOGIN POR REDUZIDO" name="st_loginreduzido" checked={form.st_loginreduzido === 'S'} onChange={handleChange} className="mt-2" />
                                                <Form.Check label="LOGIN POR CÓDIGO CONTRIBUINTE" name="st_login_cod_cont" checked={form.st_login_cod_cont === 'S'} onChange={handleChange} className="mt-2" />
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="border p-3 rounded h-100 bg-white shadow-sm">
                                                <h6 className="fw-bold border-bottom pb-2 mb-3 small">INTEGRAÇÕES EXTERNAS</h6>
                                                <Form.Check label="LOGIN VIA GOV.BR" name="st_logingovbr" checked={form.st_logingovbr === 'S'} onChange={handleChange} />
                                                <Form.Check label="LOGIN POR CERTIFICADO DIGITAL" name="st_logincertificado" checked={form.st_logincertificado === 'S'} onChange={handleChange} className="mt-2" />
                                                <Form.Check label="BUSCA DE DADOS POR NOME" name="st_loginpornome" checked={form.st_loginpornome === 'S'} onChange={handleChange} className="mt-2" />
                                            </div>
                                        </Col>
                                    </Row>
                                </Tab>

                                <Tab eventKey="ftp" title={<span><FaServer className="me-1"/> Conexão FTP</span>}>
                                    <Row className="g-3">
                                        <Col md={12}>
                                            <Form.Label className="fw-bold small text-muted">HOST DO SERVIDOR FTP</Form.Label>
                                            <Form.Control name="ds_ftp" value={form.ds_ftp || ''} onChange={handleChange} placeholder="ftp.exemplo.com.br" />
                                        </Col>
                                        <Col md={6}>
                                            <Form.Label className="fw-bold small text-muted">USUÁRIO FTP</Form.Label>
                                            <Form.Control name="nm_userftp" value={form.nm_userftp || ''} onChange={handleChange} />
                                        </Col>
                                        <Col md={6}>
                                            <Form.Label className="fw-bold small text-muted">SENHA FTP</Form.Label>
                                            <Form.Control type="password" name="ds_senhaftp" value={form.ds_senhaftp || ''} onChange={handleChange} />
                                        </Col>
                                    </Row>
                                </Tab>
                            </Tabs>

                            <div className="border-top pt-4 text-end">
                                <Button variant="success" type="submit" size="lg" className="px-5 rounded-pill shadow-sm fw-bold text-uppercase" disabled={salvando}>
                                    {salvando ? <><Spinner size="sm" className="me-2"/> Gravando...</> : <><FaSave className="me-2"/> Gravar Alterações</>}
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default DadosGerais;