# Instrucoes basicas de execucao - AstroDay

AstroDay e uma aplicacao web para consultar a APOD, a imagem astronomica do dia da NASA, pesquisar imagens por data e salvar favoritos em um banco de dados MySQL.

## Pre-requisitos

- Node.js 18 ou superior
- MySQL instalado e em execucao
- npm

## 1. Entrar na pasta do projeto

```bash
cd astroday
```

## 2. Instalar as dependencias

```bash
npm install
```

## 3. Configurar o arquivo .env

Crie um arquivo `.env` na raiz do projeto com base no arquivo `.env.example`.

Exemplo:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=astroday

NASA_API_KEY=DEMO_KEY
```

Caso tenha uma chave propria da NASA, substitua `DEMO_KEY` pelo valor da sua chave. Se nenhuma chave for configurada, o sistema usa `DEMO_KEY`.

## Como obter a NASA API Key

1. Acesse o site oficial das APIs da NASA:

```txt
https://api.nasa.gov/
```

2. Na secao `Generate API Key`, preencha o formulario com seus dados.

3. Depois de gerar a chave, copie o valor recebido.

4. No arquivo `.env`, substitua `DEMO_KEY` pela sua chave:

O projeto tambem funciona com `DEMO_KEY`, mas eh bem limitado.

## 4. Importar o banco de dados

O arquivo de exportacao SQL do projeto e:

```txt
database.sql
```

Esse arquivo cria o banco `astroday` e a tabela `favoritos`.

No terminal, execute:

```bash
mysql -u root -p < database.sql
```

Se estiver usando PowerShell e o comando acima nao funcionar, use:

```powershell
Get-Content database.sql | mysql -u root -p
```

## 5. Iniciar o projeto

Para iniciar normalmente:

```bash
npm start
```

Ou, em modo desenvolvimento:

```bash
npm run dev
```

## 6. Acessar o sistema

Depois de iniciar o servidor, acesse no navegador:

```txt
http://localhost:3000
```