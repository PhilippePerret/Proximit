* Mettre en place l'édition pour copier/coller etc.

* Poursuivre le test sur la destruction d'un mot
  - prochain : un mot avant mais trop loin pour créé une proximité (donc : le mot à supprimer doit être assez près de ce mot avant pour créer la proximité, mais ce mot avant doit être trop loin du mot suivant du mot supprimé).

* [BUG] Quand on demande à ignorer une proximité, il faut vérifier que cela ne provoque pas une nouvelle proximité par "saut". Par exemple, si on supprime la deuxième proximité de "un texte dans le texte pour un texte", est-ce qu'il ne faut pas que le premier et le troisième "texte" soit mis en proximité ? Ce serait en tout cas important de prévenir l'auteur.
  -> faire un test pour tester ce cas précis.

* Pouvoir lire le texte (commande 'say')

* Poursuivre les tests de l'enregistrement des données modifiées
  - corriger le test qui ne passe pas
  - vérifier la validité des fichiers de données

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
