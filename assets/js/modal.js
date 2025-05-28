// Función para abrir el modal
function mostrarModal() {
    const modal = document.getElementById("modalAlumno");
    modal.style.display = "block";
}

// Función para cerrar el modal
function cerrarModal() {
    const modal = document.getElementById("modalAlumno");
    modal.style.display = "none";
}

// Cierra el modal si se hace clic fuera del contenido
window.onclick = function(event) {
    const modal = document.getElementById("modalAlumno");
    if (event.target === modal) {
        cerrarModal();
    }
}