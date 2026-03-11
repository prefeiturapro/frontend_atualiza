import React from "react";
import { Navbar, Container } from 'react-bootstrap';

const HeaderResponsivo = ({ logo, nome }) => (
    <Navbar bg="white" className="border-bottom py-2 shadow-sm">
        <Container>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '12px' }}>
                <img 
                    src={logo || "/brasao_prefeitura.png"} 
                    alt="Brasão" 
                    style={{ height: '45px', width: 'auto', flexShrink: 0 }} 
                    onError={(e) => { e.target.src = "/brasao_prefeitura.png"; }} 
                />
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <h6 className="fw-bold mb-0 text-dark" style={{ 
                        fontSize: 'clamp(0.85rem, 4vw, 1.1rem)', 
                        whiteSpace: 'normal',
                        lineHeight: '1.2'
                    }}>
                        {nome || "Portal do Cidadão"}
                    </h6>
                    <div className="text-muted" style={{ fontSize: '10px', textTransform: 'uppercase' }}>
                        Atualização Cadastral
                    </div>
                </div>
            </div>
        </Container>
    </Navbar>
);

export default HeaderResponsivo;