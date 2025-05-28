
const express = require('express');
const app = express();
const path = require('path');

//Para leer archivos estáticos
app.use('/assets', express.static('assets'));
app.use('/views', express.static('views'));

// Ruta para servir index.html desde /views o donde lo tengas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

//Ruta para Alumnos
const alumnosRouter = require('./routes/alumnos');
app.use('/alumnos', alumnosRouter);

//Ruta para materias
const materiasRouter = require('./routes/materias');
app.use('/materias', materiasRouter);

//Ruta para cursos
const cursosRouter = require('./routes/cursos');
app.use('/cursos', cursosRouter);

//Ruta para planes
const planesRouter = require('./routes/planes');
app.use('/planes', planesRouter);

//Ruta para tutores
const tutoresRouter = require('./routes/tutores');
app.use('/tutores', tutoresRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
