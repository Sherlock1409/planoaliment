let usuarioAtual = null;
let dadosUsuarios = JSON.parse(localStorage.getItem("usuarios")) || {};

function loginUsuario() {
  const usuario = document.getElementById("usuarioInput").value.trim();
  const senha = document.getElementById("senhaInput").value.trim();

  if (!usuario || !senha) {
    return alert("Preencha o usuário e a senha.");
  }

  // Verifica se já existe o usuário
  if (!dadosUsuarios[usuario]) {
    // Criar novo usuário com senha
    dadosUsuarios[usuario] = {
      senha: senha,
      refeicoes: [],
      progresso: {},
      pesos: {}
    };
    console.log("Novo usuário criado:", usuario);
  } else {
    // Usuário existe, verifica a senha
    console.log("Usuário encontrado:", usuario);
    console.log("Senha informada:", senha);
    console.log("Senha salva:", dadosUsuarios[usuario].senha);

    if (dadosUsuarios[usuario].senha !== senha) {
      alert("Senha incorreta.");
      return;
    }
  }

  usuarioAtual = usuario;
  localStorage.setItem("usuarios", JSON.stringify(dadosUsuarios));

  document.getElementById("loginSection").style.display = "none";
  document.getElementById("app").style.display = "block";
  document.getElementById("usuarioNome").textContent = usuario;
  inicializarApp();
}



function logout() {
  usuarioAtual = null;
  document.getElementById("app").style.display = "none";
  document.getElementById("loginSection").style.display = "block";
}

function getUserData() {
  return dadosUsuarios[usuarioAtual];
}

function salvarDados() {
  localStorage.setItem("usuarios", JSON.stringify(dadosUsuarios));
}

// ---------------- PLANO ------------------

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

  refeicoes.forEach(refeicao => {
    const div = document.createElement("div");
    div.className = "refeicao";
    const h = refeicao.horario ? ` (${refeicao.horario})` : "";
    const titulo = document.createElement("h3");
    titulo.textContent = refeicao.nome + h;
    div.appendChild(titulo);

    refeicao.opcoes.forEach(opcao => {
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = opcao.calorias;
      checkbox.addEventListener("change", atualizarCalorias);
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(`${opcao.nome} (${opcao.calorias} kcal)`));
      div.appendChild(label);
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
    div.innerHTML = `<strong>${refeicao.nome}</strong> (${refeicao.horario || 'sem horário'})<br/>`;

    const inputNome = document.createElement("input");
    inputNome.placeholder = "Alimento";
    const inputCal = document.createElement("input");
    inputCal.placeholder = "Calorias";
    inputCal.type = "number";
    const btn = document.createElement("button");
    btn.textContent = "Adicionar alimento";
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

// ---------------- CALORIAS ------------------

function atualizarCalorias() {
  const checkboxes = document.querySelectorAll("input[type=checkbox]:checked");
  let total = 0;
  checkboxes.forEach(cb => total += parseInt(cb.value));
  document.getElementById("totalCalorias").textContent = `Calorias consumidas: ${total} kcal`;
  salvarProgresso(total);
}

// ---------------- PROGRESSO ------------------

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
        backgroundColor: "rgba(75,192,192,0.6)"
      }]
    }
  });
}

// ---------------- PESO ------------------

function mostrarPesos() {
  const container = document.getElementById("pesos");
  container.innerHTML = "";
  const pesos = getUserData().pesos;
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  meses.forEach(mes => {
    const input = document.createElement("input");
    input.type = "number";
    input.placeholder = `${mes} - kg`;
    input.value = pesos[mes] || "";
    input.onchange = () => {
      pesos[mes] = parseFloat(input.value);
      salvarDados();
      atualizarGraficoPeso();
    };
    container.appendChild(input);
  });
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
        borderColor: "rgba(255,99,132,0.8)",
        backgroundColor: "rgba(255,99,132,0.2)",
        fill: true,
        tension: 0.3
      }]
    }
  });
}

// ---------------- INICIALIZAR ------------------

function inicializarApp() {
  renderizarPlano();
  mostrarEdicao();
  mostrarPesos();
  atualizarGraficoConsumo();
  atualizarGraficoPeso();
}
