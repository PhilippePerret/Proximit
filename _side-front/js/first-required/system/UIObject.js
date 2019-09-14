'use strict'
/**
  Class UIObject
  --------------
  Gestion des objets DOM
**/
class UIObject {
  constructor(selector){
    this.selector = selector
  }

  // Ajoute le contenu +contenu+ (string ou HTMLElement)
  // Retourne l'objet lui-même pour pouvoir chainer :
  //  objet.append(...).append(...).append etc.
  append(contenu){
    if ( 'string' === typeof contenu) {
      this.domObj.insertAdjacentHTML('beforeend', contenu)
    } else {
      this.domObj.append(contenu)
    }
    return this
  }

  /**
    Retourne l'élément de selector +selector+ contenu par l'élément courant
  **/
  find(selector){
    return this.domObj.querySelector(selector)
  }

  // Vide
  // @return l'objet (pour chainage)
  clean(){this.domObj.innerHTML = ''; return this}

  get jqObj(){return this._jqObj||(this._jqObj = $(this.selector))}
  get domObj(){return this._domObj||(this._domObj = document.querySelector(this.selector))}
}
