*
* Parfois, il faut pouvoir modifier tous les mots du texte => Offrir la possibilité de mettre tous les mots en édition. Cela consistera à les mettre tous dans des spans et à mettre leur contentEditable à true (voir s'il ne serait pas plus facile de tout mettre dans un textarea et de recalculer tout par rapport au texte modifié — mais là, on perdrait tous les liens entre ID et mot)
  => Faire ça de manière graduelle, c'est-à-dire en éditant d'abord les mots autour
  Noter que les mots autour n'ont pas encore d'identifiant, qu'il faut les repérer depuis leur décalage, mais que si on ajoute des mots, l'identifiant est perdu
  Est-ce qu'il ne faudrait pas toujours reconstituer le texte à partir des identifiants de mots ? Le problème de cette méthode est la gestion des ponctuations et autres signes qui ne sont pas des mots. peut-être qu'on pourrait toujours enregistrer l'inter avec le mot ! ce serait une de ses caractéristiques, ce qui permettrait de toujours savoir ce qu'il y a après
  Mais ensuite, il faut conserver une liste des identifiants qui constitue le texte, en sachant qu'on peut en ajouter :

  Au départ, les mots et leur identifiant :

    Un simple texte assez long texte pour voir.
    0   1       2     3     4     5   6     7

    Le texte est : [0,1,2,3,4,5,6,7]
    Ou alors, plus simple, on enregistre les index des mots précédents et mots suivants dans les données du mot, ce qui permet de ne jamais avoir à tenir à jour de liste pour le texte.
    Contrainte : gestion quand on retire un mot, quand on l'ajoute, il faut faire plusieurs corrections.
    => Pour reconstruire un texte, il faut connaitre le premier mot (c'est celui dont le 'idN' est null, ce qu'on peut savoir lorsque l'on crée les instances au tout départ). Le dernier, bien sûr, est le mot dont le 'idP' est null.

    MORALITÉ : ajouter trois propriété aux mots :
      - text_after:   Le texte, par exemple une ponctuation, après le texte
      - idN:      Identifiant/index du mot suivant
      - idP:      Identifiant/index du mot précédent
      (note : c'est seulement au départ qu'on parle d'index. Ensuite, si on ajoute un mot, ce sera un identifiant qui ne correspondra plus du tout à l'index)

* Pour un texte scrivener :
  * Quand on se ficher de perdre les métadonnées et autres :
    * le composer en un document unique avec un délimiteur de page précis
    * le corriger dans Proximit
    * le recharger dans le projet en le découpant suivant les marques
    Le problème avec ce système, c'est qu'on perd complètement les autres informations, un projet est entièrement reconstruit.
  * Quand on veut garder les méta-données
    * composer le document unique en lisant à l'intérieur du projet Scrivener
    * travailler ce document dans proximit
    * le recharger dans Scrivener après modification
    - Le problème ici qui se pose est de savoir comment on garde le lien entre les documents originaux et les documents dans Scrivener :
      * on garde les documents par index (le document 0, le document 1, 2, etc.)
      * on utilise une marque de découpage courte (pour qu'elle n'influence pas les calculs). Ou alors, au lieu de travailler avec un seul document, on travaille avec plusieurs, autant que de fichiers scrivener, et dans ce cas on ne perd rien. C'est juste la récupération du texte au cours du travail qui est plus compliqué, si les textes ne sont pas intégralement chargés.
