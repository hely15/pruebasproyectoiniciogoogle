// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCL2CctB5ULQg2tkWKKTX20-Aot0aGsVYw",
  authDomain: "registrocon-97cb2.firebaseapp.com",
  projectId: "registrocon-97cb2",
  storageBucket: "registrocon-97cb2.firebasestorage.app",
  messagingSenderId: "373644979789",
  appId: "1:373644979789:web:5b08ef46eb8852c59fb604",
  measurementId: "G-X5Q3RL90PV",
}

// Inicializar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js"
import { getAuth } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js"

const app = initializeApp(firebaseConfig)

// Exportar servicios de Firebase
const auth = getAuth(app)
const db = getFirestore(app)

// Mapeo de IDs de temas a nombres
const topicMap = {
  1: "Infraestructura del Internet",
  2: "Protocolos de Comunicación",
  3: "Funcionamiento de la Web",
  4: "APIs y Servicios Web",
  5: "Seguridad y Buenas Prácticas",
}

// Funciones de utilidad para mensajes
function hideMessages() {
  const messageElements = [
    document.getElementById("postError"),
    document.getElementById("postSuccess"),
    document.getElementById("profileError"),
    document.getElementById("profileSuccess"),
  ]

  messageElements.forEach((el) => {
    if (el) el.style.display = "none"
  })
}

function showErrorMessage(el, msg) {
  if (el) {
    el.textContent = msg
    el.style.display = "block"
  }
}

function showSuccessMessage(el, msg) {
  if (el) {
    el.textContent = msg
    el.style.display = "block"
  }
}

// Variable global para el usuario actual
const currentUser = null
