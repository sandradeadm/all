function cambiarTabla() {
  const selector = document.getElementById("selector-tabla");
  const valorSeleccionado = selector.value;

  const tablaAlumnos = document.getElementById("tabla-alumnos");
  const tablaTutores = document.getElementById("tabla-tutores");

  if (valorSeleccionado === "alumnos") {
    tablaAlumnos.style.display = "table";
    tablaTutores.style.display = "none";
  } else if (valorSeleccionado === "tutores") {
    tablaAlumnos.style.display = "none";
    tablaTutores.style.display = "table";
  }

  window.addEventListener("DOMContentLoaded", () => {
    cambiarTabla();
  });

}
