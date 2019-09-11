'use strict';

TESTS.add("Un texte peut afficher correctement sa proximité", async function(){
  /**
    | Ce test permet de passer en revue les proximités trouvées
  **/

  let text_name = 'texte_avec_particularites.md'

  // On charge le texte préparé
  let path_texte = TESTS.pathOfTexte(text_name)
  PTexte.open(path_texte)

  // On vérifie qu'il soit chargé
  assert(PTexte.current.name == text_name, `Le nom du texte courant doit être "${text_name}".`, `Le nom du texte courant devrait être "${text_name}", or, c'est "${PTexte.current.name}".`)

  // On affiche la toute première proximité en activant le bouton
  // adéquat.
  click("▶️")
  var beforeWords   = Page.getInner('span#before-words')
    , wordBefore    = Page.getInner('span#word-before')
    , betweenWords  = Page.getInner('span#between-words')
    , wordAfter     = Page.getInner('span#word-after')
    , afterWords    = Page.getInner('span#after-words')

  assert(wordBefore == 'direct', "Le premier mot est bien 'direct'", `Le premier mot devrait être "direct", or c'est "${wordBefore}"…`)
  assert(wordAfter  == 'directe', "Le second mot est bien 'directe'", `Le second mot devrait être "directe", or c'est "${wordAfter}"…`)
  assert(betweenWords == ' » et "', "Le texte entre les mots est correct", `Le texte entre les mots devrait être ' » et "', or il vaut '${betweenWords}'.`)
  assert(beforeWords.match("L'été tout ça l'avale"), "Avant le premier mot, on trouve le bon texte", `On devrait trouver avant les mots "L'été tout ça l’avale", or on trouve "${beforeWords}".`)
  assert(afterWords.match("Pourrais-je voir n'est-ce pas un poids mi-lourd ?"), "Après le second mot, on trouve le bon texte", `On devrait trouver après le second mot le texte ".<br><br>Pourrais-je voir n'est-ce", or on trouve "${afterWords}".`)
})

TESTS.add(true, "On peut passer en revue toutes les proximités d'un texte analysé", ()=>{

  // On charge le texte inside-2 qui contient plusieurs proximités
  let text_name = 'test_inside_02.txt'
  // On charge le texte préparé
  let path_texte = TESTS.pathOfTexte(text_name)
  PTexte.open(path_texte)
  // On vérifie qu'il soit chargé
  assert(PTexte.current.name == text_name, `Le nom du texte courant doit être "${text_name}".`, `Le nom du texte courant devrait être "${text_name}", or, c'est "${PTexte.current.name}".`)

})
