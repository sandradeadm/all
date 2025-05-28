const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try{
        const resultado = await pool.query('SELECT * FROM plan;');
        res.json(resultado.rows);
    } catch (error){
        console.error(error);
        res.status(500).json({ error: 'Error al obtener planes'});
    }
});

module.exports = router;