// Variables globales para el foro
let currentTab = "all"
let currentFilter = "all"
let searchQuery = ""
const currentUser = null // Declarar currentUser
const topicMap = {} // Declarar topicMap

// Referencias DOM para el foro
const postTitle = document.getElementById("postTitle")
const postTopic = document.getElementById("postTopic")
const postContent = document.getElementById("postContent")
const btnCreatePost = document.getElementById("btnCreatePost")
const postsList = document.getElementById("postsList")
const postsLoader = document.getElementById("postsLoader")
const tabAllPosts = document.getElementById("tabAllPosts")
const tabMyPosts = document.getElementById("tabMyPosts")
const postError = document.getElementById("postError")
const postSuccess = document.getElementById("postSuccess")
const searchInput = document.getElementById("searchInput")
const btnSearch = document.getElementById("btnSearch")
const filterChips = document.querySelectorAll(".filter-chip")

// Función para mostrar mensajes de error
function showErrorMessage(element, message) {
  element.textContent = message
  element.style.display = "block"
}

// Función para mostrar mensajes de éxito
function showSuccessMessage(element, message) {
  element.textContent = message
  element.style.display = "block"
}

// Función para ocultar mensajes
function hideMessages() {
  postError.style.display = "none"
  postSuccess.style.display = "none"
}

// Inicializar Firebase (reemplaza con tu configuración)
const firebaseConfig = {
  // Tu configuración de Firebase aquí
  // apiKey: "...",
  // authDomain: "...",
  // projectId: "...",
  // storageBucket: "...",
  // messagingSenderId: "...",
  // appId: "..."
}

// firebase.initializeApp(firebaseConfig);
const db = firebase.firestore() // Inicializar Firestore

// Crear una nueva publicación
if (btnCreatePost) {
  btnCreatePost.addEventListener("click", () => {
    if (!currentUser) {
      showErrorMessage(postError, "Debes iniciar sesión")
      return
    }

    const title = postTitle.value.trim()
    const content = postContent.value.trim()
    const topic = postTopic.value.trim()

    if (!title) {
      showErrorMessage(postError, "Título obligatorio")
      return
    }
    if (!content) {
      showErrorMessage(postError, "Contenido obligatorio")
      return
    }
    if (!topic) {
      showErrorMessage(postError, "Debes seleccionar un tema")
      return
    }

    postsLoader.style.display = "block"
    hideMessages()

    db.collection("users")
      .doc(currentUser.uid)
      .get()
      .then((doc) => {
        // Si no existe, usamos los datos de currentUser
        const u = doc.exists ? doc.data() : {}
        const authorName = u.displayName || currentUser.displayName || "Usuario anónimo"
        const authorPhotoURL = u.photoURL || currentUser.photoURL || ""

        const newPost = {
          title,
          content,
          topic,
          topicName: topicMap[topic],
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          authorId: currentUser.uid,
          authorName,
          authorPhotoURL,
        }

        return db.collection("posts").add(newPost)
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
  })
}

// Cargar publicaciones
function loadPosts(tab, topicFilter, query) {
  if (!postsList) return

  postsList.innerHTML = ""
  postsLoader.style.display = "block"

  let q = db.collection("posts").orderBy("createdAt", "desc")

  // Filtrar por autor si es necesario
  if (tab === "my" && currentUser) {
    q = q.where("authorId", "==", currentUser.uid)
  }

  // Filtrar por tema si es necesario
  if (topicFilter !== "all") {
    q = q.where("topic", "==", topicFilter)
  }

  q.get()
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

// Event listeners para pestañas (Todas/Mis publicaciones)
if (tabAllPosts) {
  tabAllPosts.addEventListener("click", () => {
    currentTab = "all"
    tabAllPosts.classList.add("active")
    tabMyPosts.classList.remove("active")
    loadPosts(currentTab, currentFilter, searchQuery)
  })
}

if (tabMyPosts) {
  tabMyPosts.addEventListener("click", () => {
    currentTab = "my"
    tabMyPosts.classList.add("active")
    tabAllPosts.classList.remove("active")
    loadPosts(currentTab, currentFilter, searchQuery)
  })
}

// Event listeners para búsqueda
if (btnSearch) {
  btnSearch.addEventListener("click", () => {
    searchQuery = searchInput.value.trim()
    loadPosts(currentTab, currentFilter, searchQuery)
  })
}

if (searchInput) {
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchQuery = searchInput.value.trim()
      loadPosts(currentTab, currentFilter, searchQuery)
    }
  })
}

// Event listeners para filtros por tema
if (filterChips) {
  filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      // Desactivar todos los chips
      filterChips.forEach((c) => c.classList.remove("active"))

      // Activar el chip seleccionado
      chip.classList.add("active")

      // Actualizar filtro actual
      currentFilter = chip.dataset.topic

      // Recargar posts con el nuevo filtro
      loadPosts(currentTab, currentFilter, searchQuery)
    })
  })
}
