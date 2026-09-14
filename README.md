# NKG dos Importados

Aplicação web da **NKG dos Importados**, com frontend em React/Vite e backend em Node.js/Express.

## Pré-requisitos

- Node.js e npm instalados
- MySQL instalado e em execução

## Instalação

Na raiz do projeto, instale as dependências de cada parte:

```powershell
cd backend
npm install

cd ..\frontend
npm install
```

## Banco de dados

Execute o script [backend/database/schema.sql](backend/database/schema.sql) no MySQL para criar o banco de dados `nkg_importados` e suas tabelas.

Crie o arquivo `backend/.env` com as credenciais do banco de dados:

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

No primeiro terminal, inicie o backend:

```powershell
cd backend
npm run dev
```

O backend será iniciado em `http://localhost:3000`.

No segundo terminal, inicie o frontend:

```powershell
cd frontend
npm run dev
```

O Vite informará, no terminal, o endereço do frontend, normalmente `http://localhost:5173`.

Para executar o backend sem o Nodemon, use:

```powershell
npm start
```

dentro da pasta `backend`.
