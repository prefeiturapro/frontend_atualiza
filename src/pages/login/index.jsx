import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { Button, Form, Container, Row, Col, Alert, Navbar } from 'react-bootstrap';
import { FaLock, FaUser } from 'react-icons/fa';

import logo_prefeiturapro from '../../assets/imagem/logo_prefeiturapro.svg';
import logo_cafe_francesa_fallback from '../../assets/imagem/logo_cafe_francesa.png';
import '../../assets/css/login.css';

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3002";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const [configCliente, setConfigCliente] = useState({ 
    nome: "Carregando...", 
    logo: "" 
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDadosCliente = async () => {
      try {
        const response = await fetch(`${API_URL}/dadosclientes/dados`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}), 
        });

        if (response.ok) {
          const data = await response.json();
          setConfigCliente({ 
            nome: data.nm_cliente, 
            logo: data.by_brasaoprefeitura 
          });
          
          localStorage.setItem("config_prefeitura", JSON.stringify(data));
        } else {
          console.error("Erro na resposta do servidor:", response.status);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do cliente:", error);
      }
    };
    fetchDadosCliente();
  }, []);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");

    if (!usuario || !senha) {
       setErro("Preencha usuário e senha.");
       return;
    }

    try {
      const response = await fetch(`${API_URL}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: usuario, senha: senha }),
      });

      const data = await response.json();

      if (response.ok) {
          const dadosUsuario = {
              ...data,
              hora_login: new Date().getTime()
          };
          sessionStorage.setItem('usuario_logado', JSON.stringify(dadosUsuario)); 
          navigate("/menu"); 
      } else {
          setErro(data.erro || "Usuário ou senha inválidos.");
      }
    } catch (error) {
      console.error("Erro:", error);
      setErro("Erro ao conectar com o servidor.");
    }
  };

  return (
    <div className="login-page-wrapper" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <Navbar bg="white" className="border-bottom py-2 shadow-sm d-md-none">
        <Container className="justify-content-center">
            <img 
                src={configCliente.logo || logo_cafe_francesa_fallback} 
                alt="Logo" 
                style={{ height: '40px' }} 
            />
        </Container>
      </Navbar>

      <Container className="flex-grow-1 d-flex align-items-center">
        <Row className="w-100 justify-content-center align-items-center m-0">
          
          <Col md={5} lg={5} className="d-none d-md-flex justify-content-end pe-5">
              <img 
                  src={configCliente.logo || logo_cafe_francesa_fallback} 
                  alt="logomarca" 
                  className="img-dinamica"
                  style={{ 
                    width: '100%', 
                    maxWidth: '300px', // Reduzido ligeiramente para ajuste fino
                    height: 'auto',
                    transform: 'scale(1.0)', // Ajustado de 1.2 para 1.1
                    filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15))'
                  }}
              />
          </Col>

          <Col md={5} lg={4} xl={4} className="ps-md-0">
            <div className="login-card p-4 p-md-5 shadow-lg rounded-4 bg-white border-0">
              <div className="mb-4 text-center text-md-start">
                <h2 className="fw-bold text-primary mb-1" style={{ fontSize: '1.15rem', textTransform: 'uppercase' }}>
                  {configCliente.nome}
                </h2>
                <p className="text-muted small">
                  Portal de Gestão Municipal
                </p>
              </div>

              {erro && <Alert variant="danger" className="py-2 small">{erro}</Alert>}

              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold text-secondary small">Usuário</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><FaUser className="text-muted" /></span>
                    <Form.Control 
                        type="text" 
                        placeholder="Seu nome de usuário" 
                        className="bg-light border-start-0"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold text-secondary small">Senha</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><FaLock className="text-muted" /></span>
                    <Form.Control 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Sua senha" 
                      className="bg-light border-start-0 border-end-0"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                    />
                    <Button 
                        variant="outline-light" 
                        className="border border-start-0 bg-light text-muted"
                        onClick={togglePassword}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </Button>
                  </div>
                </Form.Group>

                <div className="d-grid">
                  <Button variant="primary" type="submit" className="fw-bold py-2 rounded-3 shadow-sm">
                    Acessar Sistema
                  </Button>
                </div>

                <div className="mt-4 d-flex justify-content-between small">
                  <a href="#forgot" className="text-decoration-none text-muted">Esqueceu a senha?</a>
                  <a href="#help" className="text-decoration-none text-muted">Suporte</a>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>

      <footer className="footer-section text-center py-4 mt-auto border-top bg-white">
        <div className="d-flex justify-content-center align-items-center gap-3 mb-2">
            <img src={logo_prefeiturapro} alt="Logo" style={{ height: '30px' }} />
            <div className="vr" style={{ height: '30px' }}></div>
            <span className="fw-bold text-secondary">PrefeituraPro</span>
        </div>
        <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>
          &copy; 2026 Soluções Municipais. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}

export default Login;