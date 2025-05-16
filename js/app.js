// Inicialización de la aplicación
document.addEventListener("DOMContentLoaded", () => {
  // Declarar la función showSection (o importarla si está en otro archivo)
  function showSection(sectionId) {
    // Aquí iría la lógica para mostrar la sección correspondiente
    console.log("Mostrando sección:", sectionId)
  }

  // Mostrar la sección de bienvenida por defecto
  if (typeof showSection === "function") {
    showSection("welcome")
  }
})
