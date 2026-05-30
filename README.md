# AstroDay

AstroDay é uma aplicação web simples para explorar a APOD, a imagem astronômica do dia da NASA. O usuário pode ver a imagem atual, pesquisar por data e salvar favoritos em um banco MySQL.

## Tecnologias usadas

- HTML
- CSS puro com Flexbox e Grid
- JavaScript puro no front-end
- Node.js
- Express
- MySQL
- `mysql2/promise`
- Fetch API
- NASA APOD API

## API externa

O projeto consome a API pública **NASA APOD - Astronomy Picture of the Day**:

```txt
https://api.nasa.gov/planetary/apod
```

A chave da NASA fica apenas no back-end, usando a variável `NASA_API_KEY`. Se nenhuma chave for configurada, o sistema usa `DEMO_KEY`.

## Configuração do ambiente

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```env
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=astroday

NASA_API_KEY=DEMO_KEY
```

Caso você tenha uma chave própria da NASA, substitua `DEMO_KEY` pelo valor da sua chave.

## Banco de dados MySQL

Deixe o MySQL rodando localmente e confira se o usuário e a senha do `.env` estão corretos.

O AstroDay cria automaticamente:

- o banco `astroday`, caso ele ainda não exista;
- a tabela `favoritos`, caso ela ainda não exista.

A configuracao tambem pode ser feita manualmente executando o arquivo `database.sql` no MySQL.

A tabela usada pelo sistema é:

```sql
CREATE TABLE IF NOT EXISTS favoritos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  data_imagem DATE NOT NULL,
  explicacao TEXT,
  url TEXT NOT NULL,
  hdurl TEXT NULL,
  media_type VARCHAR(50),
  copyright VARCHAR(255) NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Instalação

Instale as dependências:

```bash
npm install
```

## Como rodar

Para iniciar em modo de desenvolvimento:

```bash
npm run dev
```

Também é possível iniciar com:

```bash
npm start
```

Depois, acesse:

```txt
http://localhost:3000
```

## Funcionalidades

- Carrega automaticamente a imagem astronômica do dia.
- Busca imagens da NASA por data.
- Exibe imagem ou vídeo, conforme o retorno da API.
- Salva favoritos no MySQL.
- Impede favoritos duplicados pela mesma data.
- Lista favoritos em uma galeria responsiva.
- Exibe detalhes completos em modal.
- Exclui favoritos salvos.
- Mostra dashboard com total de favoritos, imagens, vídeos e último favorito salvo.

## Rotas principais

```http
GET /api/nasa/today
GET /api/nasa/date/:date
GET /api/favoritos
POST /api/favoritos
DELETE /api/favoritos/:id
```

O front-end chama apenas essas rotas locais. A chamada para a NASA é feita pelo back-end.
