// Este archivo se encarga de inicializar la aplicación
// y coordinar los diferentes módulos

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  console.log("Aplicación inicializada")

  // Declarar la función showSection (simulando una importación o definición)
  function showSection(sectionId) {
    console.log(`Mostrando sección: ${sectionId}`)
    // Aquí iría la lógica real para mostrar la sección
  }

  // Mostrar la sección inicial
  if (typeof showSection === "function") {
    showSection("welcome")
  }
})
