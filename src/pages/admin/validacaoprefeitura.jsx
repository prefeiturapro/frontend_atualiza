import React, { useState, useEffect } from "react";
import { 
    Container, Table, Card, Button, Row, Col, Badge, 
    Form, Modal, Spinner, Alert, Navbar 
} from 'react-bootstrap';
import { 
    FaCheck, FaTimes, FaFilter, FaEye, FaHistory, FaCheckDouble, FaUniversity, FaEnvelope, FaMobileAlt, FaMapMarkedAlt 
} from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

const ValidacaoPrefeitura = () => {
    const [pedidos, setPedidos] = useState([]);
    const [filtro, setFiltro] = useState("TODOS"); 
    const [carregando, setCarregando] = useState(true);
    const [itemSelecionado, setItemSelecionado] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [processando, setProcessando] = useState(false);
    
    const [configPrefeitura, setConfigPrefeitura] = useState({ NOME: "", logo: "" });

    useEffect(() => {
        const storedConfig = localStorage.getItem("config_prefeitura");
        if (storedConfig) {
            const config = JSON.parse(storedConfig);
            setConfigPrefeitura({ NOME: config.nm_cliente, logo: config.by_brasaoprefeitura });
        }
        carregarPedidos();
    }, [filtro]);

    const carregarPedidos = async () => {
        setCarregando(true);
        try {
            const res = await fetch(`${API_URL}/dadoscontribuintes/pendentes?status=${filtro}`);
            if (!res.ok) throw new Error("Erro ao buscar dados");
            const data = await res.json();
            setPedidos(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Erro ao carregar pedidos:", e);
        } finally {
            setCarregando(false);
        }
    };

    const handleAcao = async (id, acao) => {
        setProcessando(true);
        try {
            const res = await fetch(`${API_URL}/dadoscontribuintes/validar-pedido`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, acao })
            });

            if (res.ok) {
                alert(acao === 'EXECUTAR' ? "Atualização realizada!" : "Pedido cancelado e notificações enviadas.");
                setShowModal(false);
                carregarPedidos();
            }
        } catch (e) {
            alert("Erro ao processar ação.");
        } finally {
            setProcessando(false);
        }
    };

    const handleAtualizarLote = async () => {
        const total = pedidos.length;
        if (total === 0) return;
        if (!window.confirm(`Deseja aprovar ${total} pedidos em lote?`)) return;

        setProcessando(true);
        try {
            for (const pedido of pedidos) {
                await fetch(`${API_URL}/dadoscontribuintes/validar-pedido`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: pedido.id_dados_contribuintes, acao: 'EXECUTAR' })
                });
            }
            alert("Processamento em lote concluído!");
            carregarPedidos();
        } catch (e) {
            alert("Erro no lote.");
        } finally {
            setProcessando(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <Navbar bg="white" className="border-bottom py-2 shadow-sm mb-4">
                <Container>
                    <Navbar.Brand className="d-flex align-items-center">
                        <img 
                            src={configPrefeitura.logo} 
                            alt="Brasão" 
                            height="40" 
                            className="me-3" 
                            onError={(e) => { e.target.src = "/brasao_prefeitura.png"; }} 
                        />
                        <h5 className="fw-bold mb-0 text-dark text-uppercase">{configPrefeitura.NOME} - ADMIN</h5>
                    </Navbar.Brand>
                </Container>
            </Navbar>

            <Container>
                <Card className="border-0 shadow-sm mb-4 rounded-4">
                    <Card.Body>
                        <Row className="align-items-center">
                            <Col md={5}>
                                <div className="d-flex align-items-center text-primary">
                                    <FaUniversity className="me-2" size={20}/>
                                    <h5 className="fw-bold mb-0 text-uppercase">Validação de Cadastros</h5>
                                </div>
                                <p className="text-muted small mb-0">Pedidos aguardando revisão técnica.</p>
                            </Col>
                            <Col md={4}>
                                <Form.Select size="sm" className="rounded-pill border-primary fw-bold" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
                                    <option value="TODOS">TODOS OS PEDIDOS</option>
                                    <option value="N">IA - SEM ALTERAÇÃO</option>
                                    <option value="S">ALTERADOS MANUALMENTE</option>
                                </Form.Select>
                            </Col>
                            <Col md={3} className="text-end">
                                <Button 
                                    variant="success" 
                                    size="sm" 
                                    className="rounded-pill px-3 shadow-sm fw-bold text-uppercase" 
                                    onClick={handleAtualizarLote} 
                                    disabled={processando || pedidos.length === 0}
                                >
                                    <FaCheckDouble className="me-1"/> Aprovar Lista
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                    <Table hover responsive className="mb-0 text-uppercase" style={{ fontSize: '0.8rem' }}>
                        <thead className="bg-light border-bottom text-muted">
                            <tr>
                                <th className="py-3">Reduzido / Inscrição</th>
                                <th className="py-3">Contribuinte</th>
                                <th className="py-3">Protocolo</th>
                                <th className="py-3">Data / Hora Atualização</th>
                                <th className="py-3 text-center">Tipo</th>
                                <th className="py-3 text-center">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carregando ? (
                                <tr><td colSpan="6" className="text-center py-5"><Spinner animation="border" variant="primary" /></td></tr>
                            ) : pedidos.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-5 text-muted">Nenhum pedido pendente.</td></tr>
                            ) : pedidos.map(p => (
                                <tr key={p.id_dados_contribuintes}>
                                    <td className="align-middle">
                                        <div className="fw-bold text-primary">{p.cd_reduzido_imovel}</div>
                                        <div className="text-muted small" style={{fontSize: '10px'}}>{p.ds_inscricao_imovel}</div>
                                    </td>
                                    <td className="align-middle">
                                        <div className="fw-bold">{p.nm_contribuinte}</div>
                                        <div className="text-muted small">CÓD: {p.cd_contribuinte}</div>
                                    </td>
                                    <td className="align-middle"><Badge bg="light" text="dark" className="border">{p.ds_protocolo}</Badge></td>
                                    <td className="align-middle">
                                        <div className="fw-bold text-dark">
                                            {p.dt_atualizacao ? new Date(p.dt_atualizacao).toLocaleDateString('pt-BR') : '---'}
                                        </div>
                                        <div className="text-muted" style={{fontSize: '11px'}}>
                                            <FaHistory size={10} className="me-1"/>
                                            {p.hr_atualizacao ? p.hr_atualizacao.substring(0, 5) : '--:--'}
                                        </div>
                                    </td>
                                    <td className="text-center align-middle">
                                        {p.st_editado_manual === 'S' 
                                            ? <Badge bg="warning" text="dark">ALTERADO</Badge> 
                                            : <Badge bg="success">ORIGINAL</Badge>
                                        }
                                    </td>
                                    <td className="text-center align-middle">
                                        <Button variant="outline-primary" size="sm" className="rounded-pill" onClick={() => { setItemSelecionado(p); setShowModal(true); }}>
                                            <FaEye className="me-1"/> Analisar
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>
            </Container>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="h6 fw-bold text-uppercase">Análise Técnica - Protocolo {itemSelecionado?.ds_protocolo}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {itemSelecionado && (
                        <>
                            <Row className="mb-4 text-uppercase border-bottom pb-3">
                                <Col md={4} className="small text-muted"><strong>CONTRIBUINTE:</strong><br/><span className="text-dark fw-bold">{itemSelecionado.nm_contribuinte}</span></Col>
                                <Col md={4} className="small text-muted"><strong>IMÓVEL (RED / INSCRIÇÃO):</strong><br/><span className="text-dark fw-bold">{itemSelecionado.cd_reduzido_imovel} / {itemSelecionado.ds_inscricao_imovel}</span></Col>
                                <Col md={4} className="small text-muted text-end">
                                    <strong>SOLICITADO EM:</strong><br/>
                                    <span className="text-primary fw-bold">
                                        {new Date(itemSelecionado.dt_atualizacao).toLocaleDateString('pt-BR')} ÀS {itemSelecionado.hr_atualizacao ? itemSelecionado.hr_atualizacao.substring(0, 5) : ''}
                                    </span>
                                </Col>
                            </Row>
                            <Row className="g-4 text-uppercase">
                                <Col md={6}>
                                    <div className="p-3 bg-light rounded-4 border h-100">
                                        <h6 className="fw-bold text-muted small border-bottom pb-2">EXTRAÍDO PELA IA (ARQUIVO)</h6>
                                        <div className="mb-1" style={{fontSize: '11px'}}><strong>RUA:</strong> {itemSelecionado.nm_rua_extr}</div>
                                        <div className="mb-1" style={{fontSize: '11px'}}><strong>Nº:</strong> {itemSelecionado.ds_numero_extr}</div>
                                        <div className="mb-1" style={{fontSize: '11px'}}><strong>BAIRRO:</strong> {itemSelecionado.ds_bairro_extr}</div>
                                        <div className="mb-1" style={{fontSize: '11px'}}><strong>CEP:</strong> {itemSelecionado.nr_cep_extr}</div>
                                        <div className="mb-1" style={{fontSize: '11px'}}><strong>CIDADE:</strong> {itemSelecionado.ds_cidade_extr}</div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="p-3 bg-white rounded-4 border border-primary h-100 shadow-sm" style={{ borderLeft: '6px solid #0d6efd' }}>
                                        <h6 className="fw-bold text-primary small border-bottom pb-2">SALVO PELO CONTRIBUINTE</h6>
                                        <div className="mb-1 fw-bold text-primary" style={{fontSize: '11px'}}><strong>RUA:</strong> {itemSelecionado.nm_rua_atual}</div>
                                        <div className="mb-1" style={{fontSize: '11px'}}><strong>Nº:</strong> {itemSelecionado.ds_numero_atual}</div>
                                        <div className="mb-1" style={{fontSize: '11px'}}><strong>BAIRRO:</strong> {itemSelecionado.ds_bairro_atual}</div>
                                        <div className="mb-1" style={{fontSize: '11px'}}><strong>CEP:</strong> {itemSelecionado.nr_cep_atual}</div>
                                        <div className="mb-1" style={{fontSize: '11px'}}><strong>CIDADE:</strong> {itemSelecionado.ds_cidade_atual}</div>
                                        <div className="mt-2 pt-2 border-top">
                                            <div className="small text-lowercase"><FaEnvelope className="me-1"/>{itemSelecionado.ds_email_atual}</div>
                                            <div className="small"><FaMobileAlt className="me-1"/>{itemSelecionado.nr_telefone_atual}</div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className="bg-light border-top-0">
                    <Button variant="outline-danger" className="me-auto rounded-pill px-4" onClick={() => handleAcao(itemSelecionado.id_dados_contribuintes, 'CANCELAR')} disabled={processando}>
                        <FaTimes className="me-1"/> Indeferir
                    </Button>
                    <Button variant="success" className="rounded-pill px-4 shadow-sm" onClick={() => handleAcao(itemSelecionado.id_dados_contribuintes, 'EXECUTAR')} disabled={processando}>
                        <FaCheck className="me-1"/> Aprovar e Efetivar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ValidacaoPrefeitura;