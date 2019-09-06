'use strict';
/**
  |
  | Class Addendum (singleton)
  | --------------------------
  | Pour la gestion des données modifiées au cours du travail
  | Cf. le manuel du développeur > Addendum
  |
**/
class Addendum {
  // Instanciation
  constructor(ptexte){
    this.ptexte = ptexte
    this.load()
  }
  // Ajout du mot +mot+ aux données
  addMot(mot){

  }
  /*
    Ajout du {Canon} canon +canon+ aux données ajoutées du texte.
  **/
  addCanon(canon){

  }

  // Chargement de l'addendum s'il exixte
  load(){

  }

  // Enregistrement de l'addendum
  save(){
    
  }

  // Chemin d'accès à l'addendum
  get path(){return this._path||(this._path = ptexte.in_prox('addendum.js'))}
}
