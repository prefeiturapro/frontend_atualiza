import React, { useEffect, useState } from "react";
import { Container, Card, Button } from 'react-bootstrap';
import { FaCheckCircle, FaPrint, FaHome } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

const Conclusao = () => {
    const navigate = useNavigate();
    const [protocolo, setProtocolo] = useState("");

    useEffect(() => {
        // Tenta recuperar o protocolo gerado e salvo no banco de dados
        const protocoloSalvo = localStorage.getItem("protocolo_gerado");
        
        if (protocoloSalvo) {
            setProtocolo(protocoloSalvo);
        } else {
            // Caso o usuário acesse a página direto sem salvar, gera um temporário por segurança
            const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
            setProtocolo(`${date}-000`);
        }

        // Opcional: Limpa os dados do imóvel após a conclusão para segurança (LGPD)
        // localStorage.removeItem("dados_imovel");
    }, []);

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            <Card className="border-0 shadow-lg rounded-4 text-center p-5" style={{ maxWidth: '500px' }}>
                <Card.Body>
                    <FaCheckCircle size={80} className="text-success mb-4 animate__animated animate__bounceIn" />
                    <h2 className="fw-bold text-dark mb-3">Tudo Certo!</h2>
                    <p className="text-muted mb-4">
                        Sua atualização cadastral foi enviada com sucesso para análise da nossa equipe tributária.
                    </p>
                    
                    <div className="bg-light p-3 rounded-3 mb-4 border">
                        <small className="text-uppercase fw-bold text-secondary d-block mb-1">Protocolo de Atendimento</small>
                        <span className="fs-4 fw-bold text-primary">{protocolo}</span>
                    </div>

                    <div className="d-grid gap-2">
                        <Button variant="outline-primary" className="rounded-pill fw-bold" onClick={() => window.print()}>
                            <FaPrint className="me-2" /> Imprimir Comprovante
                        </Button>
                        <Button variant="success" className="rounded-pill fw-bold py-3 shadow" onClick={() => navigate("/")}>
                            <FaHome className="me-2" /> Voltar ao Início
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Conclusao;