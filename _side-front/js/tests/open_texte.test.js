'use strict'

TESTS.add("Test de l'ouverture d'un texte non analysé", ()=>{
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
    var curTexte = PTexte.current
    assert(PTexte.current != null, "Un texte est bien chargé.")
    assert(PTexte.current.name == tname, `Le texte courant est bien le texte "${tname}"`, `Le texte courant devrait être "${tname}", mais c'est ${PTexte.current.name}`)
    assert(fs.existsSync(folderPath)==false,`Le dossier "${folderPath}" n'existe pas.`)
    assert(curTexte.isAnalyzed === false, "Le texte est bien marqué non analysé.", "Le texte devrait être marqué non analysé (isAnalyzed)")

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

    assert(curTexte.isAnalyzed === true, "Après l'analyse, le texte est marqué analysé.", "Après l'analyse, le texte devrait être marqué analysé (isAnalyzed)")
    // On vérifie la présence des différents fichiers
    const flist = [
        ['analyse.json',  "des données JSON de l'analyse"]
      , ['analyse.yaml',  "des données YAML de l'analyse"]
      , ['data.json',     "des données JSON du texte (data.json)"]
      , ['data.yaml',     "des données YAML du texte (data.yaml)"]
      , ['table_resultats.json', "des résultats en format JSON"]
      , ['table_resultats.yaml', "des résultats en format YAML"]
      , ['texte_entier.txt',  "du texte entier (texte_entier.txt)"]
      , ['texte_entier_lemmatized.txt', "du texte entier lémmatisé (texte_entier_lemmatized.txt)"]
      , ['whole_text.json', "des données JSON du texte complet (whole_text.json)"]
      , ['whole_text.yaml', "des données YAML du texte complet (whole_text.yaml)"]
    ]
    flist.forEach(paire => {
      let [filename, name] = paire
      let pth = path.join(folderPath, filename)
      name = name || `"${filename}"`
      assert(fs.existsSync(pth), `Le fichier ${name} existe bien.`, `Après l'analyse, ${name} devrait exister.`)
    })

    // Vérification de l'état de l'analyse
    // -----------------------------------
    let path_resultats = path.join(folderPath, 'table_resultats.json')
    let resultats = require(path_resultats)
    // console.log("résultats : ",resultats)
    assert(resultats['datas']!==undefined, "Les résultats contiennent une clé 'datas'")
    let datas = resultats.datas
    assert(datas['canons']!==undefined, "Les datas contiennent une clé 'canons'")
    assert(datas.canons.datas.nombre == 5, "Le nombre de canons indiqués est 5", `Le nombre de canons indiqués devrait être 5, c'est ${datas.canons.datas.nombre}`)
    let canons = datas.canons.datas.items
    // note : "canons" ci-dessus est une table avec en clé le canon (le mot
    // canonique) et en valeur sa donnée d'analyse
    assert(Object.keys(canons).length == 5, "Il y a 5 items de canons", `Il devrait y avoir 5 items de canons, il y en a ${canons.length}.`)
    let exp_canons = ["un","simple","texte","avec","du"]
    exp_canons.forEach( exp_canon => assert(canons[exp_canon]!=undefined, `Le canon « ${exp_canon} » existe.`))
    // Concernant spécifiquement le mot "texte"
    let canon = canons['texte'].datas
    assert(canon.canon == 'texte', "Le canon 'texte' définit bien sa propriété 'canon'")
    assert(canon.nombre_occurences==2, "2 occurences de 'texte' ont été trouvées", `2 occurences de "texte" auraient dû être trouvées, l'analyse en a trouvé ${canon.nombre_occurences}`)
    assert(canon.nombre_proximites==1, "1 proximité a été trouvée", `1 proximité aurait dû être trouvée, l'analyse en a trouvé ${canon.nombre_proximites}`)
    assert(canon.mots.length == 2, "Il y  a deux 'mots'", `Il devrait y avoir 2 'mots', l'analyse en a trouvé ${canon.mots.length}`)
    // Note : l'analyse proprement dite (ses résultats) est testée plus
    // profondément dans le module qui lui est consacré.

    // Vérification de l'état de l'interface
    // --------------------------------------

    // Les boutons pour se déplacer de proximité en proximité sont bien
    // affichés
    const buttonsList = [
        ['btn-text-beginning',    "⏮", "Début du texte"]
      , ['btn-text-end',          "⏭", "Fin du texte"]
      , ['btn-save-corrections',  "⏺", "Enregistrer les corrections"]
      , ['btn-prev-prox',         "◀️", "Proximité précédente"]
      , ['btn-next-prox',         "▶️", "Proximité suivante"]
    ]
    buttonsList.forEach(dbtn => {
      let [id, text, title] = dbtn
      Page.has('button',{id:id, text:text, title:title})
    })

    // Les informations sur le texte courant
    // --------------------------------------
    Page.has('span',{id:'nombre_proximites', text: 2})
    Page.has('span',{id:'nombre_mots', text: 7})
    Page.has('span',{id:'nombre_canons', text: 5})
    Page.has('span',{id:'pourcentage_proximites', text: '28.6 %'})
    Page.has('span',{id:'corrected_proximites', text: 'à voir'})


  } catch (e) {
    throw(e)
  } finally {
    // À la fin du test, qu'on qu'il arrive, on détruire le texte et le
    // fichier
    fs.unlinkSync(ftexte)
    if ( fs.existsSync(folderPath) ) exec(`rm -rf "${folderPath}"`)
  }
})
