import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4 animate-climb">
          🏔️ Mont Seraph
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          L'Ascension des Cieux - Challenge de Code Collaboratif
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">📜 Histoire</h2>
          <p className="text-gray-300 mb-4">
            Le Mont Seraph, une montagne mythique invisible aux yeux des simples mortels,
            cache un savoir ancien qui pourrait transformer l'humanité. Seuls ceux capables
            de surmonter les épreuves les plus difficiles peuvent espérer atteindre son sommet.
          </p>
          <p className="text-gray-300">
            Vous êtes un groupe de quatre grimpeurs d'élite, chacun ayant une spécialité unique.
            Ensemble, vous devez affronter le Mont Seraph, mais une règle vitale doit être respectée :
            personne ne grimpe seul.
          </p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold mb-4">🎯 Règles du Jeu</h2>
          <ul className="text-gray-300 space-y-2">
            <li>• Chaque niveau dure 3 minutes</li>
            <li>• Les joueurs doivent communiquer pour résoudre les énigmes</li>
            <li>• Chaque joueur a besoin d'un indice d'un autre joueur</li>
            <li>• Les soumissions de code doivent être synchronisées</li>
            <li>• Une erreur ou une désynchronisation fait recommencer le niveau</li>
            <li>• Le jeu se termine après 5 niveaux réussis</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/player1" className="btn btn-primary">
          Joueur 1 - Le Calculateur d'Angles
        </Link>
        <Link to="/player2" className="btn btn-primary">
          Joueur 2 - Le Calculateur de Force
        </Link>
        <Link to="/player3" className="btn btn-primary">
          Joueur 3 - Le Physicien
        </Link>
        <Link to="/player4" className="btn btn-primary">
          Joueur 4 - Le Vérificateur de Stabilité
        </Link>
      </div>

      <div className="mt-12 text-center text-gray-400">
        <p>Choisissez votre rôle et commencez l'ascension du Mont Seraph</p>
      </div>
    </div>
  );
}

export default Home; 