let usuarioAtual = null;
let dadosUsuarios = JSON.parse(localStorage.getItem("usuarios")) || {};

// Função para login - agora verifica usuário e senha
function loginUsuario() {
  const nome = document.getElementById("usuarioInput").value.trim();
  const senha = document.getElementById("senhaInput").value;

  if (!nome || !senha) {
    return alert("Por favor, preencha usuário e senha.");
  }

  if (!dadosUsuarios[nome]) {
    return alert("Usuário não encontrado. Crie uma conta.");
  }

  if (dadosUsuarios[nome].senha !== senha) {
    return alert("Senha incorreta.");
  }

  usuarioAtual = nome;
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("app").style.display = "block";
  document.getElementById("usuarioNome").textContent = nome;
  inicializarApp();
}

function criarUsuario() {
  const novoNome = document.getElementById("novoUsuarioInput").value.trim();
  const novaSenha = document.getElementById("novaSenhaInput").value;

  if (!novoNome || !novaSenha) {
    return alert("Preencha nome e senha para criar usuário.");
  }

  if (dadosUsuarios[novoNome]) {
    return alert("Usuário já existe. Escolha outro nome.");
  }

  dadosUsuarios[novoNome] = {
    senha: novaSenha,
    refeicoes: [],
    progresso: {},
    pesos: {},
    marcados: {}
  };

  localStorage.setItem("usuarios", JSON.stringify(dadosUsuarios));
  alert("Usuário criado com sucesso! Agora faça login.");

  document.getElementById("novoUsuarioInput").value = "";
  document.getElementById("novaSenhaInput").value = "";
}

function logout() {
  usuarioAtual = null;
  document.getElementById("app").style.display = "none";
  document.getElementById("loginSection").style.display = "block";

  document.getElementById("usuarioInput").value = "";
  document.getElementById("senhaInput").value = "";
}

function getUserData() {
  return dadosUsuarios[usuarioAtual];
}

function salvarDados() {
  localStorage.setItem("usuarios", JSON.stringify(dadosUsuarios));
}

function adicionarRefeicao() {
  const nome = document.getElementById("novaRefeicao").value.trim();
  const horario = document.getElementById("horarioRefeicao").value;
  if (!nome) return alert("Informe o nome da refeição.");

  getUserData().refeicoes.push({ nome, horario, opcoes: [] });
  salvarDados();
  document.getElementById("novaRefeicao").value = "";
  document.getElementById("horarioRefeicao").value = "";
  renderizarPlano();
  mostrarEdicao();
}

function renderizarPlano() {
  const container = document.getElementById("refeicoes");
  container.innerHTML = "";
  const refeicoes = getUserData().refeicoes;
  const marcados = getUserData().marcados || {};

  refeicoes.forEach((refeicao, i) => {
    const div = document.createElement("div");
    div.className = "refeicao";
    const h = refeicao.horario ? ` (${refeicao.horario})` : "";
    const titulo = document.createElement("h3");
    titulo.textContent = refeicao.nome + h;

    const btnExcluir = document.createElement("button");
    btnExcluir.textContent = "Excluir Refeição";
    btnExcluir.className = "btn logout";
    btnExcluir.onclick = () => {
      refeicoes.splice(i, 1);
      salvarDados();
      renderizarPlano();
      mostrarEdicao();
    };

    div.appendChild(titulo);
    div.appendChild(btnExcluir);

    refeicao.opcoes.forEach((opcao, j) => {
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = opcao.calorias;

      const hoje = new Date().toISOString().split("T")[0];
      const key = `${i}-${j}-${hoje}`;
      checkbox.checked = marcados[key] || false;

      checkbox.addEventListener("change", () => {
        marcados[key] = checkbox.checked;
        getUserData().marcados = marcados;
        salvarDados();
        atualizarCalorias();
      });

      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(` ${opcao.nome} (${opcao.calorias} kcal)`));

      const btnExcluirOpcao = document.createElement("button");
      btnExcluirOpcao.textContent = "X";
      btnExcluirOpcao.className = "btn logout";
      btnExcluirOpcao.style.marginLeft = "10px";
      btnExcluirOpcao.onclick = () => {
        refeicao.opcoes.splice(j, 1);
        salvarDados();
        renderizarPlano();
        mostrarEdicao();
      };

      div.appendChild(label);
      div.appendChild(btnExcluirOpcao);
      div.appendChild(document.createElement("br"));
    });

    container.appendChild(div);
  });

  atualizarCalorias();
}

function mostrarEdicao() {
  const area = document.getElementById("editarRefeicoes");
  area.innerHTML = "";
  const refeicoes = getUserData().refeicoes;

  refeicoes.forEach((refeicao, i) => {
    const div = document.createElement("div");
    div.className = "refeicao";

    const titulo = document.createElement("h3");
    titulo.innerHTML = `<strong>${refeicao.nome}</strong> (${refeicao.horario || 'sem horário'})`;
    div.appendChild(titulo);

    const inputNome = document.createElement("input");
    inputNome.placeholder = "Alimento";
    inputNome.className = "input-field";
    const inputCal = document.createElement("input");
    inputCal.placeholder = "Calorias";
    inputCal.type = "number";
    inputCal.className = "input-field";
    const btn = document.createElement("button");
    btn.textContent = "Adicionar alimento";
    btn.className = "btn";

    btn.onclick = () => {
      if (inputNome.value && inputCal.value) {
        refeicao.opcoes.push({
          nome: inputNome.value,
          calorias: parseInt(inputCal.value)
        });
        inputNome.value = "";
        inputCal.value = "";
        salvarDados();
        renderizarPlano();
        mostrarEdicao();
      }
    };

    div.appendChild(inputNome);
    div.appendChild(inputCal);
    div.appendChild(btn);
    area.appendChild(div);
  });
}

function salvarPlano() {
  salvarDados();
  alert("Plano salvo!");
}

function atualizarCalorias() {
  const marcados = getUserData().marcados || {};
  const hoje = new Date().toISOString().split("T")[0];
  let total = 0;

  Object.keys(marcados).forEach(key => {
    if (key.endsWith(hoje) && marcados[key]) {
      const parts = key.split("-");
      const i = parseInt(parts[0]);
      const j = parseInt(parts[1]);
      const refeicao = getUserData().refeicoes[i];
      if (refeicao && refeicao.opcoes[j]) {
        total += refeicao.opcoes[j].calorias;
      }
    }
  });

  document.getElementById("totalCalorias").textContent = `Calorias consumidas: ${total} kcal`;
  salvarProgresso(total);
}

function salvarProgresso(calorias) {
  const hoje = new Date().toISOString().split("T")[0];
  getUserData().progresso[hoje] = calorias;
  salvarDados();
  atualizarGraficoConsumo();
}

function atualizarGraficoConsumo() {
  const progresso = getUserData().progresso;
  const dias = Object.keys(progresso);
  const valores = Object.values(progresso);
  const ctx = document.getElementById("graficoConsumo").getContext("2d");
  if (window.graficoCalorias) window.graficoCalorias.destroy();
  window.graficoCalorias = new Chart(ctx, {
    type: "bar",
    data: {
      labels: dias,
      datasets: [{
        label: "Calorias por dia",
        data: valores,
        backgroundColor: "rgba(46, 125, 50, 0.7)" // verde
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function mostrarPesos() {
  const container = document.getElementById("pesos");
  container.innerHTML = "";
  const pesos = getUserData().pesos;
  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  meses.forEach(mes => {
    const input = document.createElement("input");
    input.type = "number";
    input.placeholder = `${mes} - kg`;
    input.value = pesos[mes] || "";
    input.className = "input-field";
    input.onchange = () => {
      pesos[mes] = parseFloat(input.value);
      salvarDados();
      atualizarGraficoPeso();
    };
    container.appendChild(input);
  });
  atualizarGraficoPeso();
}

function atualizarGraficoPeso() {
  const pesos = getUserData().pesos;
  const meses = Object.keys(pesos);
  const valores = Object.values(pesos);
  const ctx = document.getElementById("graficoPeso").getContext("2d");
  if (window.graficoPeso) window.graficoPeso.destroy();
  window.graficoPeso = new Chart(ctx, {
    type: "line",
    data: {
      labels: meses,
      datasets: [{
        label: "Peso (kg)",
        data: valores,
        fill: false,
        borderColor: "rgba(46, 125, 50, 0.8)",
        tension: 0.2
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: false }
      }
    }
  });
}

function inicializarApp() {
  renderizarPlano();
  mostrarEdicao();
  mostrarPesos();
  atualizarGraficoConsumo();
  atualizarGraficoPeso();
}

// Inicialização - esconde app e mostra login
document.getElementById("app").style.display = "none";
document.getElementById("loginSection").style.display = "block";

// Botões
document.querySelector(".entrar").onclick = loginUsuario;
document.getElementById("criarUsuarioBtn").onclick = criarUsuario;
document.getElementById("logoutBtn").onclick = logout;
document.getElementById("adicionarRefeicaoBtn").onclick = adicionarRefeicao;
document.getElementById("salvarPlanoBtn").onclick = salvarPlano;
