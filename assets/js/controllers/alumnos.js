document.addEventListener("DOMContentLoaded", () => {

    const tbody = document.querySelector("#tabla-alumnos tbody");

    fetch("/alumnos")
        .then(res => res.json())
        .then(data => {
            data.forEach(alumno => {
                const fila = document.createElement("tr");

                fila.innerHTML = `
                    <td>${alumno.Id_alumno}</td>
                    <td>${alumno.Nombre}, ${alumno.Apellido.toUpperCase()}</td>
                    <td>${alumno.Legajo}</td>
                    <td></td>
                    <td>
                        <button onclick="mostrarModal(document.getElementById('modalAlumno'))">Detalles</button>
                        <button onclick="mostrarModal(document.getElementById('modalTutores'))">Ver Tutores</button>
                    </td>
                `

                tbody.appendChild(fila);
            });
        })
        .catch(error => {
            console.error("Error al cargar los alumnos:", error);
        });
})