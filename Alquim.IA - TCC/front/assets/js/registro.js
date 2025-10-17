document.getElementById("formRegistro").addEventListener("submit", async function (e) {
  e.preventDefault();

  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  const confirmar = document.getElementById("confirmar").value;

  if (senha !== confirmar) {
    alert("As senhas não coincidem!");
    return;
  }

  try {
    const resposta = await fetch("http://127.0.0.1:5000/registrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, senha }),
      credentials: 'include'
    });

    const resultado = await resposta.json();

    if (resposta.ok) {
      alert("Usuário registrado com sucesso! Faça seu login.");
      window.location.href = "login.html";
    } else {
      alert(resultado.erro || "Erro ao registrar usuário."); 
    }
  } catch (erro) {
    alert("Erro de conexão com o servidor!");
    console.error(erro);
  }
});