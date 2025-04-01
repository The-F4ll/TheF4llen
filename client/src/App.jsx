import { Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Player1 from './components/Player1'
import Player2 from './components/Player2'
import Player3 from './components/Player3'
import Player4 from './components/Player4'

function App() {
  return (
    <div className="mountain-bg">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/player1" element={<Player1 />} />
        <Route path="/player2" element={<Player2 />} />
        <Route path="/player3" element={<Player3 />} />
        <Route path="/player4" element={<Player4 />} />
      </Routes>
    </div>
  )
}

export default App
