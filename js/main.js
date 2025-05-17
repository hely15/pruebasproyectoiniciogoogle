// ————— Firebase Configuration —————
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
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js"
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js"
import { getStorage } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js"

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// Global variables
let currentUser = null
let currentTab = "all"
let currentFilter = "all"
let searchQuery = ""
let unsubscribeComments = null

// Mapeo de IDs de temas a nombres
const topicMap = {
  1: "Infraestructura del Internet",
  2: "Protocolos de Comunicación",
  3: "Funcionamiento de la Web",
  4: "APIs y Servicios Web",
  5: "Seguridad y Buenas Prácticas",
}

// ————— DOM References —————
// Common elements that might be on any page
const getElement = (id) => document.getElementById(id)

// Check if we're on the index page or post page
const isIndexPage =
  window.location.pathname.includes("index.html") ||
  window.location.pathname === "/" ||
  window.location.pathname.endsWith("/")

const isPostPage = window.location.pathname.includes("post.html")

// Index page elements
let btnHeaderLogin,
  btnMainLogin,
  btnLogout,
  userInfo,
  userName,
  userNameBig,
  userPhoto,
  userPhotoLarge,
  navHome,
  navForum,
  navProfile,
  welcomeBox,
  signedInContent,
  profileSection,
  forumSection,
  profilePhoto,
  profileName,
  profileEmail,
  profileBio,
  profileLocation,
  profileInterests,
  inputBio,
  inputLocation,
  inputInterests,
  btnSaveProfile,
  profileLoader,
  profileError,
  profileSuccess,
  postTitle,
  postTopic,
  postContent,
  btnCreatePost,
  postsList,
  postsLoader,
  tabAllPosts,
  tabMyPosts,
  postError,
  postSuccess,
  searchInput,
  btnSearch,
  filterChips

// Post page elements
let postElement, commentsElement, newCommentElement, btnAddComment, orderSelect

// Initialize DOM references based on current page
function initializeDOMReferences() {
  if (isIndexPage) {
    // Index page elements
    btnHeaderLogin = getElement("btnHeaderLogin")
    btnMainLogin = getElement("btnMainLogin")
    btnLogout = getElement("btnLogout")
    userInfo = getElement("userInfo")
    userName = getElement("userName")
    userNameBig = getElement("userNameBig")
    userPhoto = getElement("userPhoto")
    userPhotoLarge = getElement("userPhotoLarge")
    navHome = getElement("navHome")
    navForum = getElement("navForum")
    navProfile = getElement("navProfile")
    welcomeBox = getElement("welcomeBox")
    signedInContent = getElement("signedInContent")
    profileSection = getElement("profileSection")
    forumSection = getElement("forumSection")
    profilePhoto = getElement("profilePhoto")
    profileName = getElement("profileName")
    profileEmail = getElement("profileEmail")
    profileBio = getElement("profileBio")
    profileLocation = getElement("profileLocation")
    profileInterests = getElement("profileInterests")
    inputBio = getElement("inputBio")
    inputLocation = getElement("inputLocation")
    inputInterests = getElement("inputInterests")
    btnSaveProfile = getElement("btnSaveProfile")
    profileLoader = getElement("profileLoader")
    profileError = getElement("profileError")
    profileSuccess = getElement("profileSuccess")
    postTitle = getElement("postTitle")
    postTopic = getElement("postTopic")
    postContent = getElement("postContent")
    btnCreatePost = getElement("btnCreatePost")
    postsList = getElement("postsList")
    postsLoader = getElement("postsLoader")
    tabAllPosts = getElement("tabAllPosts")
    tabMyPosts = getElement("tabMyPosts")
    postError = getElement("postError")
    postSuccess = getElement("postSuccess")
    searchInput = getElement("searchInput")
    btnSearch = getElement("btnSearch")
    filterChips = document.querySelectorAll(".filter-chip")
  } else if (isPostPage) {
    // Post page elements
    postElement = getElement("post")
    commentsElement = getElement("comments")
    newCommentElement = getElement("new-comment")
    btnAddComment = getElement("btnAddComment")
    orderSelect = getElement("orderSelect")
  }
}

// ————— Auth State Change —————
function handleAuthStateChange(user) {
  if (user) {
    currentUser = user

    if (isIndexPage) {
      showUserInfo(user)
      btnHeaderLogin.style.display = "none"
      userInfo.style.display = "flex"
      btnMainLogin.style.display = "none"
      signedInContent.style.display = "block"
      navForum.style.display = "inline"
      navProfile.style.display = "inline"
      loadUserProfile(user.uid)
      loadPosts(currentTab, currentFilter, searchQuery)
      checkUserInFirestore(user)
    } else if (isPostPage) {
      const postId = new URLSearchParams(location.search).get("id")
      if (postId) {
        loadPost(postId)
        listenToComments(postId)
      }
    }
  } else {
    currentUser = null

    if (isIndexPage) {
      btnHeaderLogin.style.display = "flex"
      userInfo.style.display = "none"
      btnMainLogin.style.display = "inline-flex"
      signedInContent.style.display = "none"
      navForum.style.display = "none"
      navProfile.style.display = "none"
      showSection("welcome")
    } else if (isPostPage) {
      const postId = new URLSearchParams(location.search).get("id")
      if (postId) {
        loadPost(postId)
        listenToComments(postId)
      }
    }
  }
}

// ————— Login/Logout Functions —————
function loginWithGoogle() {
  const provider = new GoogleAuthProvider()
  signInWithPopup(auth, provider).catch((e) => alert(e.message))
}

function showUserInfo(user) {
  if (!isIndexPage) return

  userName.textContent = user.displayName
  userNameBig.textContent = user.displayName
  userPhoto.src = user.photoURL || ""
  userPhotoLarge.src = user.photoURL || ""
}

// ————— Navigation Functions —————
function showSection(name) {
  if (!isIndexPage) return

  welcomeBox.style.display = name === "welcome" ? "block" : "none"
  profileSection.style.display = name === "profile" ? "block" : "none"
  forumSection.style.display = name === "forum" ? "block" : "none"
  navHome.classList.toggle("active", name === "welcome")
  navProfile.classList.toggle("active", name === "profile")
  navForum.classList.toggle("active", name === "forum")
}

// ————— Profile Functions —————
function checkUserInFirestore(u) {
  getDoc(doc(db, "users", u.uid)).then((docSnapshot) => {
    if (!docSnapshot.exists()) {
      setDoc(doc(db, "users", u.uid), {
        uid: u.uid,
        displayName: u.displayName,
        email: u.email,
        photoURL: u.photoURL,
        createdAt: serverTimestamp(),
        bio: "",
        location: "",
        interests: [],
      })
    }
  })
}

function loadUserProfile(uid) {
  if (!isIndexPage) return

  profileLoader.style.display = "block"
  getDoc(doc(db, "users", uid))
    .then((docSnapshot) => {
      profileLoader.style.display = "none"
      const d = docSnapshot.data()
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

function saveProfile() {
  if (!isIndexPage || !currentUser) return showErrorMessage(profileError, "Inicia sesión")

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
    updatedAt: serverTimestamp(),
  }

  updateDoc(doc(db, "users", currentUser.uid), data)
    .then(() => {
      profileLoader.style.display = "none"
      showSuccessMessage(profileSuccess, "Perfil actualizado")
      loadUserProfile(currentUser.uid)
    })
    .catch((e) => {
      profileLoader.style.display = "none"
      showErrorMessage(profileError, "Error al guardar")
    })
}

// ————— Posts Functions —————
function createPost() {
  if (!isIndexPage || !currentUser) {
    return showErrorMessage(postError, "Debes iniciar sesión")
  }

  const title = postTitle.value.trim()
  const content = postContent.value.trim()
  const topic = postTopic.value.trim()

  if (!title) {
    return showErrorMessage(postError, "Título obligatorio")
  }
  if (!content) {
    return showErrorMessage(postError, "Contenido obligatorio")
  }
  if (!topic) {
    return showErrorMessage(postError, "Debes seleccionar un tema")
  }

  postsLoader.style.display = "block"
  hideMessages()

  getDoc(doc(db, "users", currentUser.uid))
    .then((docSnapshot) => {
      // Si no existe, usamos los datos de currentUser
      const u = docSnapshot.exists() ? docSnapshot.data() : {}
      const authorName = u.displayName || currentUser.displayName || "Usuario anónimo"
      const authorPhotoURL = u.photoURL || currentUser.photoURL || ""

      const newPost = {
        title,
        content,
        topic,
        topicName: topicMap[topic],
        createdAt: serverTimestamp(),
        authorId: currentUser.uid,
        authorName,
        authorPhotoURL,
      }

      return addDoc(collection(db, "posts"), newPost)
    })
    .then(() => {
      postsLoader.style.display = "none"
      showSuccessMessage(postSuccess, "Publicado correctamente")
      postTitle.value = ""
      postContent.value = ""
      postTopic.value = ""
      loadPosts(currentTab, currentFilter, searchQuery)
    })
    .catch((error) => {
      postsLoader.style.display = "none"
      console.error("Error al crear publicación:", error)
      showErrorMessage(postError, "Error al publicar. Inténtalo de nuevo.")
    })
}

function loadPosts(tab, topicFilter, query) {
  if (!isIndexPage) return

  postsList.innerHTML = ""
  postsLoader.style.display = "block"

  let q = query(collection(db, "posts"), orderBy("createdAt", "desc"))

  // Filtrar por autor si es necesario
  if (tab === "my" && currentUser) {
    q = query(q, where("authorId", "==", currentUser.uid))
  }

  // Filtrar por tema si es necesario
  if (topicFilter !== "all") {
    q = query(q, where("topic", "==", topicFilter))
  }

  getDocs(q)
    .then((snap) => {
      postsLoader.style.display = "none"

      if (snap.empty) {
        return (postsList.innerHTML = '<p style="text-align:center;color:#666">No hay posts.</p>')
      }

      let posts = []
      snap.forEach((d) => {
        posts.push({ id: d.id, ...d.data() })
      })

      // Filtrar por búsqueda si hay una consulta
      if (query) {
        const queryLower = query.toLowerCase()
        posts = posts.filter(
          (p) =>
            p.title.toLowerCase().includes(queryLower) ||
            p.content.toLowerCase().includes(queryLower) ||
            (p.topicName && p.topicName.toLowerCase().includes(queryLower)),
        )
      }

      if (posts.length === 0) {
        return (postsList.innerHTML =
          '<p style="text-align:center;color:#666">No hay resultados para esta búsqueda.</p>')
      }

      posts.forEach((p) => {
        const date = p.createdAt?.toDate().toLocaleString() || ""
        const div = document.createElement("div")
        div.className = "post-item"

        div.innerHTML = `
                    <div class="post-header">
                        <img class="post-author-photo" src="${p.authorPhotoURL}" alt="">
                        <span class="post-author-name">${p.authorName}</span>
                        <span class="post-date">${date}</span>
                    </div>
                    ${p.topicName ? `<span class="post-topic">${p.topicName}</span>` : ""}
                    <h3 class="post-title">${p.title}</h3>
                    <p class="post-content">${p.content}</p>
                `

        const btn = document.createElement("a")
        btn.href = `post.html?id=${p.id}`
        btn.textContent = "Responder"
        btn.className = "btn-save"
        btn.style.marginTop = "10px"
        btn.style.display = "inline-block"

        div.appendChild(btn)
        postsList.appendChild(div)
      })
    })
    .catch((e) => {
      postsLoader.style.display = "none"
      postsList.innerHTML = '<p style="text-align:center;color:#c62828">Error al cargar.</p>'
      console.error("Error al cargar posts:", e)
    })
}

// ————— Post Detail Page Functions —————
function loadPost(id) {
  if (!isPostPage) return

  getDoc(doc(db, "posts", id)).then((docSnapshot) => {
    if (!docSnapshot.exists()) return
    const p = docSnapshot.data()
    postElement.innerHTML = `
            <div class="post-title">${p.title}</div>
            <div class="post-content">${p.content}</div>
            <div style="color: #888">Por ${p.authorName}</div>
        `
  })
}

function listenToComments(postId) {
  if (!isPostPage) return

  const container = commentsElement
  const order = orderSelect.value

  // Detener anterior listener si existe
  if (unsubscribeComments) unsubscribeComments()

  unsubscribeComments = onSnapshot(
    query(collection(db, "posts", postId, "comments"), orderBy("createdAt", order)),
    (snapshot) => {
      container.innerHTML = ""
      if (snapshot.empty) {
        container.innerHTML = "<p style='color:#888'>No hay comentarios aún.</p>"
        return
      }

      snapshot.forEach((docSnapshot) => {
        const c = docSnapshot.data()
        const cid = docSnapshot.id
        const date = c.createdAt?.toDate().toLocaleString() || ""
        const div = document.createElement("div")
        div.className = "comment"
        div.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:5px;">
                        <img src="${c.authorPhotoURL || "https://via.placeholder.com/40"}"
                             style="width:40px;height:40px;border-radius:50%;object-fit:cover;">
                        <div>
                            <strong>${c.authorName}</strong><br>
                            <small style="color:#888;">${date}</small>
                        </div>
                    </div>
                    <div style="margin-left:50px;" id="text-${cid}">${c.text}</div>
                    ${
                      currentUser && currentUser.uid === c.authorId
                        ? `
                            <div style="margin-left:50px; margin-top:5px;">
                                <button class="btn-small edit-btn" onclick="editComment('${cid}', \`${c.text.replace(/`/g, "\\`")}\`)">✏️ Editar</button>
                                <button class="btn-small delete-btn" onclick="deleteComment('${cid}')">🗑 Eliminar</button>
                            </div>
                        `
                        : ""
                    }
                `
        container.appendChild(div)
      })
    },
  )
}

function addComment() {
  if (!isPostPage) return

  const postId = new URLSearchParams(location.search).get("id")
  const text = newCommentElement.value.trim()

  if (!text || !currentUser) return alert("Debes iniciar sesión y escribir un comentario.")

  addDoc(collection(db, "posts", postId, "comments"), {
    text: text,
    createdAt: serverTimestamp(),
    authorId: currentUser.uid,
    authorName: currentUser.displayName,
    authorPhotoURL: currentUser.photoURL || "",
  }).then(() => {
    newCommentElement.value = ""
  })
}

function editComment(commentId, oldText) {
  if (!isPostPage) return

  const postId = new URLSearchParams(location.search).get("id")
  const newText = prompt("Editar comentario:", oldText)

  if (newText !== null) {
    updateDoc(doc(db, "posts", postId, "comments", commentId), {
      text: newText,
      editedAt: serverTimestamp(),
    })
  }
}

function deleteComment(commentId) {
  if (!isPostPage) return

  const postId = new URLSearchParams(location.search).get("id")
  const confirmDelete = confirm("¿Seguro que deseas eliminar este comentario?")

  if (confirmDelete) {
    deleteDoc(doc(db, "posts", postId, "comments", commentId))
  }
}

// ————— Utility Functions —————
function hideMessages() {
  if (isIndexPage) {
    ;[postError, postSuccess, profileError, profileSuccess].forEach((el) => {
      if (el) el.style.display = "none"
    })
  }
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

// ————— Event Listeners —————
function setupEventListeners() {
  // Common event listeners for both pages
  onAuthStateChanged(auth, handleAuthStateChange)

  if (isIndexPage) {
    // Index page event listeners
    btnHeaderLogin.addEventListener("click", loginWithGoogle)
    btnMainLogin.addEventListener("click", loginWithGoogle)
    btnLogout.addEventListener("click", () => signOut(auth))

    navHome.addEventListener("click", () => showSection("welcome"))
    navProfile.addEventListener("click", () => showSection("profile"))
    navForum.addEventListener("click", () => showSection("forum"))

    btnSaveProfile.addEventListener("click", saveProfile)
    btnCreatePost.addEventListener("click", createPost)

    tabAllPosts.addEventListener("click", () => {
      currentTab = "all"
      tabAllPosts.classList.add("active")
      tabMyPosts.classList.remove("active")
      loadPosts(currentTab, currentFilter, searchQuery)
    })

    tabMyPosts.addEventListener("click", () => {
      currentTab = "my"
      tabMyPosts.classList.add("active")
      tabAllPosts.classList.remove("active")
      loadPosts(currentTab, currentFilter, searchQuery)
    })

    btnSearch.addEventListener("click", () => {
      searchQuery = searchInput.value.trim()
      loadPosts(currentTab, currentFilter, searchQuery)
    })

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        searchQuery = searchInput.value.trim()
        loadPosts(currentTab, currentFilter, searchQuery)
      }
    })

    filterChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        filterChips.forEach((c) => c.classList.remove("active"))
        chip.classList.add("active")
        currentFilter = chip.dataset.topic
        loadPosts(currentTab, currentFilter, searchQuery)
      })
    })
  } else if (isPostPage) {
    // Post page event listeners
    btnAddComment.addEventListener("click", addComment)

    orderSelect.addEventListener("change", () => {
      const postId = new URLSearchParams(location.search).get("id")
      if (postId) {
        listenToComments(postId)
      }
    })
  }
}

// ————— Initialization —————
document.addEventListener("DOMContentLoaded", () => {
  initializeDOMReferences()
  setupEventListeners()

  if (isIndexPage) {
    showSection("welcome")
  }

  // Make functions available globally for inline event handlers
  if (isPostPage) {
    window.addComment = addComment
    window.editComment = editComment
    window.deleteComment = deleteComment
  }
})
