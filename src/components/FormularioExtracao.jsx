import React from "react";
// ADICIONADO CARD NAS IMPORTAÇÕES ABAIXO
import { Row, Col, Form, InputGroup, Spinner, Card } from 'react-bootstrap';
import { FaSyncAlt, FaIdCard, FaEdit, FaMapMarkerAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const FormularioExtracao = ({ 
    dadosExtraidos, setDadosExtraidos, statusIA, aguardandoDeclaracao, erroTitularidade, stBloqueioResp,
    validandoCPF, cpfValidoOficial, consultarCpfNoBackend, aplicarMascaraCPF,
    ehMunicipioOficial, listaLogradouros, setStEditadoManual, setLogradouroValido, logradouroValido,
    listaBairros, setBairroValido, bairroValido, erroCpfMensagem, municipioSede
}) => {
    return (
        <Card className="border-0 shadow rounded-4 p-4" style={{ borderTop: '6px solid #198754' }}>
            <div className="mb-4 border-bottom pb-3">
                <div className="d-flex align-items-center text-success mb-1">
                    <FaSyncAlt className="me-2" />
                    <h6 className="fw-bold mb-0 text-uppercase">Dados Extraídos</h6>
                </div>
            </div>

            <Form className="text-uppercase">
                <Row className="g-3">
                    <Col md={12}>
                        <Form.Label className="small fw-bold text-success">NOME NO DOCUMENTO</Form.Label>
                        <Form.Control size="sm" className="bg-white fw-bold" value={dadosExtraidos.nm_contribuinte} readOnly />
                    </Col>

                    {erroTitularidade && stBloqueioResp === 'S' && (
                        <Col md={12} className="mb-3">
                            <div className="p-3 border rounded-3 bg-light border-warning shadow-sm">
                                <Form.Label className="small fw-bold text-dark d-flex align-items-center">
                                    <FaEdit className="me-2 text-warning"/> VOCÊ É O RESPONSÁVEL PELO IMÓVEL?
                                </Form.Label>
                                <Form.Select 
                                    size="sm" 
                                    className="fw-bold border-warning"
                                    value={dadosExtraidos.st_responsavel}
                                    onChange={(e) => setDadosExtraidos({...dadosExtraidos, st_responsavel: e.target.value})}
                                >
                                    <option value="N">SELECIONE UMA OPÇÃO...</option>
                                    <option value="S">SIM, SOU O RESPONSÁVEL</option>
                                    <option value="N">NÃO SOU O RESPONSÁVEL</option>
                                </Form.Select>
                                <small className="text-muted" style={{fontSize: '11px'}}>* Necessário confirmar para liberar a edição abaixo.</small>
                            </div>
                        </Col>
                    )}

                    <Col md={6}>
                        <Form.Label className="small fw-bold text-primary"><FaIdCard className="me-1"/> CPF DO RESPONSÁVEL</Form.Label>
                        <InputGroup size="sm">
                            <Form.Control 
                                placeholder="000.000.000-00" 
                                value={dadosExtraidos.nr_cpf_atual} 
                                onChange={(e) => setDadosExtraidos({...dadosExtraidos, nr_cpf_atual: aplicarMascaraCPF(e.target.value)})} 
                                onBlur={(e) => consultarCpfNoBackend(e.target.value)}
                                readOnly={statusIA !== "concluido" || aguardandoDeclaracao}
                                className={`fw-bold ${cpfValidoOficial === true ? "border-success" : cpfValidoOficial === false ? "border-danger" : ""}`}
                            />
                            {validandoCPF && <InputGroup.Text className="bg-white"><Spinner animation="border" size="sm" /></InputGroup.Text>}
                        </InputGroup>
                        {cpfValidoOficial === true && <small className="text-success fw-bold">✓ VALIDADO NA RECEITA</small>}
                        {cpfValidoOficial === false && <small className="text-danger fw-bold">{erroCpfMensagem}</small>}
                    </Col>

                    <Col md={6}></Col>

                    <Col md={9}>
                        <Form.Label className="small fw-bold">RUA/LOGRADOURO</Form.Label>
                        <InputGroup size="sm">
                            {ehMunicipioOficial ? (
                                <Form.Select
                                    size="sm"
                                    value={dadosExtraidos.nm_rua_atual}
                                    onChange={(e) => {
                                        setDadosExtraidos({...dadosExtraidos, nm_rua_atual: e.target.value});
                                        setStEditadoManual("S");
                                        setLogradouroValido(true);
                                    }}
                                    disabled={statusIA !== "concluido" || aguardandoDeclaracao}
                                    className={`fw-bold ${logradouroValido ? "border-success bg-white" : "border-danger bg-white"}`}
                                >
                                    <option value="">SELECIONE O LOGRADOURO...</option>
                                    {listaLogradouros.map((rua, idx) => (
                                        <option key={idx} value={rua.nm_logradouro}>{rua.nm_logradouro}</option>
                                    ))}
                                </Form.Select>
                            ) : (
                                <Form.Control 
                                    value={dadosExtraidos.nm_rua_atual} 
                                    onChange={(e) => {
                                        setDadosExtraidos({...dadosExtraidos, nm_rua_atual: e.target.value.toUpperCase()});
                                        setStEditadoManual("S");
                                    }}
                                    readOnly={statusIA !== "concluido" || aguardandoDeclaracao} 
                                    className="fw-bold"
                                />
                            )}
                        </InputGroup>
                        {statusIA === "concluido" && !aguardandoDeclaracao && (
                            <small className={`fw-bold ${ehMunicipioOficial ? (logradouroValido ? "text-success" : "text-danger") : "text-primary"}`} style={{fontSize: '10px'}}>
                                {!ehMunicipioOficial ? <><FaMapMarkerAlt className="me-1"/> Endereço fora de {municipioSede}. Digitação livre permitida.</> : (logradouroValido ? <><FaCheckCircle className="me-1"/> Logradouro oficial localizado.</> : <><FaExclamationTriangle className="me-1"/> Logradouro não encontrado na base oficial.</>)}
                            </small>
                        )}
                    </Col>

                    <Col md={3}>
                        <Form.Label className="small fw-bold">Nº</Form.Label>
                        <Form.Control size="sm" value={dadosExtraidos.ds_numero_atual} onChange={(e) => {setDadosExtraidos({...dadosExtraidos, ds_numero_atual: e.target.value}); setStEditadoManual("S");}} readOnly={statusIA !== "concluido" || aguardandoDeclaracao} />
                    </Col>

                    <Col md={4}>
                        <Form.Label className="small fw-bold text-muted">LOTEAMENTO</Form.Label>
                        <Form.Control size="sm" value={dadosExtraidos.ds_loteamento_atual} onChange={(e) => {setDadosExtraidos({...dadosExtraidos, ds_loteamento_atual: e.target.value.toUpperCase()}); setStEditadoManual("S");}} readOnly={statusIA !== "concluido" || aguardandoDeclaracao} className="bg-white fw-bold" />
                    </Col>
                    <Col md={4}>
                        <Form.Label className="small fw-bold text-muted">EDIFÍCIO</Form.Label>
                        <Form.Control size="sm" value={dadosExtraidos.ds_edificio_atual} onChange={(e) => {setDadosExtraidos({...dadosExtraidos, ds_edificio_atual: e.target.value.toUpperCase()}); setStEditadoManual("S");}} readOnly={statusIA !== "concluido" || aguardandoDeclaracao} className="bg-white fw-bold" />
                    </Col>
                    <Col md={4}>
                        <Form.Label className="small fw-bold text-muted">COMPLEMENTO</Form.Label>
                        <Form.Control size="sm" value={dadosExtraidos.ds_complemento_atual} onChange={(e) => {setDadosExtraidos({...dadosExtraidos, ds_complemento_atual: e.target.value.toUpperCase()}); setStEditadoManual("S");}} readOnly={statusIA !== "concluido" || aguardandoDeclaracao} className="bg-white fw-bold" />
                    </Col>

                    <Col md={5}>
                        <Form.Label className="small fw-bold">BAIRRO</Form.Label>
                        <InputGroup size="sm">
                            {ehMunicipioOficial ? (
                                <Form.Select size="sm" value={dadosExtraidos.ds_bairro_atual} onChange={(e) => {setDadosExtraidos({...dadosExtraidos, ds_bairro_atual: e.target.value}); setStEditadoManual("S"); setBairroValido(true);}} disabled={statusIA !== "concluido" || aguardandoDeclaracao} className={`fw-bold ${bairroValido ? "border-success" : "border-danger"}`}>
                                    <option value="">SELECIONE O BAIRRO...</option>
                                    {listaBairros.map((b, idx) => <option key={idx} value={b.nm_bairro}>{b.nm_bairro}</option>)}
                                </Form.Select>
                            ) : (
                                <Form.Control value={dadosExtraidos.ds_bairro_atual} onChange={(e) => {setDadosExtraidos({...dadosExtraidos, ds_bairro_atual: e.target.value.toUpperCase()}); setStEditadoManual("S");}} readOnly={statusIA !== "concluido" || aguardandoDeclaracao} className="fw-bold" />
                            )}
                        </InputGroup>
                        {statusIA === "concluido" && !aguardandoDeclaracao && ehMunicipioOficial && (
                            <small className={`fw-bold ${bairroValido ? "text-success" : "text-danger"}`} style={{fontSize: '10px'}}>
                                {bairroValido ? <><FaCheckCircle className="me-1"/> Bairro oficial localizado.</> : <><FaExclamationTriangle className="me-1"/> Bairro não encontrado.</>}
                            </small>
                        )}
                    </Col>

                    <Col md={4}><Form.Label className="small fw-bold">CIDADE</Form.Label><Form.Control size="sm" value={dadosExtraidos.ds_cidade_atual} readOnly /></Col>
                    <Col md={3}><Form.Label className="small fw-bold">CEP</Form.Label><Form.Control size="sm" value={dadosExtraidos.nr_cep_atual} readOnly /></Col>
                </Row>
            </Form>
        </Card>
    );
};

export default FormularioExtracao;