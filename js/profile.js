// Referencias DOM para perfil
const profilePhoto = document.getElementById("profilePhoto")
const profileName = document.getElementById("profileName")
const profileEmail = document.getElementById("profileEmail")
const profileBio = document.getElementById("profileBio")
const profileLocation = document.getElementById("profileLocation")
const profileInterests = document.getElementById("profileInterests")
const inputBio = document.getElementById("inputBio")
const inputLocation = document.getElementById("inputLocation")
const inputInterests = document.getElementById("inputInterests")
const btnSaveProfile = document.getElementById("btnSaveProfile")
const profileLoader = document.getElementById("profileLoader")
const profileError = document.getElementById("profileError")
const profileSuccess = document.getElementById("profileSuccess")

// Declaración de variables (asumiendo que se inicializan en otro lugar)
let db
let currentUser
let firebase

// Funciones auxiliares (asumiendo que se definen en otro lugar)
function showErrorMessage(element, message) {
  console.error(message) // Placeholder
  if (element) element.textContent = message
}

function hideMessages() {
  // Placeholder
}

function showSuccessMessage(element, message) {
  // Placeholder
  if (element) element.textContent = message
}

// Función para cargar el perfil del usuario
function loadUserProfile(uid) {
  if (profileLoader) profileLoader.style.display = "block"

  db.collection("users")
    .doc(uid)
    .get()
    .then((doc) => {
      if (profileLoader) profileLoader.style.display = "none"

      if (doc.exists) {
        const d = doc.data()

        if (profilePhoto) profilePhoto.src = d.photoURL
        if (profileName) profileName.textContent = d.displayName
        if (profileEmail) profileEmail.textContent = d.email
        if (profileBio) profileBio.textContent = d.bio || "—"
        if (profileLocation) profileLocation.textContent = d.location || "—"
        if (profileInterests) profileInterests.textContent = d.interests.join(", ") || "—"

        if (inputBio) inputBio.value = d.bio || ""
        if (inputLocation) inputLocation.value = d.location || ""
        if (inputInterests) inputInterests.value = d.interests.join(", ") || ""
      }
    })
    .catch((e) => {
      if (profileLoader) profileLoader.style.display = "none"
      showErrorMessage(profileError, "No se pudo cargar perfil")
      console.error("Error al cargar perfil:", e)
    })
}

// Event listener para guardar cambios en el perfil
if (btnSaveProfile) {
  btnSaveProfile.addEventListener("click", () => {
    if (!currentUser) return showErrorMessage(profileError, "Inicia sesión")

    if (profileLoader) profileLoader.style.display = "block"
    hideMessages()

    const interestsArray = inputInterests.value
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i)

    const data = {
      bio: inputBio.value,
      location: inputLocation.value,
      interests: interestsArray,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }

    db.collection("users")
      .doc(currentUser.uid)
      .update(data)
      .then(() => {
        if (profileLoader) profileLoader.style.display = "none"
        showSuccessMessage(profileSuccess, "Perfil actualizado")
        loadUserProfile(currentUser.uid)
      })
      .catch((e) => {
        if (profileLoader) profileLoader.style.display = "none"
        showErrorMessage(profileError, "Error al guardar")
        console.error("Error al guardar perfil:", e)
      })
  })
}
