import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ProvedorAutenticacao } from './contextos/ContextoAutenticacao.jsx'
import { ProvedorCarrinho } from './contextos/ContextoCarrinho.jsx'
import { ProvedorFavoritos } from './contextos/ContextoFavoritos.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ProvedorAutenticacao>
        <ProvedorFavoritos>
          <ProvedorCarrinho>
            <App />
          </ProvedorCarrinho>
        </ProvedorFavoritos>
      </ProvedorAutenticacao>
    </BrowserRouter>
  </React.StrictMode>,
)
