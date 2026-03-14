import React, { useState, useEffect } from "react";
import { 
    Container, Table, Card, Button, Row, Col, Badge, 
    Form, Modal, Spinner, Navbar, Alert 
} from 'react-bootstrap';
import { 
    FaCheck, FaTimes, FaUniversity, FaSyncAlt, FaInfoCircle, FaEnvelope, FaMobileAlt, FaEye, 
    FaHistory, FaCheckDouble, FaIdCard, FaUserAlt, FaExclamationTriangle, FaCheckCircle, 
    FaBuilding, FaMapMarkedAlt, FaUserEdit, FaDownload
} from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

const ValidacaoPrefeitura = () => {
    const [pedidos, setPedidos] = useState([]);
    const [filtroEdicao, setFiltroEdicao] = useState("TODOS"); 
    const [filtroPropriedade, setFiltroPropriedade] = useState("TODOS");
    const [carregando, setCarregando] = useState(true);
    const [itemSelecionado, setItemSelecionado] = useState(null);
    const [dadosOriginais, setDadosOriginais] = useState(null); 
    const [carregandoOriginal, setCarregandoOriginal] = useState(false);
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
    }, [filtroEdicao, filtroPropriedade]);

    const carregarPedidos = async () => {
        setCarregando(true);
        try {
            const res = await fetch(`${API_URL}/dadoscontribuintes/pendentes?status=${filtroEdicao}`);
            if (!res.ok) throw new Error("Erro ao buscar dados");
            const data = await res.json();
            
            let listaFiltrada = Array.isArray(data) ? data : [];

            if (filtroPropriedade === "MUDANCA") {
                listaFiltrada = listaFiltrada.filter(p => p.st_responsavel === "S");
            } else if (filtroPropriedade === "MESMO") {
                listaFiltrada = listaFiltrada.filter(p => p.st_responsavel === "N");
            }

            setPedidos(listaFiltrada);
        } catch (e) {
            console.error("Erro ao carregar pedidos:", e);
        } finally {
            setCarregando(false);
        }
    };

    const carregarBaseOriginal = async (cdReduzido) => {
        setCarregandoOriginal(true);
        try {
            const res = await fetch(`${API_URL}/dadosimoveis/buscar-reduzido`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reduzido: cdReduzido }) 
            });
            
            if (res.ok) {
                const data = await res.json();
                setDadosOriginais(data);
            } else {
                setDadosOriginais(null);
            }
        } catch (e) {
            console.error("Erro ao buscar base original:", e);
            setDadosOriginais(null);
        } finally {
            setCarregandoOriginal(false);
        }
    };

    const handleAbrirAnalise = (pedido) => {
        setItemSelecionado(pedido);
        setDadosOriginais(null);
        setShowModal(true);
        carregarBaseOriginal(pedido.cd_reduzido_imovel);
    };

    // --- FUNÇÃO PARA DOWNLOAD DO COMPROVANTE (ds_comprovante) ---
    const handleDownloadIA = (item) => {
        const arquivo = item.ds_comprovante; 

        if (!arquivo) {
            alert("Comprovante não localizado no banco de dados.");
            return;
        }

        try {
            let urlDownload;

            // Se for Buffer do Postgres
            if (typeof arquivo === 'object' && arquivo.type === 'Buffer' && Array.isArray(arquivo.data)) {
                const blob = new Blob([new Uint8Array(arquivo.data)], { type: 'image/jpeg' });
                urlDownload = URL.createObjectURL(blob);
            } else {
                // Se for String (Base64 ou URL)
                urlDownload = arquivo;
            }

            const link = document.createElement("a");
            link.href = urlDownload;
            link.download = `COMPROVANTE_PROTOCOLO_${item.ds_protocolo}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Erro no download:", err);
            alert("Erro ao processar arquivo para download.");
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
                alert(acao === 'EXECUTAR' ? "Atualização realizada!" : "Pedido cancelado.");
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
        if (pedidos.length === 0 || !window.confirm(`Aprovar ${pedidos.length} pedidos em lote?`)) return;
        setProcessando(true);
        try {
            for (const pedido of pedidos) {
                await fetch(`${API_URL}/dadoscontribuintes/validar-pedido`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: pedido.id_dados_contribuintes, acao: 'EXECUTAR' })
                });
            }
            alert("Processamento concluído!");
            carregarPedidos();
        } catch (e) { alert("Erro no lote."); }
        finally { setProcessando(false); }
    };

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
                        <Row className="align-items-center g-3">
                            <Col lg={3}>
                                <div className="d-flex align-items-center text-primary">
                                    <FaUniversity className="me-2" size={20}/>
                                    <h5 className="fw-bold mb-0 text-uppercase">Validação</h5>
                                </div>
                            </Col>
                            <Col lg={3}>
                                <Form.Select size="sm" className="rounded-pill border-primary fw-bold" value={filtroEdicao} onChange={(e) => setFiltroEdicao(e.target.value)}>
                                    <option value="TODOS">DADOS: TODOS</option>
                                    <option value="N">IA - SEM ALTERAÇÃO</option>
                                    <option value="S">ALTERADOS MANUALMENTE</option>
                                </Form.Select>
                            </Col>
                            <Col lg={3}>
                                <Form.Select size="sm" className="rounded-pill border-danger fw-bold" value={filtroPropriedade} onChange={(e) => setFiltroPropriedade(e.target.value)}>
                                    <option value="TODOS">PROPRIEDADE: TODOS</option>
                                    <option value="MUDANCA">⚠️ TROCA DE RESPONSÁVEL</option>
                                    <option value="MESMO">✓ MANUTENÇÃO</option>
                                </Form.Select>
                            </Col>
                            <Col lg={3} className="text-end">
                                <Button variant="success" size="sm" className="rounded-pill px-3 shadow-sm fw-bold text-uppercase w-100" onClick={handleAtualizarLote} disabled={processando || pedidos.length === 0}>
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
                                <th className="py-3 text-center">Reduzido / Inscrição</th>
                                <th className="py-3">Contribuinte</th>
                                <th className="py-3 text-center">RESPONSÁVEL TRIBUTÁRIO</th>
                                <th className="py-3">Data / Protocolo</th>
                                <th className="py-3 text-center">Tipo</th>
                                <th className="py-3 text-center">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carregando ? (
                                <tr><td colSpan="6" className="text-center py-5"><Spinner animation="border" variant="primary" /></td></tr>
                            ) : pedidos.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-5 text-muted">Nenhum pedido pendente para este filtro.</td></tr>
                            ) : pedidos.map(p => (
                                <tr key={p.id_dados_contribuintes}>
                                    <td className="align-middle text-center">
                                        <div className="fw-bold text-primary">{p.cd_reduzido_imovel}</div>
                                        <div className="text-muted small" style={{fontSize: '10px'}}>{p.ds_inscricao_imovel}</div>
                                    </td>
                                    <td className="align-middle">
                                        <div className="fw-bold">{p.nm_contribuinte}</div>
                                        <div className="text-muted small">CÓD: {p.cd_contribuinte}</div>
                                    </td>
                                    <td className="text-center align-middle">
                                        {p.st_responsavel === 'S' ? (
                                            <Badge bg="danger" className="p-2"><FaUserEdit className="me-1"/> MUDANÇA</Badge>
                                        ) : (
                                            <Badge bg="light" text="dark" className="border text-muted">MANUTENÇÃO</Badge>
                                        )}
                                    </td>
                                    <td className="align-middle">
                                        <div className="fw-bold">{p.dt_atualizacao ? new Date(p.dt_atualizacao).toLocaleDateString('pt-BR') : '---'}</div>
                                        <div className="text-muted small">{p.ds_protocolo}</div>
                                    </td>
                                    <td className="text-center align-middle">
                                        <Badge bg={p.st_editado_manual === 'S' ? "warning" : "success"} text={p.st_editado_manual === 'S' ? "dark" : "white"}>
                                            {p.st_editado_manual === 'S' ? "ALTERADO" : "ORIGINAL"}
                                        </Badge>
                                    </td>
                                    <td className="text-center align-middle">
                                        <Button variant="outline-primary" size="sm" className="rounded-pill" onClick={() => handleAbrirAnalise(p)}>
                                            <FaEye className="me-1"/> Analisar
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>
            </Container>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered scrollable>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="h6 fw-bold text-uppercase">Análise Técnica - Protocolo {itemSelecionado?.ds_protocolo}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-light">
                    {itemSelecionado && (
                        <>
                            <Card className="border-0 shadow-sm mb-3 rounded-3">
                                <Card.Body className="py-2 bg-white">
                                    <Row className="text-uppercase small">
                                        <Col md={4}><strong>Solicitante:</strong><br/>{itemSelecionado.nm_contribuinte}</Col>
                                        <Col md={4}><strong>Imóvel:</strong><br/>{itemSelecionado.cd_reduzido_imovel} / {itemSelecionado.ds_inscricao_imovel}</Col>
                                        <Col md={4} className="text-end"><strong>Solicitado em:</strong><br/><span className="text-primary">{itemSelecionado.dt_atualizacao ? new Date(itemSelecionado.dt_atualizacao).toLocaleDateString('pt-BR') : '---'} às {itemSelecionado.hr_atualizacao?.substring(0, 5)}</span></Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            <Row className="g-3 text-uppercase">
                                <Col md={4}>
                                    <div className="p-3 bg-white rounded-4 border shadow-sm h-100" style={{ borderTop: '6px solid #6c757d' }}>
                                        <h6 className="fw-bold text-secondary small border-bottom pb-2 d-flex align-items-center">
                                            <FaUniversity className="me-2"/> CADASTRO ATUAL (SISTEMA)
                                        </h6>
                                        {carregandoOriginal ? (
                                            <div className="text-center py-4"><Spinner animation="border" size="sm" variant="secondary" /></div>
                                        ) : dadosOriginais ? (
                                            <div style={{fontSize: '11px'}}>
                                                <div className="mb-2 p-2 bg-light rounded">
                                                    <div className="text-muted fw-bold small"><FaUserAlt className="me-1"/> RESPONSÁVEL NO BANCO:</div>
                                                    <div className="text-dark fw-bold">{dadosOriginais.nm_responsavel}</div>
                                                    <div className="text-muted mt-1 fw-bold small"><FaIdCard className="me-1"/> CPF NO BANCO:</div>
                                                    <div className="text-dark">{dadosOriginais.nr_cpf_resp}</div>
                                                </div>
                                                <div className="mb-1"><strong>RUA:</strong> {dadosOriginais.nm_logradouro_resp}</div>
                                                <div className="mb-1"><strong>Nº:</strong> {dadosOriginais.ds_numero_resp}</div>
                                                <div className="mb-1"><strong>BAIRRO:</strong> {dadosOriginais.nm_bairro_resp}</div>
                                                <div className="mb-1"><strong>CEP:</strong> {dadosOriginais.nr_cep_resp}</div>
                                                <div className="mb-1"><strong>CIDADE:</strong> {dadosOriginais.ds_cidade_resp || 'CRICIÚMA'}</div>
                                            </div>
                                        ) : <Alert variant="warning" className="py-2 small">Erro ao carregar dados originais.</Alert>}
                                    </div>
                                </Col>

                                <Col md={4}>
                                    <div className="p-3 bg-white rounded-4 border shadow-sm h-100" style={{ borderTop: '6px solid #198754' }}>
                                        <h6 className="fw-bold text-success small border-bottom pb-2 d-flex align-items-center">
                                            <FaSyncAlt className="me-2"/> LIDO NO DOCUMENTO (IA)
                                        </h6>
                                        <div style={{fontSize: '11px'}}>
                                            <div className="mb-2 p-2 bg-light rounded text-success">
                                                <div className="fw-bold small"><FaUserAlt className="me-1"/> NOME NO DOCUMENTO:</div>
                                                <div className="fw-bold">{itemSelecionado.nm_contribuinte}</div>
                                            </div>
                                            <div className="mb-1"><strong>RUA:</strong> {itemSelecionado.nm_rua_extr}</div>
                                            <div className="mb-1"><strong>Nº:</strong> {itemSelecionado.ds_numero_extr}</div>
                                            <div className="mb-1"><strong>BAIRRO:</strong> {itemSelecionado.ds_bairro_extr}</div>
                                            <div className="mb-1"><strong>CEP:</strong> {itemSelecionado.nr_cep_extr}</div>
                                            <div className="mb-1"><strong>LOTEAMENTO:</strong> {itemSelecionado.ds_loteamento_extr || '---'}</div>
                                            <div className="mb-1"><strong>EDIFÍCIO:</strong> {itemSelecionado.ds_edificio_extr || '---'}</div>
                                            <div className="mb-1"><strong>COMPLEMENTO:</strong> {itemSelecionado.ds_complemento_extr || '---'}</div>
                                            
                                            {/* BOTÃO DE DOWNLOAD CONFIGURADO COM ds_comprovante */}
                                            <div className="mt-3 pt-2 border-top">
                                                <Button 
                                                    variant="outline-success" 
                                                    size="sm" 
                                                    className="w-100 fw-bold rounded-pill shadow-sm"
                                                    onClick={() => handleDownloadIA(itemSelecionado)}
                                                >
                                                    <FaDownload className="me-2"/> Baixar Comprovante (IA)
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Col>

                                <Col md={4}>
                                    <div className={`p-3 bg-white rounded-4 border shadow-sm h-100 ${itemSelecionado.st_responsavel === 'S' ? "border-danger border-3 shadow" : "border-primary"}`} style={{ borderTop: '6px solid #0d6efd' }}>
                                        <h6 className="fw-bold text-primary small border-bottom pb-2 d-flex align-items-center">
                                            <FaInfoCircle className="me-2"/> DADOS PARA ATUALIZAR
                                        </h6>
                                        <div style={{fontSize: '11px'}}>
                                            {itemSelecionado.st_responsavel === 'S' && (
                                                <Alert variant="danger" className="py-1 px-2 mb-2 d-flex align-items-center fw-bold" style={{fontSize: '10px'}}>
                                                    <FaExclamationTriangle className="me-2"/> MUDANÇA DE RESPONSÁVEL
                                                </Alert>
                                            )}
                                            <div className={`mb-2 p-2 rounded border ${itemSelecionado.st_responsavel === 'S' ? "border-danger bg-danger bg-opacity-10" : "border-primary bg-primary bg-opacity-10"}`}>
                                                <div className="fw-bold small text-muted">NOME INFORMADO:</div>
                                                <div className="fw-bold text-dark">{itemSelecionado.nm_contribuinte}</div>
                                                <div className="mt-1 fw-bold small text-muted">CPF INFORMADO:</div>
                                                <div className="fw-bold text-dark">{itemSelecionado.nr_cpf_atual || '---'}</div>
                                            </div>
                                            <div className="mb-1"><strong>NOVA RUA:</strong> {itemSelecionado.nm_rua_atual}</div>
                                            <div className="mb-1"><strong>Nº:</strong> {itemSelecionado.ds_numero_atual}</div>
                                            <div className="mb-1"><strong>BAIRRO:</strong> {itemSelecionado.ds_bairro_atual}</div>
                                            <div className="mb-1"><strong>CEP:</strong> {itemSelecionado.nr_cep_atual}</div>
                                            <div className="mb-1"><strong>LOTEAMENTO:</strong> {itemSelecionado.ds_loteamento_atual || '---'}</div>
                                            <div className="mb-1"><strong>EDIFÍCIO:</strong> {itemSelecionado.ds_edificio_atual || '---'}</div>
                                            <div className="mb-1"><strong>COMPLEMENTO:</strong> {itemSelecionado.ds_complemento_atual || '---'}</div>
                                            <div className="mt-2 pt-2 border-top">
                                                <div className="small text-lowercase"><FaEnvelope className="me-1"/>{itemSelecionado.ds_email_atual || '---'}</div>
                                                <div className="small"><FaMobileAlt className="me-1"/>{itemSelecionado.nr_telefone_atual || '---'}</div>
                                            </div>
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
                    <Button variant="success" className="rounded-pill px-4 shadow-sm fw-bold" onClick={() => handleAcao(itemSelecionado.id_dados_contribuintes, 'EXECUTAR')} disabled={processando}>
                        <FaCheck className="me-1"/> Aprovar e Efetivar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ValidacaoPrefeitura;