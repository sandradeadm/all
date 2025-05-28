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
    document.getElementById("contenido").src = `views/${pagina}`;
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
