document.addEventListener("DOMContentLoaded", () => {

    const tbody = document.querySelector("#alumnosTable tbody");

    fetch("/alumnos")
        .then(res => res.json())
        .then(data => {
            data.forEach(tutor => {
                const fila = document.createElement("tr");

                fila.innerHTML = `
                    <td>${tutor.Id_tutor}</td>
                    <td>${tutor.Nombre}, ${tutor.Apellido.toUpperCase()}</td>
                    <td>${tutor.Dni}</td>
                    <td>${tutor.Cuil}</td>
                    <td>${tutor.Telefono}</td>
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