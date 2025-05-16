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

// Initialize Firebase (replace with your actual Firebase config)
const firebaseConfig = {
  apiKey: "AIzaSyCL2CctB5ULQg2tkWKKTX20-Aot0aGsVYw",
  authDomain: "registrocon-97cb2.firebaseapp.com",
  projectId: "registrocon-97cb2",
  storageBucket: "registrocon-97cb2.firebasestorage.app",
  messagingSenderId: "373644979789",
  appId: "1:373644979789:web:5b08ef46eb8852c59fb604",
  measurementId: "G-X5Q3RL90PV"
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

const auth = firebase.auth()
const db = firebase.firestore()
let currentUser = null

// Función para iniciar sesión con Google
function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider()
  auth.signInWithPopup(provider).catch((e) => alert(e.message))
}

// Función para mostrar información del usuario
function showUserInfo(user) {
  if (userName) userName.textContent = user.displayName
  if (userNameBig) userNameBig.textContent = user.displayName
  if (userPhoto) userPhoto.src = user.photoURL || ""
  if (userPhotoLarge) userPhotoLarge.src = user.photoURL || ""
}

// Verificar si el usuario existe en Firestore
function checkUserInFirestore(user) {
  db.collection("users")
    .doc(user.uid)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        db.collection("users").doc(user.uid).set({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          bio: "",
          location: "",
          interests: [],
        })
      }
    })
}

// Observador del estado de autenticación
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user
    showUserInfo(user)

    if (btnHeaderLogin) btnHeaderLogin.style.display = "none"
    if (userInfo) userInfo.style.display = "flex"
    if (btnMainLogin) btnMainLogin.style.display = "none"
    if (signedInContent) signedInContent.style.display = "block"

    const navForum = document.getElementById("navForum")
    const navProfile = document.getElementById("navProfile")
    if (navForum) navForum.style.display = "inline"
    if (navProfile) navProfile.style.display = "inline"

    checkUserInFirestore(user)

    // Cargar datos específicos de la página
    if (typeof loadUserProfile === "function" && user.uid) {
      loadUserProfile(user.uid)
    }

    if (typeof loadPosts === "function") {
      const currentTab = window.currentTab || "all"
      const currentFilter = window.currentFilter || "all"
      const searchQuery = window.searchQuery || ""
      loadPosts(currentTab, currentFilter, searchQuery)
    }

    // Para la página de post individual
    const postId = new URLSearchParams(location.search).get("id")
    if (postId) {
      if (typeof loadPost === "function") loadPost(postId)
      if (typeof listenToComments === "function") listenToComments(postId)
    }
  } else {
    currentUser = null

    if (btnHeaderLogin) btnHeaderLogin.style.display = "flex"
    if (userInfo) userInfo.style.display = "none"
    if (btnMainLogin) btnMainLogin.style.display = "inline-flex"
    if (signedInContent) signedInContent.style.display = "none"

    const navForum = document.getElementById("navForum")
    const navProfile = document.getElementById("navProfile")
    if (navForum) navForum.style.display = "none"
    if (navProfile) navProfile.style.display = "none"

    if (typeof showSection === "function") {
      showSection("welcome")
    }
  }
})

// Agregar event listeners para botones de autenticación
if (btnHeaderLogin) btnHeaderLogin.addEventListener("click", loginWithGoogle)
if (btnMainLogin) btnMainLogin.addEventListener("click", loginWithGoogle)
if (btnLogout) btnLogout.addEventListener("click", () => auth.signOut())
