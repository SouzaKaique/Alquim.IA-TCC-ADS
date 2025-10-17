document.getElementById("formLogin").addEventListener("submit", async function (e) {
  e.preventDefault();

  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;

  try {
    const resposta = await fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, senha }),
      credentials: 'include'
    });

    const resultado = await resposta.json();

    if (resposta.ok) {
      alert("Login realizado com sucesso! Bem-vindo(a) " + resultado.usuario + "!");
      window.location.href = "lab.html"; 
    } else {
      alert(resultado.erro || "Usuário ou senha incorretos!"); 
    }
  } catch (erro) {
    alert("Erro de conexão com o servidor!");
    console.error(erro);
  }
});