let usuarioAtual = null;
let dadosUsuarios = JSON.parse(localStorage.getItem("usuarios")) || {};
let modoEdicaoAtivo = false;

function loginUsuario() {
  const nome = document.getElementById("usuarioInput").value.trim();
  if (!nome) return alert("Digite um nome válido.");

  if (!dadosUsuarios[nome]) {
    dadosUsuarios[nome] = {
      refeicoes: [],
      progresso: {},
      pesos: {},
      marcados: {}
    };
  }

  usuarioAtual = nome;
  localStorage.setItem("usuarios", JSON.stringify(dadosUsuarios));
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("app").style.display = "block";
  document.getElementById("usuarioNome").textContent = nome;
  inicializarApp();
}

function logout() {
  usuarioAtual = null;
  modoEdicaoAtivo = false;
  document.getElementById("app").style.display = "none";
  document.getElementById("loginSection").style.display = "block";
  const btnEditar = document.getElementById("btnAlternarEdicao");
  if (btnEditar) btnEditar.textContent = "Editar Refeição";
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

function alternarModoEdicao() {
  modoEdicaoAtivo = !modoEdicaoAtivo;
  renderizarPlano();
  mostrarEdicao();
  const btnEditar = document.getElementById("btnAlternarEdicao");
  if (btnEditar) {
    btnEditar.textContent = modoEdicaoAtivo ? "Sair do modo edição" : "Editar Refeição";
  }
}

document.getElementById("btnAlternarEdicao").onclick = alternarModoEdicao;

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

    div.appendChild(titulo);

    if (modoEdicaoAtivo) {
      const btnExcluir = document.createElement("button");
      btnExcluir.textContent = "Excluir Refeição";
      btnExcluir.className = "btn logout";
      btnExcluir.onclick = () => {
        refeicoes.splice(i, 1);
        salvarDados();
        renderizarPlano();
        mostrarEdicao();
      };
      div.appendChild(btnExcluir);
    }

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

      div.appendChild(label);

      if (modoEdicaoAtivo) {
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
        div.appendChild(btnExcluirOpcao);
      }

      div.appendChild(document.createElement("br"));
    });

    container.appendChild(div);
  });

  atualizarCalorias();
}

function atualizarCalorias() {
  const refeicoes = getUserData().refeicoes;
  const marcados = getUserData().marcados || {};
  let total = 0;

  refeicoes.forEach((refeicao, i) => {
    refeicao.opcoes.forEach((opcao, j) => {
      const hoje = new Date().toISOString().split("T")[0];
      const key = `${i}-${j}-${hoje}`;
      if (marcados[key]) total += Number(opcao.calorias);
    });
  });

  document.getElementById("totalCalorias").textContent = `Calorias consumidas: ${total} kcal`;
}

function mostrarEdicao() {
  const container = document.getElementById("editarRefeicoes");
  container.innerHTML = "";
  const refeicoes = getUserData().refeicoes;

  refeicoes.forEach((refeicao, i) => {
    const div = document.createElement("div");
    div.className = "refeicao";

    const labelNome = document.createElement("label");
    labelNome.textContent = "Nome: ";
    const inputNome = document.createElement("input");
    inputNome.type = "text";
    inputNome.value = refeicao.nome;
    inputNome.onchange = () => {
      refeicao.nome = inputNome.value;
      salvarDados();
      renderizarPlano();
    };
    labelNome.appendChild(inputNome);
    div.appendChild(labelNome);

    const labelHorario = document.createElement("label");
    labelHorario.textContent = " Horário: ";
    const inputHorario = document.createElement("input");
    inputHorario.type = "time";
    inputHorario.value = refeicao.horario;
    inputHorario.onchange = () => {
      refeicao.horario = inputHorario.value;
      salvarDados();
      renderizarPlano();
    };
    labelHorario.appendChild(inputHorario);
    div.appendChild(labelHorario);

    const opcoesDiv = document.createElement("div");
    opcoesDiv.style.marginTop = "10px";

    refeicao.opcoes.forEach((opcao, j) => {
      const opDiv = document.createElement("div");

      const nomeInput = document.createElement("input");
      nomeInput.type = "text";
      nomeInput.value = opcao.nome;
      nomeInput.placeholder = "Nome do alimento";
      nomeInput.onchange = () => {
        opcao.nome = nomeInput.value;
        salvarDados();
        renderizarPlano();
      };
      opDiv.appendChild(nomeInput);

      const calInput = document.createElement("input");
      calInput.type = "number";
      calInput.value = opcao.calorias;
      calInput.placeholder = "Calorias";
      calInput.style.width = "80px";
      calInput.onchange = () => {
        opcao.calorias = Number(calInput.value);
        salvarDados();
        renderizarPlano();
      };
      opDiv.appendChild(calInput);

      const btnExcluir = document.createElement("button");
      btnExcluir.textContent = "Excluir";
      btnExcluir.className = "btn logout";
      btnExcluir.style.marginLeft = "10px";
      btnExcluir.onclick = () => {
        refeicao.opcoes.splice(j, 1);
        salvarDados();
        renderizarPlano();
        mostrarEdicao();
      };
      opDiv.appendChild(btnExcluir);

      opcoesDiv.appendChild(opDiv);
    });

    const btnAddOpcao = document.createElement("button");
    btnAddOpcao.textContent = "Adicionar Alimento";
    btnAddOpcao.className = "btn";
    btnAddOpcao.onclick = () => {
      refeicao.opcoes.push({ nome: "", calorias: 0 });
      salvarDados();
      renderizarPlano();
      mostrarEdicao();
    };
    opcoesDiv.appendChild(btnAddOpcao);

    div.appendChild(opcoesDiv);
    container.appendChild(div);
  });
}

function inicializarApp() {
  renderizarPlano();
  mostrarEdicao();
  atualizarCalorias();
}

function criarUsuario() {
  const nome = document.getElementById("novoUsuarioInput").value.trim();
  const senha = document.getElementById("novaSenhaInput").value.trim();
  if (!nome || !senha) return alert("Preencha nome e senha.");
  if (dadosUsuarios[nome]) return alert("Usuário já existe.");

  dadosUsuarios[nome] = {
    senha,
    refeicoes: [],
    progresso: {},
    pesos: {},
    marcados: {}
  };
  localStorage.setItem("usuarios", JSON.stringify(dadosUsuarios));
  alert("Usuário criado. Faça login.");
}

// Event listener para botão entrar ao carregar a página
window.onload = () => {
  document.getElementById("btnAlternarEdicao").onclick = alternarModoEdicao;
};
