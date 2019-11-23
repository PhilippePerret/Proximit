ESSAI AUTREMENT :
  – Repart au départ : on analyse tout le texte avec analyse_texte.rb puis on
    le remonte.


ESSAI DE TRAVAIL AVEC text-buffer, d'Atom
  ÇA NE FONCTIONNE PAS : JE N'ARRIVE PAS À TÉLÉCHARGER LE PACKAGE

POURSUIVRE AVEC :
  - enregistrer vraiment la page comme elle est (il faut la reprendre, comme pour le check => faire une méthode indépendante => procédure de récupération du texte)
  - renseigner l'aide (CMD+U pour checker la page)
  - mémoriser quand la page est modifiée pour le signaler quand on veut changer de page


* Pouvoir suivre les modifications et actualiser les proximités

* Pouvoir mémoriser les proximités traitées

* Implémenter la jauge/préférence qui doit permettre :
  - de définir la distance maximale (empan)
  - l'unité de distance (mots ou caractères)

* Concernant la version 0.3 du programme
  - création des instances MyParagraph
    - mettre dans l'instance l'index du premier caractère (relatif) des paragraphes
      (index paragraphe = index relatif + index page)
      (penser à les actualiser à chaque modification)

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
