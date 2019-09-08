'use strict'

TESTS.add(false, "Test de l'ouverture d'un texte non analysé", ()=>{
  assert('function'===typeof(PTexte.open), "La méthode PTexte.open existe")

  // On charge le fichier tests voulu
  // C'est un fichier dont l'analyse n'existe pas, à propos
  // let path_texte = path.join(remote.app.getAppPath(),'spec','support','assets','textes','test_inside_01.txt')
  let path_texte = TESTS.pathOfTexte('test_inside_01.txt')
  PTexte.open(path_texte)

  // On vérifie que tout ait bien été initialisé
  let current_name = PTexte.current ? `c'est '${PTexte.current.name}'` : 'il est indéfini'
  assert(PTexte.current && PTexte.current.name == 'test_inside_01.txt', "Le nom du texte courant est bien 'test_inside_01.txt'.", `Le nom du texte courant devrait être 'test_inside_01.txt', ${current_name}.`)
  // On s'assure que tout soit bien initialisé
  assert(Object.keys(Canon.items).length == 0, `Il n'y a plus de Canons (Canon.items) (Canon.items.length = ${Canon.items.length})`)
  assert(Object.keys(Mot.items).length == 0, "Il n'y a plus de mots (Mot.items)")
  assert(Mot.lastId == -1, "Mot.lastId a été remis à -1")
  assert(Object.keys(Proximity.items).length == 0, "Il n'y a plus de proximité (Proximity.items)")
  assert(Proximity.current_index == - 1, "La proximité courante a été réinitialisée (-1)")
  assert(ProxModif.current == null, "Il n'y a plus de ProxModif courante.")

})

TESTS.add(true, "Lancement de l'analyse d'un tout nouveau texte", async function(){
  // On crée le nouveau test
  let texte   = "Un texte simple, avec du simple texte."
    , affixe  = `inside_test_${Number(new Date())}`
    , tname   = `${affixe}.txt`
    , ftexte  = TESTS.pathOfTexte(tname)
    , folderName = `${affixe}_prox`
    , folderPath = TESTS.pathOfTexte(folderName)

  // Un verrou de sécurité
  if ( folderPath.length < 50 ) {
    throw new Error(`Il y a une erreur avec le path "${folderPath}"… Je préfère m'arrêter là.`)
  }
  fs.writeFileSync(ftexte, texte)
  try {
    PTexte.open(ftexte)
    assert(PTexte.current != null, "Un texte est bien chargé.")
    assert(PTexte.current.name == tname, `Le texte courant est bien le texte "${tname}"`, `Le texte courant devrait être "${tname}", mais c'est ${PTexte.current.name}`)
    assert(fs.existsSync(folderPath)==false,`Le dossier "${folderPath}" n'existe pas.`)

    // === On lance l'analyse du texte ===
    // (pour le moment, comme ce sont des tests simples, on simule l'appui
    //  sur le menu voulu, mais sans le faire, on appelle simplement la fonction
    //  qui correspond à ce menu)
    PTexte.analyseCurrent.call(PTexte)
    // Ici, on guette la propriété "analyzed" du texte, qui est mise à null
    // au départ de l'analyse, et qui est mise soit à false soit à true à la
    // fin suivant qu'il y ait succès ou échec de l'analyse.
    await TESTS.waitFor(()=>{return PTexte.current.analyzed !== null})
    // On arrive ici à la fin de l'analyse ou en cas d'échec de l'analyse

  } catch (e) {
    console.error(e)
  } finally {
    // À la fin du test, qu'on qu'il arrive, on détruire le texte et le
    // fichier
    fs.unlinkSync(ftexte)
    if ( fs.existsSync(folderPath) ) exec(`rm -rf "${folderPath}"`)
  }
})
