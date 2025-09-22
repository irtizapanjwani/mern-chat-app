import { useChat } from './context/ChatContext'
import Login from './components/Login'
import Chat from './components/Chat'

function App() {
  const { user } = useChat();

  return (
    <div className="App">
      {!user ? (
        <Login />
      ) : (
        <Chat />
      )}
    </div>
  )
}

export default App