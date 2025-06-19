// Ejemplo de alta de usuario desde el frontend

function altaUsuario(nuevoUsuario) {
  const usuario_actual = JSON.parse(localStorage.getItem("usuario"));
  fetch("http://localhost:3000/api/usuarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...nuevoUsuario,
      usuario_actual: {
        id_usuario: usuario_actual.id_usuario,
        rol: Number(usuario_actual.rol)
      }
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert("Error: " + data.error);
    } else {
      alert("Usuario creado correctamente");
      // aquí podés refrescar la lista, limpiar el form, etc.
    }
  });
}

// Ejemplo de uso (ajustá según tu form):
// altaUsuario({nombre: "nuevo", pass: "abc", id_rol: 2, id_grupo: 1, dni: "12345678"});