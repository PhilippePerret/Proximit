'use strict';

Object.assign(Page,{
  name: 'Extension de Page pour l’application "Proximit"'

, async remplaceFirstWordWith(newWord){
    this.fieldFirstWord.focus()
    this.fieldFirstWord.innerHTML = newWord
    this.fieldFirstWord.blur()
    this.fieldSecondWord.focus()
    // Il faut attendre jusqu'à ce que le traitement ait été effectué
    // Il y a des méthodes asynchrones ou des méthodes qui demandent confirmation
    // par l'auteur.
    await TESTS.waitFor(() => ProxModif.running === false)
  }

, async remplacerSecondWordWith(newWord){
    this.fieldSecondWord.focus()
    this.fieldSecondWord.innerHTML = newWord
    this.fieldSecondWord.blur()
    this.fieldFirstWord.focus()
    // Il faut attendre jusqu'à ce que le traitement ait été effectué
    // Il y a des méthodes asynchrones ou des méthodes qui demandent confirmation
    // par l'auteur.
    await TESTS.waitFor(() => ProxModif.running === false)
  }
})

Object.defineProperties(Page,{

  fieldFirstWord:{get(){return Page.get('#word-before')}}
, fieldSecondWord:{get(){return Page.get('#word-after')}}


})
