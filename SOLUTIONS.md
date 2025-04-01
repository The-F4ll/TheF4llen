<!-- Level 1  -->

Chaque joueur a une fonction appelée getNote() (ou équivalent) qui retourne une valeur textuelle. Le but est de reconstituer une suite logique.

          "Un joueur a une note fausse (volontairement trompeuse)",
          "Un joueur a une formule logique (playerIndex * 3)",
          "Un joueur a une information cryptée (ex : 21 → reverse → 12)",
          "Un joueur suit une fausse logique mathématique (ascii C → 67 / 3 = 22.33)"

       ➡️ Pour réussir, ils doivent comparer leurs réponses textuelles, repérer le leurre, et reconstruire une suite logique complète et cohérente : " 3, 6, 9, 12."

        Solution :
          "Repérer que le joueur 1 propose une valeur isolée ('2') qui ne suit aucun motif clair.",
          "Le joueur 2 donne une formule : 'playerIndex * 3' → en testant avec l’indice 1 à 4, on trouve 3, 6, 9, 12.",
          "Le joueur 3 fournit une explication cryptée : '21 → reverse → 12' → c’est cohérent avec une fin de séquence.",
          "Le joueur 4 croit avoir raison avec 'C = 67 → 67 / 3 = 22.33' → mais la valeur n’est pas entière, donc fausse."

"response": ["3", "6", "9", "12"]

<!-- Level 2  -->

Chaque joueur détient un indice fragmentaire sur l’identité de la créature mystique (Minotaure). Un seul joueur détient la vraie chaîne, mais elle est cachée.

        "Un joueur a une fausse créature ('Licorne') pour créer un leurre",
        "Un joueur détient l’identifiant ASCII 'M' (77)",
        "Un joueur possède un tableau de créatures avec des ID en lettres",
        "Un joueur lit une ancienne prophétie symbolique qui évoque le Minotaure"

➡️ En comparant les identifiants et les extraits narratifs, les joueurs doivent identifier que la créature gardienne est le Minotaure.

        Solution :
          "Le joueur 2 donne la lettre 'M', sans savoir à quoi elle correspond",
          "Le joueur 3 a un tableau de créatures, et associe 'M' à 'Minotaure'",
          "Le joueur 1 pense que c’est 'Licorne', mais c’est une fausse piste",
          "Le joueur 4 évoque une bête cornue enfermée dans un labyrinthe : allusion au Minotaure"

"response": "Minotaure"

<!-- Level 3  -->

Chaque joueur détient un fragment d’une incantation à reconstituer dans l’ordre.

        "Un joueur a une phrase poétique, mais mal placée ou fausse",
        "Un joueur a le début, un autre le milieu, un autre la fin",
        "Un joueur cache sa phrase dans un tableau de mots, et doit deviner sa position"

➡️ Ils doivent échanger leurs morceaux de phrases pour reconstituer une formule magique complète, dans l’ordre exact.

        Solution :
          "Début : 'Ouvrez la porte du' (joueur 2)",
          "Milieu : 'coeur du Mont Seraph, scellé dans la brume éternelle de la' (joueur 3)",
          "Le joueur 1 a une phrase redondante avec le joueur 3 mais incomplète",
          "Fin : 'lumière sacrée des anciens.' (joueur 4)"

"response": "Ouvrez la porte du coeur du Mont Seraph, scellé dans la brume éternelle de la lumière sacrée des anciens."

<!-- Level 4  -->

Chaque joueur détient une rune codée de manière différente : inversée, chiffrée, bruitée… Ils doivent deviner la bonne rune dans leur liste.

        "Un joueur possède un mot parmi des variantes proches ('Aurum', 'Umbralux')",
        "Un autre a des mots inversés ('susnetV')",
        "Un joueur calcule un code numérique qui correspond à une rune",
        "Un autre décode une rune à partir de valeurs hexadécimales"

➡️ À travers les comparaisons, chacun doit isoler **la rune authentique** qu’il détient, et tous la valider **en même temps**.

        Solution :
          "Joueur 1 choisit 'Aurum'",
          "Joueur 2 décrypte 'Ventus' à partir de 'susnetV'",
          "Joueur 3 calcule la rune correspondant à une valeur 558 → 'Glacies'",
          "Joueur 4 traduit ['0x4C', '0x75', '0x78'] → 'Lux'"

"response": ["Aurum", "Ventus", "Glacies", "Lux"]

<!-- Level 5  -->

Chaque joueur détient une partie du puzzle : mot, fragment, logique, ou fonction. Ensemble, ils doivent reformer un nom sacré.

        "Un joueur connaît le mot final, mais pas sa structure",
        "Un autre a une fonction à trou : part1 + ??? + part3",
        "Un joueur possède les bons liens (OfTheFrozen) dans une liste",
        "Le dernier assemble le tout une fois les bonnes infos obtenues"

➡️ En communiquant, ils doivent découvrir le bon lien, compléter la fonction, et valider le mot sacré : **GuardianOfTheFrozenPeak**.

        Solution :
          "Joueur 1 donne le mot final directement",
          "Joueur 2 attend la partie manquante (???), qu’il ne peut deviner seul",
          "Joueur 3 possède le bon lien ('OfTheFrozen') parmi plusieurs options",
          "Joueur 4 a la fonction complète pour assembler tous les fragments"

"response": "GuardianOfTheFrozenPeak"
