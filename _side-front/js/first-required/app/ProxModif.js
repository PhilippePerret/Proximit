'use strict';
/**
  |
  | Class ProxModif
  | ------------
  | Gestion des modifications de proximité
  |
**/
class ProxModif {
  static get current()  { return this._current }
  static set current(v) { this._current = v }
  // Instanciation avec l'instance {Mot} du mot modifié, et {String} la valeur
  // du nouveau mot.
  // Note : avant d'appeler cette instanciation, il faut s'assurer que les
  // mots sont différents.
  constructor(imot, newText){
    this.imot     = imot
    this.newText  = newText
    this.constructor.current = this
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
      let mots = this.newText.split(' ') // pour le moment

      mots.forEach(motstr => this.analyze_single_word(motstr) )
      // Pour chacun des mots, même s'il n'y en a qu'un seul, il faut faire le test

    } catch (e) {
      console.error(e)
      // error(e.message)
    }
  }

  analyze_single_word(motstr){
    // On doit par trouver le canon du nouveau mot. Qu'il existe ou non,
    // la méthode Canon.of retourne une instance de {Canon} nouvelle ou
    // créée. Attention, la méthode Canon.of peut aussi retourner null
    // lorsqu'il faut demander le canon à l'utilisateur.
    let canon_newMot = Canon.of(motstr)
    // Si le canon n'a pas eu besoin d'être défini, on peut poursuivre
    if ( canon_newMot ) {
      this.create_single_word_in_canon(motstr, canon_newMot)
    }
  }

  create_single_word_in_canon(motstr, canon){
    console.log("J'en arrive ici avec motstr='%s' et canon = ", motstr, canon)
    let newMot = Mot.createNew(motstr)
    console.log("newMot:", newMot)
    canon.addMot(newMot)
  }
}
