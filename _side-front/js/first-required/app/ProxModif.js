'use strict';
/**
  |
  | Class ProxModif
  | ------------
  | Gestion des modifications de proximité
  |
**/
class ProxModif {
  // Instanciation avec l'instance {Mot} du mot modifié, et {String} la valeur
  // du nouveau mot.
  // Note : avant d'appeler cette instanciation, il faut s'assurer que les
  // mots sont différents.
  constructor(imot, new_mot){
    this.imot     = imot
    this.new_mot  = new_mot
  }

  /**
    On procède à l'analyse de ce changement, c'est-à-dire l'impact qu'il
    aurait sur le texte actuel (création d'une nouvelle proximité par
    exemple ou absence de modification — pour un mot différent mais qui
    appartiendrait au même canon)
  **/
  analyze(){
    try {
      // Faire la liste des mots de remplacement, s'il y en a plusieurs.
      // La méthode retourne une liste d'instance Mot, ce qui permet d'avoir tout
      // de suite ce qu'il faut au niveau des tbw, etc.
      let mots = split_new_mot()

      mots.forEach(inewmot => analyze_single_word(motstr) )
      // Pour chacun des mots, même s'il n'y en a qu'un seul, il faut faire le test

    } catch (e) {
      console.error(e)
      // error(e.message)
    }
  }

  analyze_single_word(motstr){
    // On doit par trouver le canon du nouveau mot. Qu'il existe ou non,
    // la méthode Canon.of retourne une instance de {Canon} nouvelle ou
    // créée.
    let canon_new_mot = Canon.of(new_mot)
    canon_new_mot.addMot(new_mot)
  }
}
