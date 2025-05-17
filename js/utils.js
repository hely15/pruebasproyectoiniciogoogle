// Funciones de utilidad

// Mostrar/ocultar mensajes
function hideMessages() {
  const messages = [
    document.getElementById("postError"),
    document.getElementById("postSuccess"),
    document.getElementById("profileError"),
    document.getElementById("profileSuccess"),
  ]

  messages.forEach((el) => {
    if (el) el.style.display = "none"
  })
}

function showErrorMessage(el, msg) {
  if (!el) return
  el.textContent = msg
  el.style.display = "block"
}

function showSuccessMessage(el, msg) {
  if (!el) return
  el.textContent = msg
  el.style.display = "block"
}

// Obtener parámetros de URL
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(name)
}
