document.addEventListener("DOMContentLoaded", () => {

    const tbody = document.querySelector("#alumnosTable tbody");

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
                        <button class="ver-mas" onclick="mostrarModal()">Ver Mas</button>
                        <button class="editar" onclick="mostrarModal()">Editar</button>
                        <button class="baja" onclick="mostrarModal()">Baja</button> 
                    </td>
                `

                tbody.appendChild(fila);
            });
        })
        .catch(error => {
            console.error("Error al cargar los alumnos:", error);
        });
})