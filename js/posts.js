// Import necessary modules (assuming these are available globally or defined elsewhere)
// For example:
import { getUrlParameter, auth, db, firebase } from './utils';

// If the modules are not available as imports, you can define them or retrieve them from the global scope.
// Example (if they are globally available):
const getUrlParameter = (param) => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(param)
}
const auth = firebase.auth() // Assuming firebase is globally available
const db = firebase.firestore() // Assuming firebase is globally available

// Variables para la página de post
const postId = getUrlParameter("id")
let currentUser = null
let unsubscribeComments = null

// Referencias DOM
const postContainer = document.getElementById("post")
const commentsContainer = document.getElementById("comments")
const newCommentInput = document.getElementById("new-comment")
const btnAddComment = document.getElementById("btnAddComment")
const orderSelect = document.getElementById("orderSelect")

// Escuchar cambios en el estado de autenticación
auth.onAuthStateChanged((user) => {
  currentUser = user
  if (postId) {
    loadPost(postId)
    listenToComments(postId)
  }
})

// Cargar detalles del post
function loadPost(id) {
  db.collection("posts")
    .doc(id)
    .get()
    .then((doc) => {
      if (!doc.exists) return
      const p = doc.data()
      postContainer.innerHTML = `
      <div class="post-title">${p.title}</div>
      <div class="post-content">${p.content}</div>
      <div style="color: #888">Por ${p.authorName}</div>
    `
    })
}

// Escuchar cambios en los comentarios
function listenToComments(postId) {
  const order = orderSelect.value

  // Detener anterior listener si existe
  if (unsubscribeComments) unsubscribeComments()

  unsubscribeComments = db
    .collection("posts")
    .doc(postId)
    .collection("comments")
    .orderBy("createdAt", order)
    .onSnapshot((snapshot) => {
      commentsContainer.innerHTML = ""
      if (snapshot.empty) {
        commentsContainer.innerHTML = "<p style='color:#888'>No hay comentarios aún.</p>"
        return
      }

      snapshot.forEach((doc) => {
        const c = doc.data()
        const cid = doc.id
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
        commentsContainer.appendChild(div)
      })
    })
}

// Añadir un comentario
function addComment() {
  const text = newCommentInput.value.trim()
  if (!text || !currentUser) return alert("Debes iniciar sesión y escribir un comentario.")

  db.collection("posts")
    .doc(postId)
    .collection("comments")
    .add({
      text: text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      authorId: currentUser.uid,
      authorName: currentUser.displayName,
      authorPhotoURL: currentUser.photoURL || "",
    })
    .then(() => {
      newCommentInput.value = ""
    })
}

// Editar un comentario
function editComment(commentId, oldText) {
  const newText = prompt("Editar comentario:", oldText)
  if (newText !== null) {
    db.collection("posts").doc(postId).collection("comments").doc(commentId).update({
      text: newText,
      editedAt: firebase.firestore.FieldValue.serverTimestamp(),
    })
  }
}

// Eliminar un comentario
function deleteComment(commentId) {
  const confirmDelete = confirm("¿Seguro que deseas eliminar este comentario?")
  if (confirmDelete) {
    db.collection("posts").doc(postId).collection("comments").doc(commentId).delete()
  }
}

// Event listeners
if (orderSelect) {
  orderSelect.addEventListener("change", () => {
    if (postId) {
      listenToComments(postId)
    }
  })
}

if (btnAddComment) {
  btnAddComment.addEventListener("click", addComment)
}

// Exponer funciones para uso en HTML
window.editComment = editComment
window.deleteComment = deleteComment
