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
    Retourne l'instance Mot du mot d'id +mot_id+
  **/
  static get(mot_id){
    return this.items[mot_id]
  }

  static add(dmot) {
    const mot = new Mot(dmot)
    console.log("Ajout du mot %d :", mot.id, mot)
    Object.assign(this.items, {[mot.id]: mot})
  }

  /**
    Définitions des mots
    On récupère la donnée +items+ du fichier de résultat
  **/
  static set(datas){
    console.log("-> Mot.set()",datas)
    this.items = {}
    for (var mot in datas.items) {
      datas.items[mot].forEach( mot_id => {
        Object.assign(this.items, {[mot_id]: new Mot({mot:mot, id:mot_id})})
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
      // => Il faut vérifier s'il crée un problème de proximité
      //    Il faut invoquer le module de modification PModif
      //    Si ça n'est pas le cas, on demande à l'utilisateur s'il veut
      //    l'enregistrer et considérer la proximité comme résolue.
      (new ProxModif(this.mot, new_mot)).analyze()
    }
  }

  get mot(){return this.real_init}
}
