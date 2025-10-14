document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("formRegistro");

  formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    const resposta = await fetch("/api/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, email, senha }),
    });

    const dados = await resposta.json();

    if (dados.sucesso) {
      alert("Conta criada com sucesso!");
      window.location.href = "/login";
    } else {
      alert(dados.mensagem || "Erro ao registrar usuário.");
    }
  });
});
