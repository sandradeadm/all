document.addEventListener("DOMContentLoaded", () => {

    const tbody = document.querySelector("#tabla-cursos tbody");

    fetch("/cursos")
        .then(res => res.json())
        .then(data => {
            data.forEach(curso => {
                const fila = document.createElement("tr");

                fila.innerHTML = `
                    <td>${curso.Id_curso}</td>
                    <td>${curso.Nombre_curso}</td>
                    <td>${curso.Id_plan}</td>
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