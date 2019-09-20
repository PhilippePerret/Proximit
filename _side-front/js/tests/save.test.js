'use strict'
/**
  Tests pour tester l'enregistrement des modifications
**/
TESTS.add("On peut enregistrer un texte ouvert (sans modifications)", async function(){
  await TESTS.openTexte('test_inside_03.txt', {reset:true, analyze:true})
  const ptexte = PTexte.current
  await ptexte.save()
  // On doit trouver ces nouveaux fichiers qui sont utilisés pour sauvegarder
  // les résultats.
  let paths = [
    , ptexte.in_prox('mots.json')
    , ptexte.in_prox('canons.json')
    , ptexte.in_prox('proximites.json')
    , ptexte.in_prox('corrected_text.txt')
  ]
  paths.forEach(pth => assert(fs.existsSync(pth), `Le fichier "${pth}" existe.`, `Le fichier "${pth}" devrait exister…`))

  // Le texte final doit être le même que le texte initial (puisqu'il n'y a
  // eu aucune correction)
  var iniText = fs.readFileSync(ptexte.in_prox('texte_entier.txt'), 'utf-8').trim()
  var finText = fs.readFileSync(ptexte.in_prox('corrected_text.txt'),'utf-8').trim()
  assert(iniText == finText, "Le texte a bien été enregistré", `Le texte final n'est pas bon.\nTexte initial: "${iniText}"\nTexte final: "${finText}"`)

})
TESTS.add("On peut enregistrer un texte ouvert avec ses modifications de proximité", async function(){
  await TESTS.openTexte('test_inside_03.txt', {reset:true, analyze:true})
  const ptexte = PTexte.current

  // on modifie la seconde proximité
  click("▶️")
  click("▶️")
  await Page.remplaceFirstWordWith('document')

  // On enregistre le fichier
  await ptexte.save()

  // On doit trouver ces nouveaux fichiers qui sont utilisés pour sauvegarder
  // les résultats.
  let paths = [
    , PTexte.current.in_prox('mots.json')
    , PTexte.current.in_prox('canons.json')
    , PTexte.current.in_prox('proximites.json')
    , PTexte.current.in_prox('corrected_text.txt')
  ]
  paths.forEach(pth => assert(fs.existsSync(pth), `Le fichier "${pth}" existe.`, `Le fichier "${pth}" devrait exister…`))

  // Les deux textes doivent être différents
  var iniText = fs.readFileSync(ptexte.in_prox('texte_entier.txt'), 'utf-8').trim()
  var finText = fs.readFileSync(ptexte.in_prox('corrected_text.txt'),'utf-8').trim()
  var expText = `Test de la sauvegarde du document modifié.

  Le texte a été corrigé ou non avant sa sauvegarde.`

  assert(iniText != finText, "Le texte enregistré est bien différent du texte initial", "Le texte final devrait être différent du texte initial…")
  assert(finText == expText, "Le texte enregistré est conforme à celui attendu", `Le texte final enregistré devrait valoir : "${expText}". Il vaut "${finText}"…`)

})
