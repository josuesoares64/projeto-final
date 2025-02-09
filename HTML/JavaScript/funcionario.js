document.addEventListener("DOMContentLoaded", async function () {
    const nome = localStorage.getItem("nome");
    const email = localStorage.getItem("email");
    const cargo = localStorage.getItem("cargo");

    console.log("Dados recuperados:", { nome, email, cargo });

    if (nome && email && cargo) {
        document.getElementById("nomeUsuario").textContent = nome;
        document.getElementById("emailUsuario").textContent = email;
        document.getElementById("cargoUsuario").textContent = cargo;
    } else {
        alert("Por favor, faça login primeiro.");
        window.location.href = "login.html";
        return;
    }
    try {
        const response = await fetch("http://127.0.0.1:5000/recursos");

        if (!response.ok) {
            throw new Error("Erro ao buscar veículos: " + response.statusText);
        }

        const veiculos = await response.json();
        console.log("Veículos encontrados:", veiculos);

        const listaVeiculos = document.getElementById("veiculos");
        listaVeiculos.innerHTML = "";

        if (veiculos.length === 0) {
            listaVeiculos.innerHTML = "<p>Nenhum veículo encontrado.</p>";
        } else {
            veiculos.forEach(veiculo => {
                const item = document.createElement("div");
                item.innerHTML = `
                    <h2>Modelo: ${veiculo.nome}</h2>
                    <p>Descrição: ${veiculo.descricao}</p>
                    <p>Status: ${veiculo.status}</p>
                    <hr>
                `;
                listaVeiculos.appendChild(item);
            });
        }

    } catch (error) {
        console.error("Erro ao obter os veículos:", error);
        document.getElementById("veiculos").innerHTML = "<p>Erro ao carregar os veículos.</p>";
    }
});

document.addEventListener('DOMContentLoaded', () => {
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
