class Filme {
  constructor(titulo, genero, ano, classificacao, valor, duracao) {
    this.id = Date.now();
    this.titulo = titulo;
    this.genero = genero;
    this.ano = ano;
    this.classificacao = classificacao;
    this.valor = Number(valor);
    this.duracao = Number(duracao);
    this.disponivel = true;
  }
}

class Cliente {
  constructor(nome, cpf, telefone, email) {
    this.id = Date.now();
    this.nome = nome;
    this.cpf = cpf;
    this.telefone = telefone;
    this.email = email;
  }
}

class Locacao {
  constructor(clienteId, filmeId, data, prazo) {
    this.id = Date.now();
    this.clienteId = Number(clienteId);
    this.filmeId = Number(filmeId);
    this.data = data;
    this.prazo = Number(prazo);
    this.status = "Ativa";
  }
}

class Contato {
  constructor(nome, email, mensagem) {
    this.id = Date.now();
    this.nome = nome;
    this.email = email;
    this.mensagem = mensagem;
  }
}