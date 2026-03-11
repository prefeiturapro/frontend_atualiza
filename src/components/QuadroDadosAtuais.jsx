import React from "react";
import { Card, Row, Col } from 'react-bootstrap';
import { FaUniversity } from 'react-icons/fa';

const QuadroDadosAtuais = ({ dados }) => (
    <Card className="border-0 shadow-sm rounded-4 mb-3" style={{ borderLeft: '6px solid #6c757d' }}>
        <Card.Body className="bg-light rounded-4 p-3">
            <div className="mb-2 border-bottom pb-2">
                <div className="d-flex align-items-center text-secondary mb-1">
                    <FaUniversity className="me-2" size={14} />
                    <h6 className="fw-bold mb-0 small text-uppercase">Informações na Base (Atual)</h6>
                </div>
            </div>
            <Row className="g-2 small text-muted text-uppercase">
                <Col xs={12} md={4}><strong>NOME:</strong><br/><span className="text-dark fw-bold">{dados.nm_responsavel}</span></Col>
                <Col xs={12} md={5}><strong>ENDEREÇO:</strong><br/><span className="text-dark fw-bold">{dados.nm_logradouro_resp}, {dados.ds_numero_resp}</span></Col>
                <Col xs={6} md={3}><strong>BAIRRO:</strong><br/><span className="text-dark fw-bold">{dados.nm_bairro_resp}</span></Col>
                <Col xs={6} md={2}><strong>CEP:</strong><br/><span className="text-dark fw-bold">{dados.nr_cep_resp}</span></Col>
            </Row>
        </Card.Body>
    </Card>
);

export default QuadroDadosAtuais;