'use strict';
/**
  class Resultats
  ---------------
  Classe permettant de gérer les résultats, de les modifier simplement avec
  des méthodes expressives comme "resultats.incrementeNombreProximites" ou
  même `resultats.addProximites(prox)`

  Puisque le texte courant met dans `RESULTATS` son instance {Resultats}, il
  suffit de l'utiliser pour modifier ces résultats. Par exemple :

    RESULTATS.addMot(inewmot)

**/

let RESULTATS = null // Sera mis à l'instance {Resultats} du texte courant

class Resultats {

  /**
    On instancie les résultats avec le PTexte +ptexte+ (qui n'est pas forcément
    le texte courant, même si c'est le cas pour l'instant)
  **/
  constructor(ptexte){
    this.ptexte = ptexte
  }

  // ---------------------------------------------------------------------
  //    MOTS

  get mots(){ return this.datas.mots }

  addMot(imot){
    this.incrementeMots()
    this.ptexte.modified = true
  }
  removeMot(imot){
    this.decrementeMots()
    this.ptexte.modified = true
  }
  incrementeMots(){
    this.mots.datas.nombre_total_mots ++
  }
  decrementeMots(){
    this.mots.datas.nombre_total_mots --
  }

  // ---------------------------------------------------------------------
  //    CANONS

  get canons(){ return this.datas.canons }

  addCanon(icanon){
    this.incrementeCanons()
    this.ptexte.modified = true
  }
  removeCanon(icanon){
    this.decrementeCanons()
    this.ptexte.modified = true
  }
  incrementeCanons(){
    this.canons.datas.nombre ++
  }
  decrementeCanons(){
    this.canons.datas.nombre --
  }

  // ---------------------------------------------------------------------
  //    PROXIMITÉS

  get proximites(){ return this.datas.proximites }

  // Ajoute la proximité +iprox+ (rappel : seulement dans les résultats)
  addProximity(iprox) {
    Object.assign(this.proximites.datas.items, {[iprox.id]: iprox.data_yaml})
    this.incrementeProximites()
    this.resetPourcentageProximites()
    this.ptexte.modified = true
  }
  // Détruit la proximité +iprox+ (rappel : seulement dans les résultats)
  removeProximity(iprox){
    delete this.proximites.datas.items[iprox.id]
    this.incrementeCorrected()
    this.decrementeProximites()
    this.ptexte.modified = true
  }
  // Incrémente le nombre de proximités
  incrementeProximites(){
    this.proximites.datas.nombre ++
  }
  decrementeProximites(){
    // console.log(`-> decrementeProximites (nombre = ${this.proximites.datas.nombre})`)
    this.proximites.datas.nombre --
    // console.log(`<- decrementeProximites (après : ${this.proximites.datas.nombre})`)
  }
  incrementeCorrected(){
    if ( !this.proximites.datas.nombre_corrected ) {
      this.proximites.datas.nombre_corrected = 0
    }
    this.proximites.datas.nombre_corrected ++
  }
  decrementeCorrected(){
    this.proximites.datas.nombre_corrected --
  }
  resetPourcentageProximites(){
    this.proximites.datas.pourcentage = null
  }

  // ---------------------------------------------------------------------
  //    PROPRIÉTÉS

  get datas(){
    return this._datas || ( this._datas = this.ptexte.resultats.datas )
  }
}
