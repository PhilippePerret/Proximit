'use strict'

TESTS.add("Une destruction du premier mot d'une proximité détruit la proximité", async function(){

  await TESTS.openTexte('test_inside_03.txt')

  // --- Quelques vérifications préliminaires ---
  var silencieux = true

  // En utilisant TESTS.verif
  TESTS.assert({proximites_count: 2}, silencieux)

  click("▶️")

  let motA    = Proximity.current.motA
    , motA_id = parseInt(motA.id,10)
    , motB    = Proximity.current.motB
    , icanon  = motA.icanon
    , proxId  = parseInt(Proximity.current.id,10)
    , nombreProx = parseInt(Object.keys(Proximity.items).length,10)

  // --- Vérifications préliminaires ---
  silencieux = true
  let data = {
      proximites_count: 2
    , corrected_proximites: 0
    , mots_count: 17
    , motB_px_idP: Proximity.current.id, motB: motB
    , canon: motA.icanon
    , nombre_occurences_canon: 2
    , nombre_proximites_canon: 1
    , mots_existants: [motA]
  }
  TESTS.assert(data, silencieux)

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
  TESTS.assert({
      mots_inexistants: [motA_id]
    , mots_count: 16
    , proximites_inexistantes: [proxId]
    , proximites_count: nombreProx - 1
    , canon: motA.icanon
    , nombre_occurences_canon: 1
    , nombre_proximites_canon: 0
    , proximites_count: 1
    , corrected_proximites: 1
    , motB: motB
    , motB_px_idP: null
  })

  // L'autre mot n'est plus en proximité précédente
  assert(isNullish(motB.proxP), "Le motB n'a plus de .proxP")

})

// Mot avant mais hors proximité
TESTS.add("Une destruction de second mot de prox détruit la proximité", async function(){

})
// Mot avant à proximité
TESTS.add(true, "Destruction de mot en proximité avec mot assez proche (avant)", async function(){

  await TESTS.openTexte('test_inside_04.txt')

  // --- Quelques vérifications préliminaires ---
  var silencieux = false

  click("▶️") // cette… cette
  click("▶️") // Première proximité… proximité

  let motA    = Proximity.current.motA
    , motA_id = parseInt(motA.id,10)
    , motB    = Proximity.current.motB
    , motB_id = parseInt(motB.id,10)
    , icanon  = motA.icanon
    , proxId  = parseInt(Proximity.current.id,10)
    , nombreProx = parseInt(Object.keys(Proximity.items).length,10)

  // --- Vérifications préliminaires ---
  silencieux = true
  let data = {
      proximites_count: 3
    , corrected_proximites: 0
    , mots_count: 19
    , canon: Canon.get('proximité')
    , nombre_proximites_canon: 2
    , nombre_occurences_canon: 3
    , motB: motB
    , motB_px_idP: Proximity.current.id
    , motA: motA
    , motA_px_idN: Proximity.current.id
  }
  TESTS.assert(data, silencieux)

  // === TEST ===
  Proximity.current.spanB.focus()
  await TESTS.waitFor(1)

  click("✂️")
  await TESTS.waitFor(1)
  // Une fenêtre doit s'afficher
  click("Détruire le mot")
  await TESTS.waitFor(1)

  // On doit attendre jusqu'à ce que le mot soit détruit
  await TESTS.waitFor( isNullish.bind(null, Mot.get(motB_id)) )

  // === VÉRIFICATION ===

  // Le mot a été détruit (même si ça a été vérifié indirectement dans le
  // waitFor ci-dessus).
  // Mais cette destruction a dû créer une nouvelle proximité entre le
  // premier "proximité" et le troisième.
  TESTS.assert({
      mots_inexistants: [motB_id]
    , mots_existants: [motA]
    , mots_count: 18
    , proximites_inexistantes: [proxId]
    , proximites_count: nombreProx // car une nouvelle a dû être créée
    , canon: motA.icanon
    , nombre_occurences_canon: 2
    , nombre_proximites_canon: 1
    , proximites_count: 2
    , corrected_proximites: 2
    , added_proximites: 1
    , motA: motB
    , motA_px_idP: null
    , motA_px_idN: null // non
  })

})
// Mot après à proximité
TESTS.add("Destruction de mot en proximité avec mot assez proche (après)", async function(){

})
TESTS.add("Destruction de second mot de prox avec création d'une autre prox après", async function(){

})
