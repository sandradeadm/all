function cambiarTabla() {
  const selector = document.getElementById("selector-tabla");
  const valorSeleccionado = selector.value;

  const tablaCursos = document.getElementById("tabla-cursos");
  const tablaMaterias = document.getElementById("tabla-materias");
  const tablaPlanes = document.getElementById("tabla-planes");

  if (valorSeleccionado === "cursos") {
    tablaCursos.style.display = "table";
    tablaMaterias.style.display = "none";
     tablaPlanes.style.display = "none";
  } else if (valorSeleccionado === "materias") {
    tablaCursos.style.display = "none";
    tablaMaterias.style.display = "table";
    tablaPlanes.style.display = "none";
  }else if (valorSeleccionado === "planes") {
    tablaCursos.style.display ="none";
    tablaMaterias.style.display = "none";
    tablaPlanes.style.display ="table";
  }

  window.addEventListener("DOMContentLoaded", () => {
    cambiarTabla();
  });

}
