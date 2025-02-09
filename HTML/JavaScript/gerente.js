document.addEventListener("DOMContentLoaded", () => {
    carregarPerfil();
    carregarFuncionarios();
    carregarLogsAcesso();
    carregarAtividadesRecursos();
});

function carregarPerfil() {
    const nome = localStorage.getItem("nome");
    const email = localStorage.getItem("email");
    const cargo = localStorage.getItem("cargo");

    if (nome && email) {
        document.getElementById("nomeUsuario").textContent = nome;
        document.getElementById("emailUsuario").textContent = email;
        document.getElementById("cargoUsuario").textContent = cargo || "Cargo não disponível";
    } else {
        console.error("Dados do usuário não encontrados no localStorage");
    }
}

async function carregarUsuario() {
    try {
        const resposta = await fetch("http://localhost:5000/usuario_atual");
        const usuario = await resposta.json();

        document.getElementById("nomeUsuario").textContent = usuario.nome;
        document.getElementById("emailUsuario").textContent = usuario.email;
        document.getElementById("cargoUsuario").textContent = usuario.role;
    } catch (error) {
        console.error("Erro ao carregar usuário:", error);
    }
}
async function carregarFuncionarios() {
    try {
        const resposta = await fetch("http://localhost:5000/usuarios");
        const funcionarios = await resposta.json();
        
        const lista = document.getElementById("listaUsuarios");
        lista.innerHTML = "";

        funcionarios.forEach(func => {
            const li = document.createElement("li");
            li.innerHTML = `
                <input type="text" value="${func.nome}" id="nome-${func.id}">
                <input type="email" value="${func.email}" id="email-${func.id}">
                <input type="text" value="${func.role}" id="cargo-${func.id}">
                <button onclick="editarFuncionario(${func.id})">Salvar</button>
            `;
            lista.appendChild(li);
        });
    } catch (error) {
        console.error("Erro ao carregar funcionários:", error);
    }
}

document.getElementById("form-adicionar-usuario").addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const role = document.getElementById("role").value;

    const dados = { nome, email, senha, role };

    try {
        const resposta = await fetch("http://localhost:5000/usuarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.error || "Erro desconhecido");
        }

        alert("Usuário cadastrado com sucesso!");
        document.getElementById("form-adicionar-usuario").reset();

    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);
        alert(error.message);
    }
});



async function carregarLogsAcesso() {
    try {
        const resposta = await fetch("http://localhost:5000/logs_acesso");
        const logs = await resposta.json();

        const tabelaLogs = document.getElementById("tabelaLogs").getElementsByTagName('tbody')[0];
        tabelaLogs.innerHTML = "";

        logs.forEach(log => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${log.id}</td>
                <td>${log.nome_usuario}</td>
                <td>${log.tipo_acesso}</td>
                <td>${log.data_acesso}</td>
            `;
            tabelaLogs.appendChild(tr);
        });
    } catch (error) {
        console.error("Erro ao carregar logs de acesso:", error);
    }
}

async function carregarAtividadesRecursos() {
    try {
        const resposta = await fetch("http://localhost:5000/atividades_recursos");
        const atividades = await resposta.json();

        const tabelaAtividades = document.getElementById("tabelaAtividades").getElementsByTagName('tbody')[0];
        tabelaAtividades.innerHTML = "";

        atividades.forEach(atividade => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${atividade.id}</td>
                <td>${atividade.recurso}</td>
                <td>${atividade.tipo_atividade}</td>
                <td>${atividade.data_atividade}</td>
            `;
            tabelaAtividades.appendChild(tr);
        });
    } catch (error) {
        console.error("Erro ao carregar atividades de recursos:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const nomeUsuario = localStorage.getItem('usuarioNome');
    const emailUsuario = localStorage.getItem('usuarioEmail');
    const cargoUsuario = localStorage.getItem('usuarioRole');

    console.log('Dados no localStorage:', nomeUsuario, emailUsuario, cargoUsuario);
    if (nomeUsuario && emailUsuario && cargoUsuario) {
        document.getElementById('nomeUsuario').textContent = nomeUsuario;
        document.getElementById('emailUsuario').textContent = emailUsuario;
        document.getElementById('cargoUsuario').textContent = cargoUsuario;
    } else {
        document.getElementById('nomeUsuario').textContent = 'Não encontrado';
        document.getElementById('emailUsuario').textContent = 'Não encontrado';
        document.getElementById('cargoUsuario').textContent = 'Não encontrado';
    }
});
