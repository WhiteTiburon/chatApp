import Register from "./RegisterAndLoginForm"
import axios from "axios"
import { UserContext } from "./UserContext"
import { useContext } from "react"
import Chat from "./Chat"

// changed port to match google
// axios.defaults.baseURL = 'http://localhost:8080'
axios.defaults.baseURL = 'https://chat.jonatech.cloud'
axios.defaults.withCredentials = true

function App() {
  const { username, id } = useContext(UserContext)

  if ( username ) {
    return <Chat/>
  }else{
    return (
      <Register/>
    )
  }
}

export default App
