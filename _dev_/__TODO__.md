* Poursuivre le test sur la destruction d'un mot

* Quand on ré-analyse le texte, il faut détruire l'intégralité des fichiers d'analyse (en particulier ceux produits avec ruby)
  - avant de le faire, il faut cependant demander confirmation lorsqu'il y a déjà eu un travail conséquent sur le texte, au niveau des corrections de proximités.

* Il faudra traiter la répétition de "cette" (canon "ce") dans 'inside_tests_04.txt'. En fait, il faut prendre la longueur du mot réel, pour voir s'il faut le traiter, il ne faut pas prendre la longueur de son canon.
* Bouton pour voir toutes les proximités visibles dans la fenêtre
  - Il est installé, il faut le rendre efficace.

* Maintenant que le versionning est géré, mémoriser la date de la dernière version et faire une
  alerte lorsque la dernière version est lointaine.

* Mettre en place une procédure d'avertissement si l'on ferme ou recharge l'application et que le texte est modifié.

* [BUG] Quand on demande à ignorer une proximité, il faut vérifier que cela ne provoque pas une nouvelle proximité par "saut". Par exemple, si on supprime la deuxième proximité de "un texte dans le texte pour un texte", est-ce qu'il ne faut pas que le premier et le troisième "texte" soit mis en proximité ? Ce serait en tout cas important de prévenir l'auteur.
  -> faire un test pour tester ce cas précis.

* [BUG] Quand on charge un nouveau texte il faut nettoyer l'inferface
  - vider UI.texte
  - vider UI.infos_current_proximity
  - Autre ?

* Pouvoir voir toutes les proximités "à proximité" (l'espace de texte affiché)
  => Trouver un moyen de déterminer le premier mot et le dernier mot affichés

* Pouvoir lire le texte (commande 'say')

* Maintenant qu'on a tout le texte :
  - Rendre visible (dans la fenêtre) la proximité choisie
  - corriger le bug qui fait que tout le texte n'est pas affiché (en fait, quand un mot ne peut pas être analysé, il est quand même mis en mot suivant du précédent et ça coupe complètement la chaine — c'est arrivé avec un mot qui était un chiffre (les chiffres sont maintenant pris en compte et c'et arrivé avec un mot vide à cause de deux apostrophes qui se suivaient))

* Peut-être qu'à l'avenir, avec les grands textes, on pourra fonctionner en n'en affichant qu'une partie. Mais garder beaucoup autour, afin de toujours donner l'impression qu'on a la totalité

* Poursuivre les tests de l'enregistrement des données modifiées
  - corriger le test qui ne passe pas
  - vérifier la validité des fichiers de données


* Poursuivre la procédure de correction d'une proximité (en la testant au fur et à mesure)

* Étudier les cas de modification dans le document "Reflexions.md" > « Principe lors de la modification d'une proximité »

* # Quand on redemande l'analyse du texte, il semble que la précédente reste là. Il faut tout recharger après une analyse du texte courant ouvert.

* # Lorsqu'un texte est enregistré comme dernier texte, mais que son analyse a été détruite, ça plante. Il faut donc vérifier, en rechargeant le texte, pour voir si son dossier prox existe toujours.

* Sous les boutons de navigation parmi les proximmités, il faut ajouter des cases à cocher permettant de changer l'effet du bouton "suivant" (et autres aussi). On doit pouvoir :
  - par défaut, on passe d'un mot à l'autre en suivant l'ordre des proximités
  - passer par chaque mot d'un canon (celui du mot actuel). Par exemple, si le canon est "texte" et qu'on coche cette cas, il faut afficher toutes les proximités du mot canon "texte"
  - un mode aléatoire qui permettent de passer d'une proximité à l'autre au hasard

* Parfois, il faut pouvoir modifier tous les mots du texte => Offrir la possibilité de mettre tous les mots en édition. Cela consistera à les mettre tous dans des spans et à mettre leur contentEditable à true (voir s'il ne serait pas plus facile de tout mettre dans un textarea et de recalculer tout par rapport au texte modifié — mais là, on perdrait tous les liens entre ID et mot)
  => Faire ça de manière graduelle, c'est-à-dire en éditant d'abord les mots autour
  Noter que les mots autour n'ont pas encore d'identifiant, qu'il faut les repérer depuis leur décalage, mais que si on ajoute des mots, l'identifiant est perdu
  Est-ce qu'il ne faudrait pas toujours reconstituer le texte à partir des identifiants de mots ? Le problème de cette méthode est la gestion des ponctuations et autres signes qui ne sont pas des mots. peut-être qu'on pourrait toujours enregistrer l'inter avec le mot ! ce serait une de ses caractéristiques, ce qui permettrait de toujours savoir ce qu'il y a après

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
