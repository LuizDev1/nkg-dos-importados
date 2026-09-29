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
PUBLIC_API_URL=http://localhost:3000
JWT_SECRET=gere-um-segredo-longo-e-aleatorio
DATA_ENCRYPTION_KEY=gere-uma-chave-de-32-bytes-em-base64
```

Gere a chave de criptografia uma única vez e guarde-a no gerenciador de segredos da hospedagem:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Não troque ou perca `DATA_ENCRYPTION_KEY` sem executar um procedimento de rotação: CPF, telefones e endereços armazenados dependem dela para serem lidos.

Depois de configurar a chave, aplique as migrações para ampliar as colunas e criptografar os dados já existentes:

```powershell
cd backend
npm run migrate
```

Em produção, `FRONTEND_URL` e `PUBLIC_API_URL` devem usar HTTPS e `DB_SSL` deve ser `true`.

## Rotação da chave de dados

1. Mova a chave atual para `DATA_ENCRYPTION_PREVIOUS_KEYS` no formato `id:chave`.
2. Defina uma nova `DATA_ENCRYPTION_KEY` e um novo `DATA_ENCRYPTION_KEY_ID`.
3. Faça backup do banco e execute `npm run rotate-encryption-key` dentro de `backend`.
4. Valide a leitura dos dados e somente então remova a chave anterior.

O comando usa uma transação: qualquer falha reverte a recifragem dos registros.

## Usuário de banco com privilégio mínimo

Use credenciais administrativas apenas para migrações e provisionamento. Configure temporariamente `DB_ADMIN_USER` e `DB_ADMIN_PASSWORD` e execute:

```powershell
cd backend
npm run configure-db-user
```

A conta indicada em `DB_USER` recebe somente `SELECT`, `INSERT`, `UPDATE` e `DELETE`. A aplicação recusa `root` e `admin` em produção. Remova as credenciais administrativas do ambiente da aplicação depois das migrações.

Para ativar a proteção contra bots, crie um widget no Cloudflare Turnstile, configure `TURNSTILE_SECRET_KEY` e `TURNSTILE_EXPECTED_HOSTNAME` no backend e `VITE_TURNSTILE_SITE_KEY` no build do frontend. Em produção, a chave secreta é obrigatória e os tokens são validados exclusivamente pelo servidor.

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
