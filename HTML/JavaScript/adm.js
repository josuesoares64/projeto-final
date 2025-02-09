document.addEventListener("DOMContentLoaded", async function () {
    const cargo = localStorage.getItem("cargo");
    const nome = localStorage.getItem("nome");
    const email = localStorage.getItem("email");

    document.getElementById("nomeUsuario").textContent = nome;
    document.getElementById("emailUsuario").textContent = email;
    document.getElementById("cargoUsuario").textContent = cargo;

    console.log("Cargo do usuário:", cargo);
    console.log("Nome do usuário:", nome);
    console.log("Email do usuário:", email);

    try {
        const response = await fetch("http://127.0.0.1:5000/recursos");
        if (!response.ok) throw new Error("Erro ao buscar recursos");

        const recursos = await response.json();
        const listaEquipamentos = document.getElementById("listaEquipamentos");
        listaEquipamentos.innerHTML = recursos.length === 0 ? "<p>Nenhum recurso encontrado.</p>" : "";

        recursos.forEach(recurso => {
            const item = document.createElement("div");
            item.classList.add("recurso-item");
            item.innerHTML = `
                <h3>Nome: ${recurso.nome}</h3>
                <p>Descrição: ${recurso.descricao}</p>
                <p>Status: <span id="status-${recurso.id}">${recurso.status}</span></p>
                <button class="editar-status" data-id="${recurso.id}">Editar Status</button>
                <div id="editar-${recurso.id}" class="editar-container" style="display: none;">
                    <select id="select-${recurso.id}">
                        <option value="disponivel" ${recurso.status === "disponivel" ? "selected" : ""}>Disponível</option>
                        <option value="em uso" ${recurso.status === "em uso" ? "selected" : ""}>Em uso</option>
                        <option value="manutencao" ${recurso.status === "manutencao" ? "selected" : ""}>Manutenção</option>
                    </select>
                    <button class="salvar-status" data-id="${recurso.id}">Salvar</button>
                </div>
                <hr>
            `;
            listaEquipamentos.appendChild(item);
        });
        document.querySelectorAll(".editar-status").forEach(button => {
            button.addEventListener("click", function () {
                const recursoId = this.getAttribute("data-id");
                const editarContainer = document.getElementById(`editar-${recursoId}`);
                editarContainer.style.display = editarContainer.style.display === "none" ? "block" : "none";
            });
        });
        document.querySelectorAll(".salvar-status").forEach(button => {
            button.addEventListener("click", async function () {
                const recursoId = this.getAttribute("data-id");
                const select = document.getElementById(`select-${recursoId}`);
                const novoStatus = select.value;
                console.log(`Botão de salvar clicado! Recurso ID: ${recursoId}, Novo Status: ${novoStatus}`);

                try {
                    const updateResponse = await fetch(`http://127.0.0.1:5000/recursos/${recursoId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: novoStatus })
                    });

                    if (!updateResponse.ok) {
                        alert("Erro ao atualizar status.");
                        return;
                    }

                    alert("Status atualizado com sucesso!");
                    document.getElementById(`status-${recursoId}`).textContent = novoStatus;
                    document.getElementById(`editar-${recursoId}`).style.display = "none";
                } catch (error) {
                    alert("Erro ao atualizar status.");
                    console.error(error);
                }
            });
        });

    } catch (error) {
        console.error("Erro ao carregar recursos:", error);
    }
});

