'use strict'

TESTS.add("Test de l'ouverture d'un texte non analysé", ()=>{
  assert('function'===typeof(PTexte.open), "La méthode PTexte.open existe")

  // On charge le fichier tests voulu
  // C'est un fichier dont l'analyse n'existe pas, à propos
  let path_texte = path.join(remote.app.getAppPath(),'spec','support','assets','textes','test_inside_01.txt')
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
