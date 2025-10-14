document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("formLogin");

  formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    const resposta = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, senha }),
    });

    const dados = await resposta.json();

    if (dados.sucesso) {
      alert("Login realizado com sucesso!");
      window.location.href = "/lab"; // Redireciona para o laboratório
    } else {
      alert(dados.mensagem || "Erro ao realizar login.");
    }
  });
});
