'use strict'
/**
  |
  | Class Canon
  |
  | Pour la gestion des canons
  |
  | Les canons sont les termes canoniques qui sont trouvés dans le texte.
  | Cette donnée contient beaucoup plus d'informations que la donnée `:mots`.
  |
**/
class Canon {

  static set(datas) {
    this.items = {}
    for ( var mot in datas.items ) {
      var canon = new Canon(datas.items[mot].datas)
      Object.assign(this.items, { [mot]: canon})
      canon.dispatchMots()
    }
  }

  /**
    |
    | INSTANCES
    |
  **/
  constructor(data){
    // console.log("Canon.instance avec", data)
    this.data = data
    for ( var k in data ) this[k] = data[k]
  }


  /**
    À l'instanciation, on peut demander à dispatcher les mots
  **/
  dispatchMots(){
    for ( var idx in this.mots ) {
      Mot.add(this.mots[idx].datas)
    }
  }
}
