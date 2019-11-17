'use strict'
/**
  Les méthodes d'évènements généraux

  Gère notamment la surveillance des touches pressées dans le working-field
  pour savoir si on peut, ou non, lancer la procédure de check des proximités
**/

const WritingField = {
  init(){
    this.blockUntilTime = new Date().getTime() - 1
    this.lastKeyPressedTime = 0
  }
, onKeyPressedInWorkingField(ev){
    // Quand une touche est pressée dans le champ de saisie du texte, on
    // bloque l'activité du programme pendant 2 secondes plus tard
    this.blockUntilTime       = new Date().getTime() + 2000
    this.lastKeyPressedTime   = new Date().getTime()
  }

  /**
    Portion de texte à envoyer au check des proximités
    C'est le texte apparent à l'écran, auquel on ajoute le texte avant et
    après en fonction de l'indice de proximité choisi.
  **/
, getTextToCheck(){
    console.error("La méthode getTextToCheck est à réimplémenter")
    return ''
  }
}
