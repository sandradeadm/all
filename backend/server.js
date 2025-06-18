const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'Lapeludita122',
  port: 5432,
});

// Listado de usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios ORDER BY id_usuario');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Agregar usuario
app.post('/api/usuarios', async (req, res) => {
  const { nombre, pass, id_rol, id_grupo, dni } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, pass, id_rol, id_grupo, dni) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, pass, id_rol, id_grupo, dni]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// NUEVO: Buscador de roles eficiente y seguro para NULLs
app.get('/api/roles/buscar', async (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) {
    return res.json([]); // Si no hay consulta, no devuelve nada
  }
  try {
    const result = await pool.query(
      `SELECT id_rol, nombre, descripcion 
       FROM roles 
       WHERE (LOWER(nombre) LIKE LOWER($1) OR LOWER(COALESCE(descripcion, '')) LIKE LOWER($1)) 
       ORDER BY id_rol`,
      [`%${q.trim()}%`]
    );
    res.json(result.rows);
  } catch (err) {
    // Log para debug
    console.error('Error en /api/roles/buscar:', err);
    res.status(500).json({ error: err.message });
  }
});

// Listar todos los roles (no se usa para buscar)
app.get('/api/roles', async (req, res) => {
  try {
    const result = await pool.query('SELECT id_rol, nombre, descripcion FROM roles ORDER BY id_rol');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener un solo rol 
app.get('/api/roles/:id_rol', async (req, res) => {
  const { id_rol } = req.params;
  try {
    const result = await pool.query(
      'SELECT id_rol, nombre, descripcion FROM roles WHERE id_rol = $1',
      [id_rol]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Rol no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar usuarios de un rol
app.get('/api/roles/:id_rol/usuarios', async (req, res) => {
  const { id_rol } = req.params;
  try {
    const result = await pool.query(
      'SELECT id_usuario, nombre, dni FROM usuarios WHERE id_rol = $1',
      [id_rol]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Agregar un nuevo rol
app.post('/api/roles', async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO roles (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre, descripcion || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar un rol
app.delete('/api/roles/:id_rol', async (req, res) => {
  const { id_rol } = req.params;
  try {
    await pool.query('DELETE FROM roles WHERE id_rol = $1', [id_rol]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar grupos
app.get('/api/grupos', async (req, res) => {
  try {
    const result = await pool.query('SELECT id_grupo, nombre FROM grupos ORDER BY id_grupo');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// NUEVO: Buscador de grupos por nombre (solo consulta, sin altas/bajas)
app.get('/api/grupos/buscar', async (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) {
    return res.json([]); // Si no hay consulta, no devuelve nada
  }
  try {
    const result = await pool.query(
      `SELECT id_grupo, nombre FROM grupos
       WHERE LOWER(nombre) LIKE LOWER($1)
       ORDER BY id_grupo`,
      [`%${q.trim()}%`]
    );
    // Trae usuarios para cada grupo encontrado
    const grupos = await Promise.all(result.rows.map(async grupo => {
      const usuarios = await pool.query(
        'SELECT id_usuario, nombre, dni FROM usuarios WHERE id_grupo = $1',
        [grupo.id_grupo]
      );
      return { ...grupo, usuarios: usuarios.rows };
    }));
    res.json(grupos);
  } catch (err) {
    console.error('Error en /api/grupos/buscar:', err);
    res.status(500).json({ error: err.message });
  }
});

// Listar usuarios de un grupo
app.get('/api/grupos/:id_grupo/usuarios', async (req, res) => {
  const { id_grupo } = req.params;
  try {
    const result = await pool.query(
      'SELECT id_usuario, nombre, dni FROM usuarios WHERE id_grupo = $1',
      [id_grupo]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- AGREGADOS: habilitar, deshabilitar, desbloquear usuario y bloqueo por intentos ---

// Deshabilitar usuario
app.put('/api/usuarios/:id_usuario/deshabilitar', async (req, res) => {
  const { id_usuario } = req.params;
  try {
    await pool.query(
      'UPDATE usuarios SET deshabilitado = TRUE WHERE id_usuario = $1',
      [id_usuario]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Habilitar usuario
app.put('/api/usuarios/:id_usuario/habilitar', async (req, res) => {
  const { id_usuario } = req.params;
  try {
    await pool.query(
      'UPDATE usuarios SET deshabilitado = FALSE WHERE id_usuario = $1',
      [id_usuario]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Desbloquear usuario (resetea bloqueado e intentos)
app.put('/api/usuarios/:id_usuario/desbloquear', async (req, res) => {
  const { id_usuario } = req.params;
  try {
    await pool.query(
      'UPDATE usuarios SET bloqueado = FALSE, intentos = 0 WHERE id_usuario = $1',
      [id_usuario]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const bcrypt = require('bcryptjs'); // Opcional: para hash seguro (recomendado)

// Login endpoint (POST /api/login)
app.post('/api/login', async (req, res) => {
  const { nombre, pass } = req.body;
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE nombre = $1', [nombre]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    const usuario = result.rows[0];

    // --- Bloqueos/Deshabilitado ---
    if (usuario.deshabilitado) {
      return res.status(403).json({ error: 'Usuario deshabilitado. Contacte al administrador.' });
    }
    if (usuario.bloqueado) {
      return res.status(403).json({ error: 'Usuario bloqueado por intentos fallidos. Contacte al administrador.' });
    }

    // Si usas bcrypt para el hash:
    // const passwordCorrect = await bcrypt.compare(pass, usuario.pass);
    // Si no usas hash (NO recomendado en producción):
    const passwordCorrect = pass === usuario.pass;

    if (!passwordCorrect) {
      // Suma intento
      let nuevosIntentos = (usuario.intentos || 0) + 1;
      let bloqueado = false;
      if(nuevosIntentos >= 3) {
        bloqueado = true;
      }
      await pool.query(
        'UPDATE usuarios SET intentos = $1, bloqueado = $2 WHERE id_usuario = $3',
        [nuevosIntentos, bloqueado, usuario.id_usuario]
      );
      if(bloqueado){
        return res.status(403).json({ error: 'Usuario bloqueado por 3 intentos fallidos.' });
      }
      return res.status(401).json({ error: `Contraseña incorrecta. Intentos fallidos: ${nuevosIntentos}/3` });
    } else {
      // Ok, login exitoso: resetea intentos y desbloqueado si estaba
      await pool.query(
        'UPDATE usuarios SET intentos = 0, bloqueado = FALSE WHERE id_usuario = $1',
        [usuario.id_usuario]
      );
      res.json({ success: true, usuario: { id: usuario.id_usuario, nombre: usuario.nombre, rol: usuario.id_rol } });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});