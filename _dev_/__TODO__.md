* Concernant la version 0.3 du programme
  - empêcher le traitement actuel du texte au démarrage. Tout ce qu'il y a à faire, c'est le charger et le mettre dans le champ UI.workingField et de lancer la boucle de surveillance
  - un bouton pour interrompre la boucle ou plutôt basculer de l'analyse en boucle ou sur commande
  - surveiller les touches pressées dans UI.workingField pour empêcher le check lorsque l'on est en train d'écrire
  - Ne prendre que la section de texte visible +- le nombre de caractères définis par l'indice de proximité choisi (1500 par défaut)

* Pour un texte scrivener :
  * Quand on se fiche de perdre les métadonnées et autres :
    * le composer en un document unique avec un délimiteur de page précis
    * le corriger dans Proximit
    * le recharger dans le projet en le découpant suivant les marques (un nouveau document sera créé pour chaque portion)
    Le problème avec ce système, c'est qu'on perd complètement les autres informations, un projet est entièrement reconstruit.
  * Quand on veut garder les méta-données
    * composer le document unique en lisant à l'intérieur du projet Scrivener
      - mais chaque fichier a été mis dans un fichier séparé
    * travailler ce document dans proximit
    * le recharger dans Scrivener après modification
    - Pour faire le lien entre les documents texte et les documents Scrivener :
      * on garde les documents par index (le document 0, le document 1, 2, etc.)
      * l'index du document étant enregistré avec le mot, on peut connaitre le premier mot du document et le reconstituer en cherchant les mot.idN tant que l'index du document est le même
      OU : ne marquer que le premier mot, étant donné que maintenant, on n'a besoin de connaitre l'index du document seulement au moment de sa reconstitution, puisqu'on travaille les portions de texte à partir de la liste des mots, qui fait office de référence maintenant.
