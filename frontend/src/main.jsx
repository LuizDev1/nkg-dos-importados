import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/figtree'
import App from './App.jsx'
import { ProvedorAutenticacao } from './contextos/ContextoAutenticacao.jsx'
import { ProvedorCarrinho } from './contextos/ContextoCarrinho.jsx'
import { ProvedorFavoritos } from './contextos/ContextoFavoritos.jsx'
import { ProvedorTema } from './contextos/ContextoTema.jsx'
import './index.css'
import { configurarFetchSeguro } from './servicos/apiSegura.js'

configurarFetchSeguro()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ProvedorTema>
        <ProvedorAutenticacao>
          <ProvedorFavoritos>
            <ProvedorCarrinho>
              <App />
            </ProvedorCarrinho>
          </ProvedorFavoritos>
        </ProvedorAutenticacao>
      </ProvedorTema>
    </BrowserRouter>
  </React.StrictMode>,
)
