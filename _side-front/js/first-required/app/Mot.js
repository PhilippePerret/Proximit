'use strict'
/**
  |
  | Classe Mot
  |
  | pour les mots
**/
class Mot {

  static init(){
    this.items = {}
  }
  /**
    Retourne l'instance Mot du mot d'index +idx+
  **/
  static get(idx){
    return this.items[idx]
  }

  static add(dmot) {
    const mot = new Mot(dmot)
    Object.assign(this.items, {[mot.index]: mot})
  }


  /**
    Définitions des mots
    On récupère la donnée +items+ du fichier de résultat
  **/
  static set(datas){
    this.items = {}
    for (var mot in datas.items) {
      datas.items[mot].forEach( idx => {
        Object.assign(this.items, {[idx]: new Mot({mot:mot, index:idx})})
      })
    }
  }


  /**
    |
    | INSTANCE DU MOT
    |
  **/
  constructor(data){
    this.data = data
    // on dispatche les données
    for(var k in data){this[k] = data[k]}
  }

  /**
    Méthode appelée quand on focusse dans le champ éditable du mot
    On enclenche la surveillance des touches pressées (à moins qu'on la mette
    déjà avant)
  **/
  onFocus(ev){
    console.log("-> onFocus")
    try {
      // Ça n'est pas possible, peut-être parce que c'est seulement un 
      // span.contentEditable
      $(ev.currentTarget).select()
    } catch (e) {
      console.error(e)
    }

  }

  onKeyPressed(ev){
    if ( ev.key === 'Enter' ){
      ev.currentTarget.blur()
      return stopEvent(ev)
    }
  }
  /**
    Méthode appelée quand on blure du champ éditable contenant le mot.
    On vérifie s'il a été modifié et, si c'est le cas, on prend la modification
    et on regarde si elle crée d'autre problème (en les affichant sur le côté)
  **/
  onBlur(ev){
    const new_mot = ev.currentTarget.innerText.trim()
    if ( new_mot != this.mot ) {
      // <= Le mot a été modifié
      // => Il faut vérifié s'il crée un problème de proximité
      //    Si ça n'est pas le cas, on demande à l'utilisateur s'il veut
      //    l'enregistrer et considérer la proximité comme résolue.
      UI.message("Le mot a été modifié")
    }
  }

  get mot(){return this.real_init}
}
