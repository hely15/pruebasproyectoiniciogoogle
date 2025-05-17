// Import the Firebase SDK
import firebase from "firebase/app"
import "firebase/auth"
import "firebase/firestore"

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
firebase.initializeApp(firebaseConfig)

// Exportar servicios de Firebase
const auth = firebase.auth()
const db = firebase.firestore()

// Mapeo de IDs de temas a nombres
const topicMap = {
  1: "Infraestructura del Internet",
  2: "Protocolos de Comunicación",
  3: "Funcionamiento de la Web",
  4: "APIs y Servicios Web",
  5: "Seguridad y Buenas Prácticas",
}
