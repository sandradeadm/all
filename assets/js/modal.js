function mostrarModal(modal) {
  modal.classList.remove('hide');
  modal.classList.add('show');
  modal.style.display = 'block';
}

function cerrarModal(modal) {
  modal.classList.remove('show');
  modal.classList.add('hide');

  setTimeout(() => {
    modal.style.display = 'none';
  }, 300); // coincide con la duración de las animaciones
}

window.addEventListener('click', function (event) {
  document.querySelectorAll('.modal.show').forEach(modal => {
    if (event.target === modal) {
      cerrarModal(modal);
    }
  });
});

// Cierra el modal al presionar la tecla Escape
window.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    document.querySelectorAll('.modal.show').forEach(modal => {
      cerrarModal(modal);
    });
  }
});
