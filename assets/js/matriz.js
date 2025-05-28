document.getElementById('searchInput').addEventListener('input', filtrarAlumnos);
document.getElementById('grado').addEventListener('change', filtrarAlumnos);

function filtrarAlumnos() {
    const filterNombre = document.getElementById('searchInput').value.toLowerCase();
    const filterGrado = document.getElementById('grado').value.toLowerCase();
    const rows = document.querySelectorAll('#alumnosTable tbody tr');

    rows.forEach(row => {
    const nombre = row.cells[0].textContent.toLowerCase();
    const grado = row.cells[2].textContent.toLowerCase();

    if (
        (nombre.includes(filterNombre)) &&
        (filterGrado === '' || grado === filterGrado)
    ) {
        row.style.display = '';
    } else {
        row.style.display = 'none';
    }
    });
}


