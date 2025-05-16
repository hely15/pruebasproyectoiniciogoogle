// Referencias DOM para posts
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

// Variables para el estado actual
let currentTab = "all"
let currentFilter = "all"
let searchQuery = ""

// Declaración de variables faltantes
let db // Firebase database instance
let currentUser // Current logged-in user
let showErrorMessage // Function to display error messages
let hideMessages // Function to hide messages
const topicMap = {} // Map of topic IDs to names
let firebase // Firebase instance
let showSuccessMessage // Function to display success messages

// Función para cargar posts
function loadPosts(tab, topicFilter, query) {
  if (!postsList) return

  postsList.innerHTML = ""
  if (postsLoader) postsLoader.style.display = "block"

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
      if (postsLoader) postsLoader.style.display = "none"

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
      if (postsLoader) postsLoader.style.display = "none"
      postsList.innerHTML = '<p style="text-align:center;color:#c62828">Error al cargar.</p>'
      console.error("Error al cargar posts:", e)
    })
}

// Event listener para crear post
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

    if (postsLoader) postsLoader.style.display = "block"
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
        if (postsLoader) postsLoader.style.display = "none"
        showSuccessMessage(postSuccess, "Publicado correctamente")
        if (postTitle) postTitle.value = ""
        if (postContent) postContent.value = ""
        if (postTopic) postTopic.value = ""
        loadPosts(currentTab, currentFilter, searchQuery)
      })
      .catch((error) => {
        if (postsLoader) postsLoader.style.display = "none"
        console.error("Error al crear publicación:", error)
        showErrorMessage(postError, "Error al publicar. Inténtalo de nuevo.")
      })
  })
}

// Event listeners para filtros de pestañas
if (tabAllPosts) {
  tabAllPosts.addEventListener("click", () => {
    currentTab = "all"
    tabAllPosts.classList.add("active")
    if (tabMyPosts) tabMyPosts.classList.remove("active")
    loadPosts(currentTab, currentFilter, searchQuery)
  })
}

if (tabMyPosts) {
  tabMyPosts.addEventListener("click", () => {
    currentTab = "my"
    tabMyPosts.classList.add("active")
    if (tabAllPosts) tabAllPosts.classList.remove("active")
    loadPosts(currentTab, currentFilter, searchQuery)
  })
}

// Event listener para búsqueda
if (btnSearch) {
  btnSearch.addEventListener("click", () => {
    searchQuery = searchInput.value.trim()
    loadPosts(currentTab, currentFilter, searchQuery)
  })
}

// Permitir búsqueda al presionar Enter
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
