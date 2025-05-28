document.addEventListener("DOMContentLoaded", () => {

    const tbody = document.querySelector("#materiasTable tbody");

    fetch("/materias")
        .then(res => res.json())
        .then(data => {
            data.forEach(plan => {
                const fila = document.createElement("tr");

                fila.innerHTML = `
                    <td>${plan.Id_plan}</td>
                    <td>${plan.Nombre_plan}</td>
                    <td>${plan.Descripcion}</td>
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