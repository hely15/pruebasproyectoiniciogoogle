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

// Initialize Firebase (replace with your actual Firebase configuration)
const firebaseConfig = {
  apiKey: "AIzaSyCL2CctB5ULQg2tkWKKTX20-Aot0aGsVYw",
  authDomain: "registrocon-97cb2.firebaseapp.com",
  projectId: "registrocon-97cb2",
  storageBucket: "registrocon-97cb2.firebasestorage.app",
  messagingSenderId: "373644979789",
  appId: "1:373644979789:web:5b08ef46eb8852c59fb604",
  measurementId: "G-X5Q3RL90PV",
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

// Get a reference to the database
const db = firebase.firestore()

// Example current user (replace with actual authentication)
const currentUser = firebase.auth().currentUser

// Function to show error messages
function showErrorMessage(element, message) {
  element.textContent = message
  element.style.display = "block"
}

// Function to show success messages
function showSuccessMessage(element, message) {
  element.textContent = message
  element.style.display = "block"
}

// Function to hide messages
function hideMessages() {
  profileError.style.display = "none"
  profileSuccess.style.display = "none"
}

// Cargar perfil del usuario
function loadUserProfile(uid) {
  if (!profileLoader) return

  profileLoader.style.display = "block"
  db.collection("users")
    .doc(uid)
    .get()
    .then((doc) => {
      profileLoader.style.display = "none"
      const d = doc.data()
      profilePhoto.src = d.photoURL
      profileName.textContent = d.displayName
      profileEmail.textContent = d.email
      profileBio.textContent = d.bio || "—"
      profileLocation.textContent = d.location || "—"
      profileInterests.textContent = d.interests.join(", ") || "—"
      inputBio.value = d.bio
      inputLocation.value = d.location
      inputInterests.value = d.interests.join(", ")
    })
    .catch((e) => {
      profileLoader.style.display = "none"
      showErrorMessage(profileError, "No se pudo cargar perfil")
    })
}

// Guardar cambios en el perfil
if (btnSaveProfile) {
  btnSaveProfile.addEventListener("click", () => {
    if (!currentUser) return showErrorMessage(profileError, "Inicia sesión")

    profileLoader.style.display = "block"
    hideMessages()

    const arr = inputInterests.value
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i)
    const data = {
      bio: inputBio.value,
      location: inputLocation.value,
      interests: arr,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }

    db.collection("users")
      .doc(currentUser.uid)
      .update(data)
      .then(() => {
        profileLoader.style.display = "none"
        showSuccessMessage(profileSuccess, "Perfil actualizado")
        loadUserProfile(currentUser.uid)
      })
      .catch((e) => {
        profileLoader.style.display = "none"
        showErrorMessage(profileError, "Error al guardar")
      })
  })
}
