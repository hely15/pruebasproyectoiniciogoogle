// Variables globales
let currentUser = null
const currentTab = null
const currentFilter = null
const searchQuery = null

// Referencias DOM para autenticación
const btnHeaderLogin = document.getElementById("btnHeaderLogin")
const btnMainLogin = document.getElementById("btnMainLogin")
const btnLogout = document.getElementById("btnLogout")
const userInfo = document.getElementById("userInfo")
const userName = document.getElementById("userName")
const userNameBig = document.getElementById("userNameBig")
const userPhoto = document.getElementById("userPhoto")
const userPhotoLarge = document.getElementById("userPhotoLarge")
const signedInContent = document.getElementById("signedInContent")
const navForum = document.getElementById("navForum")
const navProfile = document.getElementById("navProfile")

// Initialize Firebase Authentication and Firestore
const auth = firebase.auth()
const db = firebase.firestore()

// Escuchar cambios en el estado de autenticación
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user
    showUserInfo(user)
    btnHeaderLogin.style.display = "none"
    userInfo.style.display = "flex"
    btnMainLogin.style.display = "none"
    signedInContent.style.display = "block"
    if (navForum) navForum.style.display = "inline"
    if (navProfile) navProfile.style.display = "inline"

    // Cargar datos del usuario
    if (typeof loadUserProfile === "function") loadUserProfile(user.uid)
    if (typeof loadPosts === "function") loadPosts(currentTab, currentFilter, searchQuery)
    checkUserInFirestore(user)
  } else {
    currentUser = null
    btnHeaderLogin.style.display = "flex"
    userInfo.style.display = "none"
    btnMainLogin.style.display = "inline-flex"
    signedInContent.style.display = "none"
    if (navForum) navForum.style.display = "none"
    if (navProfile) navProfile.style.display = "none"
    showSection("welcome")
  }
})

// Iniciar sesión con Google
function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider()
  auth.signInWithPopup(provider).catch((e) => alert(e.message))
}

// Mostrar información del usuario
function showUserInfo(user) {
  userName.textContent = user.displayName
  userNameBig.textContent = user.displayName
  userPhoto.src = user.photoURL || ""
  userPhotoLarge.src = user.photoURL || ""
}

// Verificar si el usuario existe en Firestore
function checkUserInFirestore(u) {
  db.collection("users")
    .doc(u.uid)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        db.collection("users").doc(u.uid).set({
          uid: u.uid,
          displayName: u.displayName,
          email: u.email,
          photoURL: u.photoURL,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          bio: "",
          location: "",
          interests: [],
        })
      }
    })
}

// Event listeners para autenticación
if (btnHeaderLogin) btnHeaderLogin.addEventListener("click", loginWithGoogle)
if (btnMainLogin) btnMainLogin.addEventListener("click", loginWithGoogle)
if (btnLogout) btnLogout.addEventListener("click", () => auth.signOut())
