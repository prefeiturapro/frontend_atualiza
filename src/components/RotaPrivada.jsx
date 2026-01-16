import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const RotaPrivada = () => {
    // Verifica se tem o item no localStorage
    // ATENÇÃO: Verifique se o nome 'usuario_logado' é exatamente o que você salva no Login
    const usuarioLogado = localStorage.getItem('usuario_logado'); 

    // Se tiver usuário, mostra o conteúdo (Outlet), senão joga pro Login (Navigate)
    return usuarioLogado ? <Outlet /> : <Navigate to="/" replace />;
};

export default RotaPrivada;