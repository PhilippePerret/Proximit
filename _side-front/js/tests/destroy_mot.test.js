'use strict'

TESTS.add(true, "Une destruction du premier mot d'une proximité détruit la proximité", async function(){
  await TESTS.openTexte('test_inside_03.txt')
  // --- Quelques vérifications préliminaires ---
  let nombre_prox = Object.keys(Proximity.items).length
  assert(6/* => simple vérification*/, nombre_prox == 2, `Il y a bien 2 proximités au départ (nombre d'items dans Proximity.items : ${nombre_prox}).`)
  await click("▶️")
  var motA = Proximity.current.motA
  Proximity.current.spanA.focus()

})

TESTS.add("Une destruction de second mot de prox détruit la proximité", async function(){

})
TESTS.add("Destruction de premier mot de prox avec création d'une autre prox avant", async function(){

})
TESTS.add("Destruction de second mot de prox avec création d'une autre prox après", async function(){

})
