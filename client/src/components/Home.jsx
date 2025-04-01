import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Home() {
  const navigate = useNavigate();

  const handleRoleSelect = (playerNumber) => {
    navigate(`/waiting-room/${playerNumber}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">TheF4llen</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Joueur 1 */}
          <button
            onClick={() => handleRoleSelect(1)}
            className="bg-blue-600 hover:bg-blue-700 p-6 rounded-lg text-center transition-colors duration-200"
          >
            <h2 className="text-2xl font-bold mb-2">Joueur 1</h2>
            <p className="text-gray-300">Le Calculateur d'Angles</p>
          </button>

          {/* Joueur 2 */}
          <button
            onClick={() => handleRoleSelect(2)}
            className="bg-green-600 hover:bg-green-700 p-6 rounded-lg text-center transition-colors duration-200"
          >
            <h2 className="text-2xl font-bold mb-2">Joueur 2</h2>
            <p className="text-gray-300">Le Calculateur de Force</p>
          </button>

          {/* Joueur 3 */}
          <button
            onClick={() => handleRoleSelect(3)}
            className="bg-purple-600 hover:bg-purple-700 p-6 rounded-lg text-center transition-colors duration-200"
          >
            <h2 className="text-2xl font-bold mb-2">Joueur 3</h2>
            <p className="text-gray-300">Le Physicien</p>
          </button>

          {/* Joueur 4 */}
          <button
            onClick={() => handleRoleSelect(4)}
            className="bg-red-600 hover:bg-red-700 p-6 rounded-lg text-center transition-colors duration-200"
          >
            <h2 className="text-2xl font-bold mb-2">Joueur 4</h2>
            <p className="text-gray-300">Le Vérificateur de Stabilité</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home; 