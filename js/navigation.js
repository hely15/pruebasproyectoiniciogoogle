// Referencias DOM para navegación
const navHome = document.getElementById("navHome")
const navForum = document.getElementById("navForum")
const navProfile = document.getElementById("navProfile")
const welcomeBox = document.getElementById("welcomeBox")
const profileSection = document.getElementById("profileSection")
const forumSection = document.getElementById("forumSection")

// Función para mostrar secciones
function showSection(name) {
  if (welcomeBox) welcomeBox.style.display = name === "welcome" ? "block" : "none"
  if (profileSection) profileSection.style.display = name === "profile" ? "block" : "none"
  if (forumSection) forumSection.style.display = name === "forum" ? "block" : "none"

  if (navHome) navHome.classList.toggle("active", name === "welcome")
  if (navProfile) navProfile.classList.toggle("active", name === "profile")
  if (navForum) navForum.classList.toggle("active", name === "forum")
}

// Agregar event listeners para navegación
if (navHome) navHome.addEventListener("click", () => showSection("welcome"))
if (navProfile) navProfile.addEventListener("click", () => showSection("profile"))
if (navForum) navForum.addEventListener("click", () => showSection("forum"))

// Inicializar la sección de bienvenida al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  showSection("welcome")
})
