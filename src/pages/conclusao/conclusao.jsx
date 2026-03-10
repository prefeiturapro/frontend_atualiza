import React, { useEffect, useState } from "react";
import { Container, Card, Button, Spinner, Fade } from 'react-bootstrap';
import { FaCheckCircle, FaPrint, FaHome, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

const Conclusao = () => {
    const navigate = useNavigate();
    const [protocolo, setProtocolo] = useState("");
    const [enviandoEmail, setEnviandoEmail] = useState(false);
    const [emailStatus, setEmailStatus] = useState(""); // Para feedback visual

    // 1. Função para disparar o e-mail (agora definida corretamente)
    const enviarComprovanteEmail = async (email, nome, prot) => {
        setEnviandoEmail(true);
        setEmailStatus("enviando");
        try {
            const response = await fetch(`${API_URL}/dadoscontribuintes/enviar-comprovante`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, nome, protocolo: prot })
            });

            if (response.ok) {
                setEmailStatus("sucesso");
            } else {
                setEmailStatus("erro");
            }
        } catch (error) {
            console.error("Erro ao enviar e-mail:", error);
            setEmailStatus("erro");
        } finally {
            setEnviandoEmail(false);
        }
    };

    useEffect(() => {
        // Recupera os dados salvos no localStorage pelo componente anterior (Atualizacao.jsx)
        const protocoloSalvo = localStorage.getItem("protocolo_gerado");
        const emailUsuario = localStorage.getItem("email_usuario");
        const nomeUsuario = localStorage.getItem("nome_usuario");

        if (protocoloSalvo) {
            setProtocolo(protocoloSalvo);

            // Dispara o envio automático se houver e-mail disponível
            if (emailUsuario) {
                enviarComprovanteEmail(emailUsuario, nomeUsuario, protocoloSalvo);
            }
        } else {
            // Fallback caso a página seja acessada sem um processo ativo
            const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
            setProtocolo(`${date}-000`);
        }
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
                    
                    <div className="bg-light p-3 rounded-3 mb-3 border">
                        <small className="text-uppercase fw-bold text-secondary d-block mb-1">Protocolo de Atendimento</small>
                        <span className="fs-4 fw-bold text-primary">{protocolo}</span>
                    </div>

                    {/* Feedback do envio de E-mail */}
                    <div className="mb-4" style={{ minHeight: '24px' }}>
                        {emailStatus === "enviando" && (
                            <small className="text-muted">
                                <Spinner animation="border" size="sm" className="me-2" />
                                Enviando comprovante por e-mail...
                            </small>
                        )}
                        {emailStatus === "sucesso" && (
                            <small className="text-success fw-bold">
                                <FaEnvelope className="me-1" /> Comprovante enviado para seu e-mail!
                            </small>
                        )}
                        {emailStatus === "erro" && (
                            <small className="text-danger">
                                Não conseguimos enviar o e-mail, mas seu protocolo está salvo.
                            </small>
                        )}
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