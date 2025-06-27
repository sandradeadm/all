const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Opcional

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.set('trust proxy', true);

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'Lapeludita122',
  port: 5432,
});

// --- BITÁCORA: función para registrar logs ---
async function registrarLog({
  id_operacion,
  id_usuario,
  detalle = '',
  ip = '',
  mac = null,
  usuario_afectado = null
}) {
  try {
    await pool.query(
      `INSERT INTO logs (id_operacion, hora_y_fecha, id_usuario, ip, mac, detalle, usuario_afectado)
       VALUES ($1, NOW(), $2, $3, $4, $5, $6)`,
      [id_operacion, id_usuario, ip, mac, detalle, usuario_afectado]
    );
  } catch (err) {
    console.error('Error registrando log:', err);
  }
}

// --- ENDPOINT PARA REGISTRAR VISUALIZACIÓN DE CONTRASEÑA ---
app.post('/api/logs/ver_clave', async (req, res) => {
  const { admin, usuario_afectado } = req.body || {};
  if (!admin || !usuario_afectado) {
    return res.status(400).json({ error: 'Datos incompletos para log de ver clave' });
  }
  try {
    // id_operacion=12 para "visualizacion_clave"
    await registrarLog({
      id_operacion: 12,
      id_usuario: admin.id_usuario,
      detalle: `El usuario ${admin.nombre} (ID ${admin.id_usuario}) visualizó la contraseña de ${usuario_afectado.nombre} (ID ${usuario_afectado.id_usuario})`,
      ip: req.ip,
      usuario_afectado: usuario_afectado.id_usuario
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- NUEVO ENDPOINT PARA LOGUEAR ACCESO A APARTADOS ---
app.post('/api/logs/acceso', async (req, res) => {
  const { usuario_actual, apartado } = req.body || {};
  if (!usuario_actual || !apartado) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }
  try {
    // id_operacion=11 para "acceso_apartado"
    await registrarLog({
      id_operacion: 11, 
      id_usuario: usuario_actual.id_usuario,
      detalle: `Ingresó al apartado "${apartado}"`,
      ip: req.ip
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ENDPOINT PARA LOGUEAR LOGOUT ---
app.post('/api/logout', async (req, res) => {
  const { usuario_actual } = req.body || {};
  if (!usuario_actual) {
    return res.status(400).json({ error: 'Faltan datos para logout' });
  }
  try {
    await registrarLog({
      id_operacion: 2, // logout
      id_usuario: usuario_actual.id_usuario,
      detalle: `El usuario ${usuario_actual.nombre || usuario_actual.id_usuario} cerró sesión.`,
      ip: req.ip
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ENDPOINT PARA CONSULTAR LA BITÁCORA ---
app.get('/api/bitacora', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        l.id_log,
        l.hora_y_fecha,
        u.nombre AS usuario,
        o.descripcion AS operacion,
        l.detalle,
        l.ip,
        l.mac,
        COALESCE(uaf.nombre::text, l.usuario_afectado::text) AS usuario_afectado
      FROM logs l
      LEFT JOIN usuarios u ON l.id_usuario = u.id_usuario
      LEFT JOIN operaciones o ON l.id_operacion = o.id_operacion
      LEFT JOIN usuarios uaf ON 
        CASE 
          WHEN l.usuario_afectado ~ '^[0-9]+$' THEN l.usuario_afectado::integer
          ELSE NULL
        END = uaf.id_usuario
      ORDER BY l.hora_y_fecha DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

// Agregar usuario (ahora sólo pueden hacerlo ADMINISTRADOR y SOPORTE)
app.post('/api/usuarios', async (req, res) => {
  const usuario_actual = req.body && req.body.usuario_actual;
  const { nombre, pass, id_rol, id_grupo, dni } = req.body || {};
  if (!usuario_actual || ![1, 7].includes(Number(usuario_actual.rol))) {
    return res.status(403).json({ error: 'No tiene permisos para agregar usuarios' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, pass, id_rol, id_grupo, dni) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, pass, id_rol, id_grupo, dni]
    );
    await registrarLog({
      id_operacion: 3,
      id_usuario: usuario_actual.id_usuario,
      detalle: `El usuario ${usuario_actual.id_usuario} creó al usuario ${nombre}`,
      ip: req.ip,
      usuario_afectado: nombre
    });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// NUEVO: Buscador de roles eficiente y seguro para NULLs
app.get('/api/roles/buscar', async (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) {
    return res.json([]);
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
    console.error('Error en /api/roles/buscar:', err);
    res.status(500).json({ error: err.message });
  }
});

// Listar todos los roles
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

// Agregar un nuevo rol (solo ADMINISTRADOR)
app.post('/api/roles', async (req, res) => {
  const usuario_actual = req.body && req.body.usuario_actual;
  const { nombre, descripcion } = req.body || {};
  if (!usuario_actual || Number(usuario_actual.rol) !== 1) {
    return res.status(403).json({ error: 'No tiene permisos para agregar roles' });
  }
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

// Eliminar un rol (solo ADMINISTRADOR)
app.delete('/api/roles/:id_rol', async (req, res) => {
  const usuario_rol = req.body && req.body.usuario_rol;
  if (Number(usuario_rol) !== 1) {
    return res.status(403).json({ error: 'No tiene permisos para eliminar roles' });
  }
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

// NUEVO: Buscador de grupos por nombre
app.get('/api/grupos/buscar', async (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) {
    return res.json([]);
  }
  try {
    const result = await pool.query(
      `SELECT id_grupo, nombre FROM grupos
       WHERE LOWER(nombre) LIKE LOWER($1)
       ORDER BY id_grupo`,
      [`%${q.trim()}%`]
    );
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
app.put('/api/usuarios/:id_usuario/deshabilitar', async (req, res) => {
  const usuario_actual = req.body && req.body.usuario_actual;
  const { id_usuario } = req.params;
  if (!usuario_actual || ![1,7].includes(Number(usuario_actual.rol))) {
    return res.status(403).json({ error: 'No tiene permisos para deshabilitar usuarios' });
  }
  try {
    await pool.query(
      'UPDATE usuarios SET deshabilitado = TRUE WHERE id_usuario = $1',
      [id_usuario]
    );
    await registrarLog({
      id_operacion: 4,
      id_usuario: usuario_actual.id_usuario,
      detalle: `Deshabilitó al usuario ID ${id_usuario}`,
      ip: req.ip,
      usuario_afectado: id_usuario
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/usuarios/:id_usuario/habilitar', async (req, res) => {
  const usuario_actual = req.body && req.body.usuario_actual;
  const { id_usuario } = req.params;
  if (!usuario_actual || ![1,7].includes(Number(usuario_actual.rol))) {
    return res.status(403).json({ error: 'No tiene permisos para habilitar usuarios' });
  }
  try {
    await pool.query(
      'UPDATE usuarios SET deshabilitado = FALSE WHERE id_usuario = $1',
      [id_usuario]
    );
    await registrarLog({
      id_operacion: 8,
      id_usuario: usuario_actual.id_usuario,
      detalle: `Habilitó al usuario ID ${id_usuario}`,
      ip: req.ip,
      usuario_afectado: id_usuario
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/usuarios/:id_usuario/desbloquear', async (req, res) => {
  const usuario_actual = req.body && req.body.usuario_actual;
  const { id_usuario } = req.params;
  if (!usuario_actual || ![1,7].includes(Number(usuario_actual.rol))) {
    return res.status(403).json({ error: 'No tiene permisos para desbloquear usuarios' });
  }
  try {
    await pool.query(
      'UPDATE usuarios SET bloqueado = FALSE, intentos = 0 WHERE id_usuario = $1',
      [id_usuario]
    );
    await registrarLog({
      id_operacion: 6,
      id_usuario: usuario_actual.id_usuario,
      detalle: `Desbloqueó al usuario ID ${id_usuario}`,
      ip: req.ip,
      usuario_afectado: id_usuario
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login endpoint (POST /api/login)
app.post('/api/login', async (req, res) => {
  const { nombre, pass } = req.body || {};
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE nombre = $1', [nombre]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    const usuario = result.rows[0];

    if (usuario.deshabilitado) {
      return res.status(403).json({ error: 'Usuario deshabilitado. Contacte al administrador.' });
    }
    if (usuario.bloqueado) {
      return res.status(403).json({ error: 'Usuario bloqueado por intentos fallidos. Contacte al administrador.' });
    }

    // const passwordCorrect = await bcrypt.compare(pass, usuario.pass);
    const passwordCorrect = pass === usuario.pass;

    if (!passwordCorrect) {
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
        await registrarLog({
          id_operacion: 5,
          id_usuario: usuario.id_usuario,
          detalle: `Bloqueo automático por 3 intentos fallidos`,
          ip: req.ip
        });
        return res.status(403).json({ error: 'Usuario bloqueado por 3 intentos fallidos.' });
      }
      return res.status(401).json({ error: `Contraseña incorrecta. Intentos fallidos: ${nuevosIntentos}/3` });
    } else {
      await pool.query(
        'UPDATE usuarios SET intentos = 0, bloqueado = FALSE WHERE id_usuario = $1',
        [usuario.id_usuario]
      );
      await registrarLog({
        id_operacion: 1,
        id_usuario: usuario.id_usuario,
        detalle: `El usuario ${usuario.nombre} inició sesión.`,
        ip: req.ip
      });
      res.json({ success: true, usuario: { id_usuario: usuario.id_usuario, nombre: usuario.nombre, rol: usuario.id_rol } });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});