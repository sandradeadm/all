// js/ui.js

function togglePassword() {
    const passwordInput = document.getElementById("password");
    const toggleButton = document.querySelector(".toggle-password");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleButton.textContent = "Ocultar";
    } else {
        passwordInput.type = "password";
        toggleButton.textContent = "Mostrar";
    }
}

function cargarVista(pagina) {
  const iframe = document.getElementById("contenido");

  // Si ya tiene clase de animación, la quitamos
  iframe.classList.remove("fade");
  iframe.classList.add("fade-out");

  // Esperamos que termine el fade-out
  setTimeout(() => {
    iframe.src = `views/${pagina}`;
    iframe.classList.remove("fade-out");
    
    // Volvemos a hacer el fade-in
    iframe.classList.add("fade");
  }, 200); // debe coincidir con la duración de fadeOut en CSS
}



document.getElementById("menu-toggle").addEventListener("DOMContentLoaded", function () {
    document.getElementById("nav-menu").classList.toggle("active");
});

// Alternativa del toggle para otra parte del menú (por si se usa en otro contexto)
const btn = document.getElementById('menu-toggle');
const nav = document.querySelector('header nav');

btn.addEventListener('click', () => {
    nav.classList.toggle('show');
});

const iframe = document.getElementById("contenido");

iframe.addEventListener("load", () => {
    iframe.classList.remove("fade");

    void iframe.offsetWidth;

    iframe.classList.add("fade")
})