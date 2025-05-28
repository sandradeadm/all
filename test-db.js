const pool = require('./db');

async function testConnection() {
    try{
        const result = await pool.query('SELECT NOW();');
        console.log('conexión exitosa:', result.rows[0]);
    } catch (error){
        console.error('Error al conectar con la base de datos:', error);
    } finally {
        await pool.end();
    }
}

testConnection();