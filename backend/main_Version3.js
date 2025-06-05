// Cuando la página carga, hace la petición al backend
window.addEventListener('DOMContentLoaded', () => {
  fetch('http://localhost:3000/api/usuarios')
    .then(response => response.json())
    .then(usuarios => {
      const tbody = document.querySelector('#tabla-usuarios tbody');
      tbody.innerHTML = ''; // Limpia la tabla por si acaso
      usuarios.forEach(usuario => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${usuario.id_usuario}</td>
          <td>${usuario.nombre}</td>
          <td>${usuario.dni}</td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch(error => {
      alert('Error al cargar usuarios: ' + error.message);
    });
});