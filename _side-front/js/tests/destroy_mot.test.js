'use strict'

TESTS.add(true, "Une destruction du premier mot d'une proximité détruit la proximité", async function(){
  await TESTS.openTexte('test_inside_03.txt')
  // --- Quelques vérifications préliminaires ---
  let nombreProx = Object.keys(Proximity.items).length
  assert(6/* => simple vérification*/, nombreProx == 2, `Il y a bien 2 proximités au départ (nombre d'items dans Proximity.items : ${nombreProx}).`)
  click("▶️")

  let motA    = Proximity.current.motA
    , motA_id = parseInt(motA.id,10)
    , motB    = Proximity.current.motB
    , icanon  = motA.icanon
    , proxId  = parseInt(Proximity.current.id,10)

  // --- Vérifications préliminaires ---
  assert(6, Page.getInner('#nombre_proximites')=='2', `Le nombre de proximités affiché est 2 (${Page.getInner('#nombre_proximites')})`)
  assert(6, Page.getInner('#corrected_proximites') == '0', `Le nombre de mots affiché est 0 (${Page.getInner('#corrected_proximites')})`)
  assert(6, Page.getInner('#nombre_mots') == '17', `Le nombre de mots affiché est 17 (${Page.getInner('#nombre_mots')})`)
  assert(6, motB.px_idP == Proximity.current.id, `Le motB a la bonne valeur px_idP (#${motB.px_idP})`)
  assert(6, icanon.nombre_occurences == 2, `Le canon "${icanon.id}" a bien 2 occurences (icanon.nombre_occurences = ${icanon.nombre_occurences})`)
  assert(6, icanon.nombre_proximites == 1, `Le canon "${icanon.id}" a bien 1 proximités (icanon.nombre_proximites = ${icanon.nombre_proximites})`)
  assert(6, !isNullish(Page.get(`.mot[data-id="${motA_id}"]`)), "Le mot se trouve dans le texte affiché.")

  // === TEST ===
  Proximity.current.spanA.focus()
  await TESTS.waitFor(1)

  click("✂️")
  await TESTS.waitFor(1)
  // Une fenêtre doit s'afficher
  click("Détruire le mot")
  await TESTS.waitFor(1)

  // On doit attendre jusqu'à ce que le mot soit détruit
  await TESTS.waitFor( isNullish.bind(null, Mot.get(motA_id)) )

  // === VÉRIFICATION ===

  // Le mot a été détruit (même si ça a été vérifié indirectement dans le
  // waitFor ci-dessus)
  assert(isNullish(Mot.get(motA_id)), `Le mot #${motA_id} n'existe plus.`)
  // Le mot a été détruit dans l'affichage
  assert(isNullish(Page.get(`.mot[data-id="${motA_id}"]`,'strict')), "Le mot a été détruit dans le texte affiché.")

  // La proximité a été détruite
  assert(isNullish(Proximity.get(proxId)), `La proximité #${proxId} a été détruite.`)

  // Une proximité en moins
  var newNombreProx = Object.keys(Proximity.items).length
  assert(newNombreProx == nombreProx - 1, `Le nombre de proximité s'est décrémenté (${nombreProx} - 1 = ${newNombreProx}).`)

  // Le nombre de mots du canon a changé
  assert(icanon.nombre_occurences == 1, `Le canon "${icanon.id}" n'a plus qu'une seule d'occurence (icanon.nombre_occurences = ${icanon.nombre_occurences})`)
  assert(icanon.nombre_proximites == 0, `Le canon "${icanon.id}" n'a plus de proximités (icanon.nombre_proximites = ${icanon.nombre_proximites})`)

  assert(Page.getInner('#nombre_proximites')=='1', `Le nombre de proximités affiché est 1 (${Page.getInner('#nombre_proximites')})`)
  assert(Page.getInner('#corrected_proximites') == '1', `Le nombre affiché de proximités corrigées est 1 (${Page.getInner('#corrected_proximites')})`)

  // L'autre mot n'est plus en proximité précédente
  assert(isNullish(motB.px_idP), `Le motB n'a plus de px_idP (#${motB.px_idP})`)
  assert(isNullish(motB.proxP), "Le motB n'a plus de .proxP")

  // Le nombre de mots affichés a changé
  assert(Page.getInner('#nombre_mots') == '16', `Le nombre de mots affiché est 16 (${Page.getInner('#nombre_mots')})`)

})

TESTS.add("Une destruction de second mot de prox détruit la proximité", async function(){

})
TESTS.add("Destruction de premier mot de prox avec création d'une autre prox avant", async function(){

})
TESTS.add("Destruction de second mot de prox avec création d'une autre prox après", async function(){

})
