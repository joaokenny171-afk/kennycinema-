const chave = {
  filmes: "cineplay_filmes",
  clientes: "cineplay_clientes",
  locacoes: "cineplay_locacoes",
  contatos: "cineplay_contatos"
};

function obter(chaveLocal) {
  return JSON.parse(localStorage.getItem(chaveLocal) || "[]");
}

function salvar(chaveLocal, dados) {
  localStorage.setItem(chaveLocal, JSON.stringify(dados));
}

function escapar(texto) {
  return String(texto).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function aplicarMascaraCPF(input) {
  input.addEventListener("input", () => {
    let v = input.value.replace(/\D/g, "").slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    input.value = v;
  });
}

function aplicarMascaraTelefone(input) {
  input.addEventListener("input", () => {
    let v = input.value.replace(/\D/g, "").slice(0, 11);
    if (v.length <= 10) {
      v = v.replace(/(\d{2})(\d)/, "($1) $2");
      v = v.replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      v = v.replace(/(\d{2})(\d)/, "($1) $2");
      v = v.replace(/(\d{5})(\d)/, "$1-$2");
    }
    input.value = v;
  });
}

function cpfValido(cpf) {
  const n = cpf.replace(/\D/g, "");
  if (n.length !== 11 || /^(\d)\1+$/.test(n)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(n[i]) * (10 - i);
  let d1 = 11 - (soma % 11);
  if (d1 >= 10) d1 = 0;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(n[i]) * (11 - i);
  let d2 = 11 - (soma % 11);
  if (d2 >= 10) d2 = 0;
  return Number(n[9]) === d1 && Number(n[10]) === d2;
}

function mostrarFilmes() {
  const area = document.getElementById("listaFilmes");
  if (!area) return;
  const filmes = obter(chave.filmes);
  if (!filmes.length) {
    area.innerHTML = '<div class="vazio">Nenhum filme cadastrado ainda.</div>';
    return;
  }
  area.innerHTML = filmes.map(f => `
    <article class="filme-card">
      <div class="poster">🎬</div>
      <h3>${escapar(f.titulo)}</h3>
      <p>${escapar(f.genero)} • ${f.ano} • ${escapar(f.classificacao)}</p>
      <div class="filme-meta"><span>R$ ${f.valor.toFixed(2)}</span><span>${f.duracao} min</span></div>
      <div class="acoes">
        <button class="btn-mini excluir" onclick="excluirFilme(${f.id})">Excluir</button>
      </div>
    </article>`).join("");
}

function excluirFilme(id) {
  if (!confirm("Deseja excluir este filme?")) return;
  salvar(chave.filmes, obter(chave.filmes).filter(f => f.id !== id));
  mostrarFilmes();
  carregarSelects();
}

function mostrarClientes() {
  const area = document.getElementById("listaClientes");
  if (!area) return;
  const clientes = obter(chave.clientes);
  if (!clientes.length) {
    area.innerHTML = '<div class="vazio">Nenhum cliente cadastrado ainda.</div>';
    return;
  }
  area.innerHTML = `<table><thead><tr><th>Nome</th><th>CPF</th><th>Telefone</th><th>E-mail</th><th>Ação</th></tr></thead><tbody>
    ${clientes.map(c => `<tr><td>${escapar(c.nome)}</td><td>${escapar(c.cpf)}</td><td>${escapar(c.telefone)}</td><td>${escapar(c.email)}</td><td><button class="btn-mini excluir" onclick="excluirCliente(${c.id})">Excluir</button></td></tr>`).join("")}
  </tbody></table>`;
}

function excluirCliente(id) {
  if (!confirm("Deseja excluir este cliente?")) return;
  salvar(chave.clientes, obter(chave.clientes).filter(c => c.id !== id));
  mostrarClientes();
  carregarSelects();
}

function carregarSelects() {
  const cliente = document.getElementById("clienteLocacao");
  const filme = document.getElementById("filmeLocacao");
  if (!cliente || !filme) return;
  const clientes = obter(chave.clientes);
  const filmes = obter(chave.filmes).filter(f => f.disponivel);
  cliente.innerHTML = '<option value="">Selecionar cliente</option>' + clientes.map(c => `<option value="${c.id}">${escapar(c.nome)}</option>`).join("");
  filme.innerHTML = '<option value="">Selecionar filme</option>' + filmes.map(f => `<option value="${f.id}">${escapar(f.titulo)} - R$ ${f.valor.toFixed(2)}</option>`).join("");
}

function mostrarLocacoes() {
  const area = document.getElementById("listaLocacoes");
  if (!area) return;
  const locacoes = obter(chave.locacoes);
  const clientes = obter(chave.clientes);
  const filmes = obter(chave.filmes);
  if (!locacoes.length) {
    area.innerHTML = '<div class="vazio">Nenhuma locação registrada ainda.</div>';
    return;
  }
  area.innerHTML = `<table><thead><tr><th>Cliente</th><th>Filme</th><th>Data</th><th>Prazo</th><th>Status</th><th>Ação</th></tr></thead><tbody>
  ${locacoes.map(l => {
    const c = clientes.find(x => x.id === l.clienteId);
    const f = filmes.find(x => x.id === l.filmeId);
    return `<tr><td>${escapar(c ? c.nome : "Cliente removido")}</td><td>${escapar(f ? f.titulo : "Filme removido")}</td><td>${l.data}</td><td>${l.prazo} dias</td><td>${l.status}</td><td><button class="btn-mini excluir" onclick="finalizarLocacao(${l.id})">Finalizar</button></td></tr>`;
  }).join("")}</tbody></table>`;
}

function finalizarLocacao(id) {
  const locacoes = obter(chave.locacoes);
  const locacao = locacoes.find(l => l.id === id);
  if (!locacao) return;
  locacao.status = "Finalizada";
  salvar(chave.locacoes, locacoes);
  const filmes = obter(chave.filmes);
  const filme = filmes.find(f => f.id === locacao.filmeId);
  if (filme) filme.disponivel = true;
  salvar(chave.filmes, filmes);
  mostrarLocacoes();
  carregarSelects();
}

document.addEventListener("DOMContentLoaded", () => {
  mostrarFilmes();
  mostrarClientes();
  mostrarLocacoes();
  carregarSelects();

  const cpf = document.getElementById("cpf");
  const telefone = document.getElementById("telefone");
  if (cpf) aplicarMascaraCPF(cpf);
  if (telefone) aplicarMascaraTelefone(telefone);

  const formFilme = document.getElementById("formFilme");
  if (formFilme) {
    formFilme.addEventListener("submit", e => {
      e.preventDefault();
      const filme = new Filme(
        titulo.value, genero.value, ano.value, classificacao.value, valor.value, duracao.value
      );
      const filmes = obter(chave.filmes);
      filmes.push(filme);
      salvar(chave.filmes, filmes);
      formFilme.reset();
      mostrarFilmes();
      alert("Filme cadastrado com sucesso!");
    });
  }

  const formCliente = document.getElementById("formCliente");
  if (formCliente) {
    formCliente.addEventListener("submit", e => {
      e.preventDefault();
      if (!cpfValido(cpf.value)) {
        alert("Digite um CPF válido.");
        cpf.focus();
        return;
      }
      const clientes = obter(chave.clientes);
      if (clientes.some(c => c.cpf === cpf.value)) {
        alert("Este CPF já está cadastrado.");
        return;
      }
      clientes.push(new Cliente(nome.value, cpf.value, telefone.value, email.value));
      salvar(chave.clientes, clientes);
      formCliente.reset();
      mostrarClientes();
      alert("Cliente cadastrado com sucesso!");
    });
  }

  const formLocacao = document.getElementById("formLocacao");
  if (formLocacao) {
    const hoje = new Date().toISOString().split("T")[0];
    document.getElementById("dataLocacao").value = hoje;
    formLocacao.addEventListener("submit", e => {
      e.preventDefault();
      const filmeId = Number(filmeLocacao.value);
      const locacoes = obter(chave.locacoes);
      locacoes.push(new Locacao(clienteLocacao.value, filmeId, dataLocacao.value, prazo.value));
      salvar(chave.locacoes, locacoes);
      const filmes = obter(chave.filmes);
      const filme = filmes.find(f => f.id === filmeId);
      if (filme) filme.disponivel = false;
      salvar(chave.filmes, filmes);
      formLocacao.reset();
      document.getElementById("dataLocacao").value = hoje;
      mostrarLocacoes();
      carregarSelects();
      alert("Locação realizada com sucesso!");
    });
  }

  const formContato = document.getElementById("formContato");
  if (formContato) {
    formContato.addEventListener("submit", e => {
      e.preventDefault();
      const contatos = obter(chave.contatos);
      contatos.push(new Contato(contatoNome.value, contatoEmail.value, mensagem.value));
      salvar(chave.contatos, contatos);
      formContato.reset();
      alert("Mensagem enviada com sucesso!");
    });
  }
});