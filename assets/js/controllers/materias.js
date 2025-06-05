document.addEventListener("DOMContentLoaded", () => {

    const tbody = document.querySelector("#tabla-materias tbody");

    fetch("/materias")
        .then(res => res.json())
        .then(data => {
            data.forEach(materia => {
                const fila = document.createElement("tr");

                fila.innerHTML = `
                    <td>${materia.Nombre_materia}</td>
                    <td>${materia.Id_materia}</td>
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