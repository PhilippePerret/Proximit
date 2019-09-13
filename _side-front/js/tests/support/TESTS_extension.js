'use strict'

Object.assign(TESTS,{
  /**
    Ouvre un texte (et vérifie qu'il a bien été chargé)
    Le texte doit se trouver dans './spec/support/assets/textes/'
  **/
  openTexte(text_name){
    let path_texte = TESTS.pathOfTexte(text_name)
    PTexte.open(path_texte)
    assert(PTexte.current.name == text_name, `Le nom du texte courant doit être "${text_name}".`, `Le nom du texte courant devrait être "${text_name}", or, c'est "${PTexte.current.name}".`)
  }
})
