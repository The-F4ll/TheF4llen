import { Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import PlayerBase from './components/PlayerBase'
import WaitingRoom from './components/WaitingRoom'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/waiting-room/:playerNumber" element={<WaitingRoom />} />
      <Route path="/player/:playerNumber" element={<PlayerBase />} />
    </Routes>
  )
}

export default App
