import React from "react";
import { Row, Col, Form, InputGroup, Button, Spinner, Alert } from 'react-bootstrap';
import { FaEnvelope, FaMobileAlt, FaCheckCircle } from 'react-icons/fa';

const VerificacaoContato = ({
    dadosExtraidos, setDadosExtraidos, statusIA, aguardandoDeclaracao,
    emailVerificado, handleEnviarEmailOtp, enviandoEmailOtp, emailEnviado,
    codigoOtpEmail, setCodigoOtpEmail, handleValidarCodigoEmail, validandoEmail,
    telefoneVerificado, aplicarMascaraTelefone, handleEnviarSms, enviandoSms,
    smsEnviado, codigoOtp, setCodigoOtp, handleValidarCodigo, validandoSms
}) => {
    return (
        <Row className="g-2 text-uppercase">
            <Col xs={12} className="mt-2">
                <Form.Label className="small fw-bold text-primary mb-1"><FaEnvelope className="me-1"/> E-MAIL</Form.Label>
                <InputGroup size="sm">
                    <Form.Control className="text-lowercase fw-bold" value={dadosExtraidos.ds_email_atual} onChange={(e) => setDadosExtraidos({...dadosExtraidos, ds_email_atual: e.target.value})} readOnly={statusIA !== "concluido" || emailVerificado || aguardandoDeclaracao} />
                    {!emailVerificado && statusIA === "concluido" && !aguardandoDeclaracao && (
                        <Button variant="primary" onClick={handleEnviarEmailOtp} disabled={enviandoEmailOtp}>{enviandoEmailOtp ? <Spinner size="sm" animation="border" /> : "Validar"}</Button>
                    )}
                </InputGroup>
            </Col>

            {emailEnviado && !emailVerificado && (
                <Col xs={12} className="mt-2">
                    <InputGroup size="sm">
                        <Form.Control placeholder="CÓDIGO E-MAIL" value={codigoOtpEmail} onChange={(e) => setCodigoOtpEmail(e.target.value)} />
                        <Button variant="warning" onClick={handleValidarCodigoEmail} disabled={validandoEmail}>OK</Button>
                    </InputGroup>
                </Col>
            )}

            <Col xs={12} className="mt-3 border-top pt-2"><h6 className="fw-bold text-primary small mb-2"><FaMobileAlt className="me-2"/>Assinatura via celular</h6></Col>
            <Col xs={12}>
                <InputGroup size="sm">
                    <Form.Control value={dadosExtraidos.nr_telefone_atual} onChange={(e) => setDadosExtraidos({...dadosExtraidos, nr_telefone_atual: aplicarMascaraTelefone(e.target.value)})} disabled={telefoneVerificado || statusIA !== "concluido" || aguardandoDeclaracao} placeholder="(00) 00000-0000" />
                    {!telefoneVerificado && statusIA === "concluido" && !aguardandoDeclaracao && <Button variant="primary" onClick={handleEnviarSms} disabled={enviandoSms}>Enviar SMS</Button>}
                </InputGroup>
            </Col>
            {smsEnviado && !telefoneVerificado && (
                <Col xs={12} className="mt-2">
                    <InputGroup size="sm">
                        <Form.Control placeholder="CÓDIGO SMS" value={codigoOtp} onChange={(e) => setCodigoOtp(e.target.value)} />
                        <Button variant="warning" onClick={handleValidarCodigo} disabled={validandoSms}>OK</Button>
                    </InputGroup>
                </Col>
            )}
            {telefoneVerificado && <Col xs={12}><Alert variant="success" className="py-1 mt-2 mb-0 fw-bold small"><FaCheckCircle className="me-2" />CELULAR VERIFICADO!</Alert></Col>}
        </Row>
    );
};

export default VerificacaoContato;