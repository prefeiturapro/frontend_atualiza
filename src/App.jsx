import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import LocalizaImovel from "./pages/identificacao/localizaimovel"; 
import Autorizacao from "./pages/identificacao/autorizacao"; 
import Validacao from "./pages/validacao/validacao";
import Atualizacao from "./pages/atualizacao/atualizacao"; 
import Conclusao from "./pages/conclusao/conclusao";

// IMPORTAÇÃO CORRIGIDA PARA A PASTA ADMIN
import ValidacaoPrefeitura from "./pages/admin/validacaoprefeitura"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota inicial */}
        <Route path="/" element={<LocalizaImovel />} />
      
        {/* Rotas do fluxo do contribuinte (Cidadão) */}
        <Route path="/identificacao" element={<LocalizaImovel />} />
        <Route path="/autorizacao" element={<Autorizacao />} />
        <Route path="/validacao" element={<Validacao />} />
        <Route path="/atualizacao" element={<Atualizacao />} />
        <Route path="/conclusao" element={<Conclusao />} />

        {/* ROTA ADMINISTRATIVA (Prefeitura) */}
        <Route path="/admin/validacao" element={<ValidacaoPrefeitura />} />

        {/* COMENTADO PARA NÃO DAR ERRO:
            <Route element={<RotaPrivada />}>
            </Route> 
        */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;