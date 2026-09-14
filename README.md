# NKG dos Importados

Aplicacao web da NKG dos Importados, com frontend em React/Vite e backend em Node.js/Express.

## Pre-requisitos

- Node.js e npm instalados
- MySQL instalado e em execucao

## Instalacao

Na raiz do projeto, instale as dependencias de cada parte:

```powershell
cd backend
npm install

cd ..\frontend
npm install
```

## Banco de dados

Execute o script [backend/database/schema.sql](backend/database/schema.sql) no MySQL para criar o banco `nkg_importados` e suas tabelas.

Crie o arquivo `backend/.env` com as credenciais do banco:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=nkg_importados
DB_PORT=3306
PORT=3000
```

## Como executar

Abra dois terminais na raiz do projeto.

No primeiro, inicie o backend:

```powershell
cd backend
npm run dev
```

O backend sera iniciado em `http://localhost:3000`.

No segundo, inicie o frontend:

```powershell
cd frontend
npm run dev
```

O Vite informara no terminal o endereco do frontend, normalmente `http://localhost:5173`.

Para executar o backend sem o nodemon, use `npm start` dentro da pasta `backend`.