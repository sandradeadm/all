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

// Listar usuarios de un grupo
app.get('/api/grupos/:id_grupo/usuarios', async (req, res) => {
  const { id_grupo } = req.params;
  try {
    const result = await pool.query(
      'SELECT id_usuario, nombre FROM usuarios WHERE id_grupo = $1',
      [id_grupo]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});