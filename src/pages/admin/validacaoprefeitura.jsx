import React, { useState, useEffect } from "react";
import { 
    Container, Table, Card, Button, Row, Col, Badge, 
    Form, Modal, Spinner, Navbar, Alert 
} from 'react-bootstrap';
import { 
    FaCheck, FaTimes, FaUniversity, FaSyncAlt, FaInfoCircle, FaEnvelope, FaMobileAlt, FaEye, FaHistory, FaCheckDouble, FaIdCard, FaUserAlt, FaExclamationTriangle, FaCheckCircle, FaBuilding, FaMapMarkedAlt
} from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

const ValidacaoPrefeitura = () => {
    const [pedidos, setPedidos] = useState([]);
    const [filtro, setFiltro] = useState("TODOS"); 
    const [carregando, setCarregando] = useState(true);
    const [itemSelecionado, setItemSelecionado] = useState(null);
    const [dadosOriginais, setDadosOriginais] = useState(null); 
    const [carregandoOriginal, setCarregandoOriginal] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [processando, setProcessando] = useState(false);
    
    const [configPrefeitura, setConfigPrefeitura] = useState({ NOME: "", logo: "" });

    // --- FUNÇÃO DE SIMILARIDADE DE NOMES ---
    const calcularSimilaridade = (str1, str2) => {
        if (!str1 || !str2) return 0;
        // Normaliza removendo acentos e deixando em caixa alta
        const s1 = str1.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        const s2 = str2.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        
        if (s1 === s2) return 100;

        const palavrasS1 = s1.split(/\s+/).filter(p => p.length > 1);
        const palavrasS2 = s2.split(/\s+/).filter(p => p.length > 1);
        
        // Conta quantas palavras de um nome estão contidas no outro (ou vice-versa)
        const matches = palavrasS1.filter(p1 => 
            palavrasS2.some(p2 => p2.includes(p1) || p1.includes(p2))
        );
        
        return (matches.length / Math.max(palavrasS1.length, palavrasS2.length)) * 100;
    };

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
                                <Button variant="success" size="sm" className="rounded-pill px-3 shadow-sm fw-bold text-uppercase" onClick={handleAtualizarLote} disabled={processando || pedidos.length === 0}>
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
                                <th className="py-3">Protocolo</th>
                                <th className="py-3">Data / Hora</th>
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
                                    <td className="align-middle text-center">
                                        <div className="fw-bold text-primary">{p.cd_reduzido_imovel}</div>
                                        <div className="text-muted small" style={{fontSize: '10px'}}>{p.ds_inscricao_imovel}</div>
                                    </td>
                                    <td className="align-middle">
                                        <div className="fw-bold">{p.nm_contribuinte}</div>
                                        <div className="text-muted small">CÓD: {p.cd_contribuinte}</div>
                                    </td>
                                    <td className="align-middle"><Badge bg="light" text="dark" className="border">{p.ds_protocolo}</Badge></td>
                                    <td className="align-middle">
                                        <div className="fw-bold">{p.dt_atualizacao ? new Date(p.dt_atualizacao).toLocaleDateString('pt-BR') : '---'}</div>
                                        <div className="text-muted small"><FaHistory size={10}/> {p.hr_atualizacao?.substring(0, 5)}</div>
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
                                {/* QUADRO 1: CADASTRO ATUAL NO BANCO */}
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
                                        ) : <Alert variant="warning" className="py-2 small">Não foi possível carregar os dados originais.</Alert>}
                                    </div>
                                </Col>

                                {/* QUADRO 2: LIDO PELA IA */}
                                <Col md={4}>
                                    <div className="p-3 bg-white rounded-4 border shadow-sm h-100" style={{ borderTop: '6px solid #198754' }}>
                                        <h6 className="fw-bold text-success small border-bottom pb-2 d-flex align-items-center">
                                            <FaSyncAlt className="me-2"/> LIDO NO COMPROVANTE (IA)
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
                                        </div>
                                    </div>
                                </Col>

                                {/* QUADRO 3: DADOS ENVIADOS (FINAL) */}
                                <Col md={4}>
                                    {(() => {
                                        const score = calcularSimilaridade(itemSelecionado.nm_contribuinte, dadosOriginais?.nm_responsavel);
                                        const ehDiferente = score < 60; // Só fica vermelho se for muito diferente
                                        const temVariacao = score >= 60 && score < 100;

                                        return (
                                            <div 
                                                className={`p-3 bg-white rounded-4 border shadow-sm h-100 ${
                                                    ehDiferente ? "border-danger border-3 shadow" : temVariacao ? "border-warning border-3" : "border-primary"
                                                }`} 
                                                style={{ borderTop: '6px solid #0d6efd' }}
                                            >
                                                <h6 className="fw-bold text-primary small border-bottom pb-2 d-flex align-items-center">
                                                    <FaInfoCircle className="me-2"/> DADOS ENVIADOS (FINAL)
                                                </h6>
                                                
                                                <div style={{fontSize: '11px'}}>
                                                    {/* ALERTA DE SCORE */}
                                                    {ehDiferente && dadosOriginais && (
                                                        <Alert variant="danger" className="py-1 px-2 mb-2 d-flex align-items-center fw-bold" style={{fontSize: '10px'}}>
                                                            <FaExclamationTriangle className="me-2"/> RESPONSÁVEL ALTERADO DETECTADO
                                                        </Alert>
                                                    )}
                                                    {temVariacao && (
                                                        <Alert variant="warning" className="py-1 px-2 mb-2 d-flex align-items-center fw-bold text-dark" style={{fontSize: '10px'}}>
                                                            <FaCheckCircle className="me-2"/> VARIAÇÃO DE NOME ACEITÁVEL ({score.toFixed(0)}%)
                                                        </Alert>
                                                    )}

                                                    <div className={`mb-2 p-2 rounded border ${ehDiferente ? "border-danger bg-danger bg-opacity-10" : temVariacao ? "border-warning bg-warning bg-opacity-10" : "border-primary text-primary"}`}>
                                                        <div className="fw-bold small text-muted">NOME INFORMADO:</div>
                                                        <div className="fw-bold text-dark">{itemSelecionado.nm_contribuinte}</div>
                                                        <div className="mt-1 fw-bold small text-muted">CPF INFORMADO:</div>
                                                        <div className="fw-bold text-dark">{itemSelecionado.nr_cpf_atual || 'NÃO INFORMADO'}</div>
                                                    </div>

                                                    <div className="mb-1 fw-bold text-primary"><strong>RUA:</strong> {itemSelecionado.nm_rua_atual}</div>
                                                    <div className="mb-1"><strong>Nº:</strong> {itemSelecionado.ds_numero_atual}</div>
                                                    <div className="mb-1"><strong>BAIRRO:</strong> {itemSelecionado.ds_bairro_atual}</div>
                                                    <div className="mb-1"><strong>CEP:</strong> {itemSelecionado.nr_cep_atual}</div>
                                                    
                                                    {/* CAMPOS ADICIONAIS NO FINAL */}
                                                    <div className="mb-1"><FaMapMarkedAlt size={10} className="me-1"/><strong>LOTEAMENTO:</strong> {itemSelecionado.ds_loteamento_atual || '---'}</div>
                                                    <div className="mb-1"><FaBuilding size={10} className="me-1"/><strong>EDIFÍCIO:</strong> {itemSelecionado.ds_edificio_atual || '---'}</div>
                                                    <div className="mb-1"><strong>COMPLEMENTO:</strong> {itemSelecionado.ds_complemento_atual || '---'}</div>

                                                    <div className="mt-2 pt-2 border-top">
                                                        <div className="small text-lowercase"><FaEnvelope className="me-1"/>{itemSelecionado.ds_email_atual || '---'}</div>
                                                        <div className="small"><FaMobileAlt className="me-1"/>{itemSelecionado.nr_telefone_atual || '---'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
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