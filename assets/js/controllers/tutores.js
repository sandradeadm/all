document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.querySelector("#tabla-tutores tbody");
    const contenedorAcciones = document.getElementById("acciones-tutores");

    fetch("/tutores")
        .then(res => res.json())
        .then(data => {
            data.forEach(tutor => {
                // Crear la fila de la tabla
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${tutor.Id_tutor}</td>
                    <td>${tutor.Nombre}, ${tutor.Apellido.toUpperCase()}</td>
                    <td>${tutor.DNI}</td>
                    <td>${tutor.CUIL}</td>
                    <td>${tutor.Telefono}</td>
                `;
                tbody.appendChild(fila);

                // Crear los botones fuera de la tabla
                const grupoBotones = document.createElement("div");
                grupoBotones.innerHTML = `
                    <button onclick="mostrarModal(document.getElementById('modalDetalle'))">Ver Detalle</button>
                    <button onclick="mostrarModal(document.getElementById('modalEditar'))">Editar</button>
                `;
                contenedorAcciones.appendChild(grupoBotones);
            });
        })
        .catch(error => {
            console.error("Error al cargar los tutores:", error);
        });
});
