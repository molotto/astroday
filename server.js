const express = require('express');
const path = require('path');
const { connectDatabase, getPool } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
const NASA_APOD_URL = 'https://api.nasa.gov/planetary/apod';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function formatarDataLocal(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function dataTemFormatoValido(data) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return false;
  }

  const [ano, mes, dia] = data.split('-').map(Number);
  const dataCriada = new Date(ano, mes - 1, dia);

  return (
    dataCriada.getFullYear() === ano &&
    dataCriada.getMonth() === mes - 1 &&
    dataCriada.getDate() === dia
  );
}

function dataEhFutura(data) {
  return data > formatarDataLocal(new Date());
}

async function buscarNaNasa(data) {
  if (typeof fetch !== 'function') {
    throw new Error('A versao do Node.js precisa ter suporte a fetch. Use Node.js 18 ou superior.');
  }

  const url = new URL(NASA_APOD_URL);
  url.searchParams.set('api_key', NASA_API_KEY);

  if (data) {
    url.searchParams.set('date', data);
  }

  const resposta = await fetch(url);
  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    const mensagem =
      dados.msg ||
      (dados.error && dados.error.message) ||
      'Nao foi possivel consultar a API da NASA.';

    const erro = new Error(mensagem);
    erro.status = resposta.status;
    throw erro;
  }

  return dados;
}

function normalizarFavorito(body) {
  return {
    titulo: String(body.titulo || '').trim(),
    data_imagem: String(body.data_imagem || '').trim(),
    explicacao: body.explicacao ? String(body.explicacao).trim() : null,
    url: String(body.url || '').trim(),
    hdurl: body.hdurl ? String(body.hdurl).trim() : null,
    media_type: body.media_type ? String(body.media_type).trim() : 'image',
    copyright: body.copyright ? String(body.copyright).trim() : null
  };
}

app.get('/api/nasa/today', async (req, res) => {
  try {
    const dados = await buscarNaNasa();
    res.json(dados);
  } catch (error) {
    console.error('Erro ao consultar imagem do dia:', error);
    res.status(error.status || 500).json({
      erro: 'Nao foi possivel consultar a API da NASA.',
      detalhe: error.message
    });
  }
});

app.get('/api/nasa/date/:date', async (req, res) => {
  try {
    const { date } = req.params;

    if (!dataTemFormatoValido(date)) {
      return res.status(400).json({ erro: 'Escolha uma data valida no formato YYYY-MM-DD.' });
    }

    if (dataEhFutura(date)) {
      return res.status(400).json({ erro: 'Escolha uma data que nao seja futura.' });
    }

    const dados = await buscarNaNasa(date);
    res.json(dados);
  } catch (error) {
    console.error('Erro ao consultar imagem por data:', error);
    res.status(error.status || 500).json({
      erro: 'Nao foi possivel consultar a API da NASA.',
      detalhe: error.message
    });
  }
});

app.get('/api/favoritos', async (req, res) => {
  try {
    const pool = getPool();
    const [favoritos] = await pool.execute(
      `SELECT id, titulo, data_imagem, explicacao, url, hdurl, media_type, copyright, criado_em
       FROM favoritos
       ORDER BY criado_em DESC, id DESC`
    );

    res.json(favoritos);
  } catch (error) {
    console.error('Erro ao listar favoritos:', error);
    res.status(500).json({ erro: 'Nao foi possivel listar os favoritos salvos.' });
  }
});

app.post('/api/favoritos', async (req, res) => {
  try {
    const favorito = normalizarFavorito(req.body);

    if (!favorito.titulo || !favorito.data_imagem || !favorito.url) {
      return res.status(400).json({
        erro: 'Titulo, data da imagem e URL sao obrigatorios.'
      });
    }

    if (!dataTemFormatoValido(favorito.data_imagem)) {
      return res.status(400).json({ erro: 'A data da imagem deve estar no formato YYYY-MM-DD.' });
    }

    const pool = getPool();
    const [existente] = await pool.execute(
      'SELECT id FROM favoritos WHERE data_imagem = ? LIMIT 1',
      [favorito.data_imagem]
    );

    if (existente.length > 0) {
      return res.status(409).json({ erro: 'Essa imagem ja esta salva nos favoritos.' });
    }

    const [resultado] = await pool.execute(
      `INSERT INTO favoritos
       (titulo, data_imagem, explicacao, url, hdurl, media_type, copyright)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        favorito.titulo,
        favorito.data_imagem,
        favorito.explicacao,
        favorito.url,
        favorito.hdurl,
        favorito.media_type,
        favorito.copyright
      ]
    );

    const [favoritos] = await pool.execute(
      `SELECT id, titulo, data_imagem, explicacao, url, hdurl, media_type, copyright, criado_em
       FROM favoritos
       WHERE id = ?`,
      [resultado.insertId]
    );

    res.status(201).json({
      mensagem: 'Favorito salvo com sucesso.',
      favorito: favoritos[0]
    });
  } catch (error) {
    console.error('Erro ao salvar favorito:', error);
    res.status(500).json({ erro: 'Nao foi possivel salvar o favorito.' });
  }
});

app.delete('/api/favoritos/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ erro: 'Informe um ID valido para excluir.' });
    }

    const pool = getPool();
    const [resultado] = await pool.execute('DELETE FROM favoritos WHERE id = ?', [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Favorito nao encontrado.' });
    }

    res.json({ mensagem: 'Favorito excluido com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir favorito:', error);
    res.status(500).json({ erro: 'Nao foi possivel excluir o favorito.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`AstroDay rodando em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Erro ao conectar no MySQL. Confira se o database.sql foi importado:', error);
    process.exit(1);
  });
