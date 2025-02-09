document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("login-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        const nome = document.getElementById("nome")?.value.trim();
        const email = document.getElementById("email")?.value.trim();
        const senha = document.getElementById("senha")?.value.trim();
        if (!nome || !email || !senha) {
            console.error("Os campos do formulário não foram encontrados ou estão vazios!");
            alert("Preencha todos os campos!");
            return;
        }

        console.log("🔍 Dados para envio:", { nome, email, senha }); 
        const dadosLogin = { nome, email, senha };

        try {
            const response = await fetch("http://127.0.0.1:5000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dadosLogin)
            });

            const data = await response.json();
            console.log("📩 Resposta da API:", data);

            if (response.ok) {
                localStorage.setItem("usuarioNome", data.nome);
                localStorage.setItem("usuarioEmail", data.email);
                localStorage.setItem("usuarioRole", data.role);

                if (data.role === "funcionario") {
                    window.location.href = "funcionario.html";
                } else if (data.role === "gerente") {
                    window.location.href = "gerente.html";
                } else if (data.role === "administrador") {
                    window.location.href = "adm.html";
                }
            } else {
                alert(`Erro ao realizar login: ${data.error || "Erro desconhecido"}`);
            }
        } catch (error) {
            console.error("🚨 Erro na requisição:", error);
            alert("Erro ao tentar fazer login. Verifique se o servidor está rodando.");
        }
    });
});
