let imagemAtual = null;
let favoritosAtuais = [];
let tempoMensagem = null;
let codigoBuscaImagem = 0;

let formularioBusca;
let campoData;
let botaoHoje;
let cartaoImagem;
let galeriaFavoritos;
let areaMensagem;
let modalDetalhes;
let conteudoModal;
let botaoFecharModal;

document.addEventListener('DOMContentLoaded', iniciarAplicacao);

function iniciarAplicacao() {
  formularioBusca = document.getElementById('formulario-busca-data');
  campoData = document.getElementById('campo-data-imagem');
  botaoHoje = document.getElementById('botao-imagem-atual');
  cartaoImagem = document.getElementById('cartao-imagem-consultada');
  galeriaFavoritos = document.getElementById('galeria-favoritos-salvos');
  areaMensagem = document.getElementById('area-retorno-sistema');
  modalDetalhes = document.getElementById('modal-detalhes-favorito');
  conteudoModal = document.getElementById('conteudo-detalhes-favorito');
  botaoFecharModal = document.getElementById('botao-fechar-detalhes');

  campoData.max = obterDataHoje();
  campoData.value = obterDataHoje();

  formularioBusca.addEventListener('submit', buscarImagemPorData);
  botaoHoje.addEventListener('click', carregarImagemDoDia);
  galeriaFavoritos.addEventListener('click', clicarNaGaleria);
  botaoFecharModal.addEventListener('click', fecharModal);

  modalDetalhes.addEventListener('click', function (event) {
    if (event.target.hasAttribute('data-fechar-modal')) {
      fecharModal();
    }
  });

  carregarFavoritos();
  carregarImagemDoDia();
}

function obterDataHoje() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function prepararImagem(dados) {
  return {
    id: dados.id,
    titulo: dados.titulo || dados.title || 'Sem título',
    data_imagem: String(dados.data_imagem || dados.date || '').slice(0, 10),
    explicacao: dados.explicacao || dados.explanation || '',
    url: dados.url || '',
    hdurl: dados.hdurl || '',
    media_type: dados.media_type || 'image',
    copyright: dados.copyright || ''
  };
}

function formatarData(data) {
  const partes = String(data || '').slice(0, 10).split('-');

  if (partes.length !== 3) {
    return 'Data indisponível';
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function limparTexto(texto) {
  return String(texto || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function buscarJSON(url, opcoes) {
  const resposta = await fetch(url, opcoes || {});
  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    let mensagem = dados.erro || dados.mensagem || 'Erro ao consultar os dados.';

    if (dados.detalhe) {
      mensagem = `${mensagem} Detalhe: ${dados.detalhe}`;
    }

    throw new Error(mensagem);
  }

  return dados;
}

function iniciarBuscaImagem() {
  codigoBuscaImagem += 1;
  return codigoBuscaImagem;
}

function buscaImagemAindaAtual(codigoBusca) {
  return codigoBusca === codigoBuscaImagem;
}

async function carregarImagemDoDia() {
  const codigoBusca = iniciarBuscaImagem();

  cartaoImagem.innerHTML = '<div class="caixa-carregando"><span class="indicador-carregando"></span><p>Carregando imagem astronômica...</p></div>';

  try {
    const dados = await buscarJSON('/api/nasa/today');

    if (!buscaImagemAindaAtual(codigoBusca)) {
      return;
    }

    renderizarImagemPrincipal(dados);
    mostrarMensagem('Imagem carregada com sucesso.', 'sucesso');
  } catch (error) {
    if (!buscaImagemAindaAtual(codigoBusca)) {
      return;
    }

    cartaoImagem.innerHTML = '<div class="estado-vazio"><p>Não foi possível consultar a API da NASA.</p></div>';
    mostrarMensagem(error.message, 'erro');
  }
}

async function buscarImagemPorData(event) {
  event.preventDefault();

  const dataEscolhida = campoData.value;

  if (!dataEscolhida) {
    mostrarMensagem('Escolha uma data válida.', 'erro');
    return;
  }

  if (dataEscolhida > obterDataHoje()) {
    mostrarMensagem('Escolha uma data que não seja futura.', 'erro');
    return;
  }

  cartaoImagem.innerHTML = '<div class="caixa-carregando"><span class="indicador-carregando"></span><p>Buscando imagem...</p></div>';
  const codigoBusca = iniciarBuscaImagem();

  try {
    const dados = await buscarJSON(`/api/nasa/date/${dataEscolhida}`);

    if (!buscaImagemAindaAtual(codigoBusca)) {
      return;
    }

    renderizarImagemPrincipal(dados);
    mostrarMensagem('Imagem carregada com sucesso.', 'sucesso');
  } catch (error) {
    if (!buscaImagemAindaAtual(codigoBusca)) {
      return;
    }

    cartaoImagem.innerHTML = '<div class="estado-vazio"><p>Não foi possível consultar essa data.</p></div>';
    mostrarMensagem(error.message, 'erro');
  }
}

function renderizarImagemPrincipal(dados) {
  imagemAtual = prepararImagem(dados);

  let copyright = '';
  let linkHD = '';

  if (imagemAtual.copyright) {
    copyright = `<span class="etiqueta">© ${limparTexto(imagemAtual.copyright)}</span>`;
  }

  if (imagemAtual.hdurl) {
    linkHD = `<a class="botao botao-secundario" href="${imagemAtual.hdurl}" target="_blank">Abrir em HD</a>`;
  }

  cartaoImagem.innerHTML = `
    <div class="area-midia-principal">
      ${montarMidia(imagemAtual)}
    </div>
    <div class="conteudo-imagem-principal">
      <h2>${limparTexto(imagemAtual.titulo)}</h2>
      <div class="linha-informacoes">
        <span class="etiqueta">${formatarData(imagemAtual.data_imagem)}</span>
        <span class="etiqueta">${imagemAtual.media_type === 'video' ? 'Vídeo' : 'Imagem'}</span>
        ${copyright}
      </div>
      <p class="texto-explicacao">${limparTexto(imagemAtual.explicacao)}</p>
      <div class="acoes-principais">
        <button type="button" id="botao-salvar-favorito" class="botao botao-principal">Salvar favorito</button>
        ${linkHD}
      </div>
    </div>
  `;

  document.getElementById('botao-salvar-favorito').addEventListener('click', salvarFavorito);
  atualizarBotaoFavorito();
}

function montarMidia(item) {
  if (item.media_type === 'image') {
    return `<img src="${item.url}" alt="${limparTexto(item.titulo)}">`;
  }

  return `
    <div class="quadro-video">
      <iframe src="${item.url}" title="${limparTexto(item.titulo)}" allowfullscreen></iframe>
    </div>
    <div class="acoes-midia">
      <a href="${item.url}" target="_blank">Abrir vídeo em nova aba</a>
    </div>
  `;
}

async function salvarFavorito() {
  if (!imagemAtual) {
    mostrarMensagem('Nenhuma imagem foi carregada.', 'erro');
    return;
  }

  if (favoritoJaExiste(imagemAtual.data_imagem)) {
    mostrarMensagem('Essa imagem já está salva nos favoritos.', 'erro');
    return;
  }

  try {
    await buscarJSON('/api/favoritos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(imagemAtual)
    });

    mostrarMensagem('Favorito salvo com sucesso.', 'sucesso');
    carregarFavoritos();
  } catch (error) {
    mostrarMensagem(error.message, 'erro');
  }
}

async function carregarFavoritos() {
  try {
    const dados = await buscarJSON('/api/favoritos');
    favoritosAtuais = [];

    for (let i = 0; i < dados.length; i++) {
      favoritosAtuais.push(prepararImagem(dados[i]));
    }

    renderizarFavoritos();
    atualizarDashboard();
    atualizarBotaoFavorito();
  } catch (error) {
    galeriaFavoritos.innerHTML = '<div class="estado-vazio"><p>Não foi possível carregar os favoritos.</p></div>';
    mostrarMensagem(error.message, 'erro');
  }
}

function renderizarFavoritos() {
  if (favoritosAtuais.length === 0) {
    galeriaFavoritos.innerHTML = '<div class="estado-vazio"><p>Nenhum favorito salvo ainda.</p></div>';
    return;
  }

  let html = '';

  for (let i = 0; i < favoritosAtuais.length; i++) {
    const favorito = favoritosAtuais[i];
    let miniatura = '<div class="miniatura-video">Vídeo da NASA</div>';

    if (favorito.media_type === 'image') {
      miniatura = `<img src="${favorito.url}" alt="${limparTexto(favorito.titulo)}">`;
    }

    html += `
      <article class="cartao-favorito">
        <div class="area-miniatura-favorito">${miniatura}</div>
        <div class="conteudo-favorito">
          <h3>${limparTexto(favorito.titulo)}</h3>
          <p>${formatarData(favorito.data_imagem)}</p>
          <div class="acoes-favorito">
            <button type="button" class="botao botao-secundario" data-acao="detalhes" data-id="${favorito.id}">Ver detalhes</button>
            <button type="button" class="botao botao-perigo" data-acao="excluir" data-id="${favorito.id}">Excluir</button>
          </div>
        </div>
      </article>
    `;
  }

  galeriaFavoritos.innerHTML = html;
}

function atualizarDashboard() {
  let totalImagens = 0;
  let totalVideos = 0;

  for (let i = 0; i < favoritosAtuais.length; i++) {
    if (favoritosAtuais[i].media_type === 'video') {
      totalVideos++;
    } else {
      totalImagens++;
    }
  }

  document.getElementById('indicador-total-favoritos').textContent = favoritosAtuais.length;
  document.getElementById('indicador-total-imagens').textContent = totalImagens;
  document.getElementById('indicador-total-videos').textContent = totalVideos;
  document.getElementById('indicador-ultimo-favorito').textContent =
    favoritosAtuais.length > 0 ? favoritosAtuais[0].titulo : 'Nenhum';
}

function clicarNaGaleria(event) {
  if (event.target.tagName !== 'BUTTON') {
    return;
  }

  const acao = event.target.getAttribute('data-acao');
  const id = Number(event.target.getAttribute('data-id'));

  if (acao === 'detalhes') {
    abrirModal(buscarFavorito(id));
  }

  if (acao === 'excluir') {
    excluirFavorito(id);
  }
}

function abrirModal(favorito) {
  if (!favorito) {
    return;
  }

  let linkHD = '';

  if (favorito.hdurl) {
    linkHD = `<a class="botao botao-principal" href="${favorito.hdurl}" target="_blank">Abrir imagem em alta resolução</a>`;
  }

  conteudoModal.innerHTML = `
    <div class="conteudo-modal-interno">
      <div class="midia-modal">${montarMidia(favorito)}</div>
      <h2 id="titulo-modal-detalhes">${limparTexto(favorito.titulo)}</h2>
      <div class="linha-informacoes">
        <span class="etiqueta">${formatarData(favorito.data_imagem)}</span>
        <span class="etiqueta">${favorito.media_type === 'video' ? 'Vídeo' : 'Imagem'}</span>
      </div>
      <p class="texto-explicacao">${limparTexto(favorito.explicacao)}</p>
      <div class="acoes-principais">
        ${linkHD}
        <button type="button" class="botao botao-secundario" data-fechar-modal>Fechar</button>
      </div>
    </div>
  `;

  modalDetalhes.classList.add('aberta');
  modalDetalhes.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-aberto');
}

function fecharModal() {
  modalDetalhes.classList.remove('aberta');
  modalDetalhes.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-aberto');
}

async function excluirFavorito(id) {
  const confirmar = confirm('Deseja excluir este favorito?');

  if (!confirmar) {
    return;
  }

  try {
    await buscarJSON(`/api/favoritos/${id}`, { method: 'DELETE' });
    mostrarMensagem('Favorito excluído com sucesso.', 'sucesso');
    carregarFavoritos();
  } catch (error) {
    mostrarMensagem(error.message, 'erro');
  }
}

function mostrarMensagem(texto, tipo) {
  clearTimeout(tempoMensagem);

  let classeMensagem = 'mensagem-sistema mensagem-sucesso';

  if (tipo === 'erro') {
    classeMensagem = 'mensagem-sistema mensagem-erro';
  }

  areaMensagem.innerHTML = `<div class="${classeMensagem}">${limparTexto(texto)}</div>`;

  tempoMensagem = setTimeout(function () {
    areaMensagem.innerHTML = '';
  }, 4000);
}

function favoritoJaExiste(dataImagem) {
  for (let i = 0; i < favoritosAtuais.length; i++) {
    if (favoritosAtuais[i].data_imagem === dataImagem) {
      return true;
    }
  }

  return false;
}

function buscarFavorito(id) {
  for (let i = 0; i < favoritosAtuais.length; i++) {
    if (favoritosAtuais[i].id === id) {
      return favoritosAtuais[i];
    }
  }

  return null;
}

function atualizarBotaoFavorito() {
  const botao = document.getElementById('botao-salvar-favorito');

  if (!botao || !imagemAtual) {
    return;
  }

  if (favoritoJaExiste(imagemAtual.data_imagem)) {
    botao.disabled = true;
    botao.textContent = 'Já está nos favoritos';
  }
}
