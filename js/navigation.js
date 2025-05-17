// Referencias DOM para navegación
const navHome = document.getElementById("navHome")
const navForum = document.getElementById("navForum")
const navProfile = document.getElementById("navProfile")
const welcomeBox = document.getElementById("welcomeBox")
const profileSection = document.getElementById("profileSection")
const forumSection = document.getElementById("forumSection")

// Función para mostrar secciones
function showSection(name) {
  welcomeBox.style.display = name === "welcome" ? "block" : "none"
  profileSection.style.display = name === "profile" ? "block" : "none"
  forumSection.style.display = name === "forum" ? "block" : "none"

  navHome.classList.toggle("active", name === "welcome")
  navProfile.classList.toggle("active", name === "profile")
  navForum.classList.toggle("active", name === "forum")
}

// Event listeners para navegación
if (navHome) navHome.addEventListener("click", () => showSection("welcome"))
if (navProfile) navProfile.addEventListener("click", () => showSection("profile"))
if (navForum) navForum.addEventListener("click", () => showSection("forum"))
