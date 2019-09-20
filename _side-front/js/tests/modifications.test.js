'use strict';



TESTS.add("Modification d'une proximité avec nouveau mot sans proximité ni canon existant", async function(){
  /**
    Note : une modification simple signifie que :
      - un seul des mots créant la proximité est remplacé
      - ce mot est remplacé par un mot unique
      - ce mot unique ne rentre pas en proximité avec un autre mot du texte
  **/
  // On charge le texte inside-2 qui contient plusieurs proximités
  TESTS.openTexte('test_inside_02.txt')

  // --- Quelques vérifications préliminaires ---
  let nombre_prox = Object.keys(Proximity.items).length
  assert(6/*simple vérification*/, nombre_prox == 9, "Il y a bien 9 proximités au départ.")

  // On affiche la deuxième proximité
  click("▶️")
  click("▶️")

  const oldMot3 = Mot.get(2)
  // console.log("oldMot3:", oldMot3)
  // Le 'qui' qui est en proximité avec le mot testé
  const motQui  = Mot.get(oldMot3.px_idN)
  // console.log("motQui = ", motQui)

  let fieldFirstWord = Page.get('#word-before')
  let fieldAfterWord = Page.get('#word-after')

  // ======== TEST =========
  // On change le mot en mettant "auquel" à la place de "qui"
  await Page.remplaceFirstWordWith('auquel')

  // VÉRIFICATIONS
  // -------------
  // • Le nombre total de proximités doit être passé de 9 à 8
  nombre_prox = Object.keys(Proximity.items).length
  assert( nombre_prox == 8, "Le nombre de proximité est maintenant de 8", `Le nombre de proximités devrait être de 8, il vaut ${nombre_prox}…`)

  // On prend le nouveau (ou ce qui doit être) le nouveau
  const mot3 = Mot.get(2)
  const new3eMot = "nouveau 3e mot"
  // • Le 3e mot (le "qui" modifié) doit avoir été remplacé par "auquel", au
  //   niveau de tous ses aspects
  assert(mot3.mot === 'auquel', "Le 3e mot est maintenant 'auquel'.", `Le ${new3eMot} devrait être "auquel", or c'est "${mot3.mot}"…`)
  assert(mot3.canon == 'auquel', "Le canon du 3e mot est 'auquel'", `Le canon du ${new3eMot} devrait être "auquel", or c'est "${mot3.canon}"…`)
  assert(mot3.downcase == 'auquel', "Le downcase du 3e mot est 'auquel'", `Le downcase du ${new3eMot} devrait être "auquel", or c'est "${mot3.downcase}"…`)
  assert(mot3.tbw == ' ', "L'entre-mots du 3e mot est ' '", `L'entre-mots du ${new3eMot} devrait être " ", or c'est "${mot3.tbw}"…`)
  //  • Les idN et idP (même que ancien mot 3)
  assert(oldMot3.idN == mot3.idN, `Le ${new3eMot} a le même mot suivant que l'ancien`, `Le mot suivant le ${new3eMot} devrait être ${oldMot3.idN}, or c'est ${mot3.idN}…`)
  assert(oldMot3.idP == mot3.idP, `Le ${new3eMot} a le même mot précédent que l'ancien`, `Le mot précédant le ${new3eMot} devrait être ${oldMot3.idP}, or c'est ${mot3.idP}…`)
  // • Les prox_ du nouveau mot doivent être à rien
  assert(mot3.proxP === null, `Le ${new3eMot} n'a pas de proximité avant`, `Le ${new3eMot} ne devrait pas avoir de proximité avant, or il a le mot #${mot3.proxP && mot3.proxP.id} (${mot3.proxP && mot3.proxP.mot})…`)
  assert(mot3.proxN === null, `Le ${new3eMot} n'a pas de proximité après`, `Le ${new3eMot} ne devrait pas avoir de proximité après, or il a le mot #${mot3.proxN && mot3.proxN.id} (${mot3.proxN && mot3.proxN.mot})…`)
  // • Le second qui ne doit plus être en proximité
  assert(motQui.proxP === null, `Le second 'qui' n'a plus de proximité précédente (son px_idP = ${motQui.px_idP}).`)
  // • Il doit y avoir un nouveau canon, avec "auquel" (peut-être même autre chose
  //   s'il a une forme lémmatisé)
  const newCanon = Canon.get('auquel')
  assert(!!newCanon, "Un nouveau canon a été créé pour 'auquel'")
  assert(newCanon.nombre_occurences == 1, "Le nombre d'occurences du nouveau canon est 1", `Le nombre d'occurences du nouveau canon devrait être 1, or c'est ${newCanon.nombre_occurences}…`)
  assert(newCanon.proximites.length == 0, "Ce canon ne doit avoir aucune proximité")
  assert(newCanon.mots.length == 1, "Ce canon possède un seul mot", `Le nouveau canon devrait posséder un seul mot, il en contient ${newCanon.mots.length}…`)
  // • Le nombre de "qui" doit avoir été décrémenté
  const canonQui = Canon.get('qui')
  assert(canonQui.nombre_occurences == 1,"Le canon 'qui' n'a plus qu'une occurence.", `Le canon "qui" devrait avoir une seule occurence, il en a ${canonQui.nombre_occurences}…`)
  assert(canonQui.mots.length == 1,"Le canon 'qui' n'a plus qu'un seul mot dans sa liste.", `Le canon "qui" devrait n'avoir qu'un seul mot dans sa liste, il en a ${canonQui.mots.length}…`)
  assert(canonQui.proximites.length == 0, "Le canon 'qui' n'a plus de proximité", `Le canon 'qui' ne devrait plus avoir de proximité, il en possède ${canonQui.proximites.length}…`)
  // • Tous les offsets des mots après ont dû être modifiés.
  //   NON : pour le moment, on ne fait pas cette opération (on ne se sert pas
  //   des offsets pour gérer le nouveau texte)
  // • Le texte doit avoir été marqué modifié
  assert(PTexte.current.modified, "Le texte courant a été marqué modifié.")

  // L'affichage doit tenir compte des modifications
  var valstr
  // • Le nombre de proximités affichées a été diminué
  valstr = Page.getInner('#nombre_proximites')
  assert(valstr == '8', `Le nombre de proximités affichées est 8 (valeur du champ : ${valstr})`)
  // • Le nombre de canons a augmenté
  valstr = Page.getInner('#nombre_canons')
  assert(valstr == '50', `Le nombre de canons est passé à 50 (valeur du champ : ${valstr})`)
  // • Le nombre de mots n'a pas bougé
  valstr = Page.getInner('#nombre_mots')
  assert(valstr == '75', `Le nombre de mots est resté 75 (valeur dans le champ : ${valstr})`)
  // • Le pourcentage de proximités a changé
  // TODO
  // • Le nombre de proximités corrigés a été mis à 1
  valstr = Page.getInner('#corrected_proximites')
  assert(valstr == '1', `Le nombre de proximités corrigées a été mis à 1 (valeur dans le champ : ${valstr})`)

  // Pour terminer, on s'assure que la proximité suivante soit bien le mot
  // suivant.
  assert(Proximity.current_index == 1, "L'index de la proximité courante est 1", `L'index de la proximité courante devrait être 1, c'est ${Proximity.current_index}…`)
  let firstMot  = Page.getInner('#word-before')
  let secondMot = Page.getInner('#word-after')
  assert(firstMot == 'doit' && secondMot == 'doivent', "La proximité courante concerne 'doit' et 'doivent'", `La proximité courante devrait concerner 'doit' et doivent', elle concerne '${firstMot}' et '${secondMot}'.`)
  // En revenant en arrière, on ne doit pas tomber sur l'ancienne proximité
  // mais sur la première
  click("◀️")
  firstMot  = Page.getInner('#word-before')
  secondMot = Page.getInner('#word-after')
  assert(firstMot == 'texte' && secondMot == 'texte', "La proximité précédente concerne bient 'texte' et 'texte'", `La proximité précédente devrait concerner 'texte' et 'texte', elle concerne '${firstMot}' et '${secondMot}'.`)

  click("▶️")
  firstMot  = Page.getInner('#word-before')
  secondMot = Page.getInner('#word-after')
  assert(firstMot == 'doit' && secondMot == 'doivent', "La proximité suivante concerne 'doit' et 'doivent'", `La proximité suivante devrait concerner 'doit' et doivent', elle concerne '${firstMot}' et '${secondMot}'.`)

})



TESTS.add("Modification (refusée) d'une proximité avec mot créant une nouvelle proximité avec un autre canon dont le mot se trouve dans le texte affiché", async function(){

  /**
    NOTES
    -----
      Dans ce test, c'est le second mot de la troisième proximité qu'on va
      remplacer.

  **/
  // On charge le texte inside-2 qui contient plusieurs proximités
  TESTS.openTexte('test_inside_02.txt')

  // --- Quelques vérifications préliminaires ---
  let nombre_prox = Object.keys(Proximity.items).length
  assert(6/*simple vérification*/, nombre_prox == 9, `Il y a bien 9 proximités au départ (${nombre_prox} éléments dans la table Proximity.items).`)

  // On affiche la troisième proximité
  click("▶️")
  click("▶️")
  click("▶️")

  const oldMot15 = Mot.get(14) // 'doivent'

  // Le 'doit' qui est en proximité avec le mot testé
  const motFirst  = Mot.get(oldMot15.px_idP)
  // console.log("motQui = ", motQui)

  let fdFirst = Page.get('#word-before')
  let fdSecon = Page.get('#word-after')

  assert(6, fdFirst.innerHTML == 'doit', "Le premier mot est 'doit'", `Le 1er mot devrait être 'doit', or c'est '${fdFirst.innerHTML}'…`)
  assert(6, fdSecon.innerHTML == 'doivent', "Le second mot est 'doivent'", `Le second mot devrait être 'doivent', or c'est '${fdSecon.innerHTML}'…`)

  // === TEST ===
  await Page.remplacerSecondWordWith('ailleurs') // note 'ailleurs' existe déjà dans le texte

  // Le fait de proposer un mot qui va créer une nouvelle proximité doit
  // provoquer une demande de confirmation. Ou alors on la signale seulement ?
  Page.has('div', {class:'warning', text:"Une nouvelle proximité a été trouvée"})

  // Le second mot possède la classe 'danger'
  Page.has('span',{class:['mot','danger'], visible:true, attrs:{'data-id':'14'}}, "Le premier 'ailleurs' est mis en exergue")
  // Le mot 'ailleurs' est visible et possède la classe 'danger'
  Page.has('span',{class:['mot','danger'], visible:true, attrs:{'data-id':'50'}}, "Le second 'ailleurs' est mis en exergue")

})

TESTS.add("Cas : correction proximité MAIS nouvelle proximité avec mot : canon existant, proche après hors texte affiché", async function(){

  /**
    NOTES
    -----
      Dans ce test, c'est le second mot de la troisième proximité qu'on va
      remplacer.

  **/
  // On charge le texte inside-2 qui contient plusieurs proximités
  TESTS.openTexte('test_inside_02.txt')

  // --- Quelques vérifications préliminaires ---
  let nombre_prox = Object.keys(Proximity.items).length
  assert(6/*=> simple vérification*/, nombre_prox == 9, `Il y a bien 9 proximités au départ (${nombre_prox} éléments dans la table Proximity.items).`)

  // On affiche la troisième proximité
  click("▶️")
  click("▶️")
  click("▶️")

  const oldMot15 = Mot.get(14) // 'doivent'

  // Le 'doit' qui est en proximité avec le mot testé
  const motFirst  = Mot.get(oldMot15.px_idP)
  // console.log("motQui = ", motQui)

  let fdFirst = Page.get('#word-before')
  let fdSecon = Page.get('#word-after')

  assert(6, fdFirst.innerHTML == 'doit', "Le premier mot est 'doit'", `Le 1er mot devrait être 'doit', or c'est '${fdFirst.innerHTML}'…`)
  assert(6, fdSecon.innerHTML == 'doivent', "Le second mot est 'doivent'", `Le second mot devrait être 'doivent', or c'est '${fdSecon.innerHTML}'…`)

  // === TEST ===
  await Page.remplacerSecondWordWith('nécessaire') // note 'ailleurs' existe déjà dans le texte

  // Le fait de proposer un mot qui va créer une nouvelle proximité doit
  // provoquer une demande de confirmation. Ou alors on la signale seulement ?
  Page.has('div', {class:'warning', text:"Une nouvelle proximité a été trouvée"})
  Page.has('div', {class:'warning', text:"avec le mot suivant \"nécessaire\" (\#71) à 265 signes"})

  // Le second mot possède la classe 'danger'
  Page.has('span',{class:['mot','danger'], visible:true, attrs:{'data-id':'14'}}, "Le premier 'nécessaire', est mis en exergue.")
  // Le mot 'nécessaire' est visible et possède la classe 'danger'
  Page.has('span',{class:['mot','danger'], visible:true, attrs:{'data-id':'71'}}, "Le second 'nécessaire' devrait être mis en exergue…")

  // Il y a toujours 9 proximités
  nombre_prox = Object.keys(Proximity.items).length
  assert(nombre_prox == 9, `Il y a toujours 9 proximités (${nombre_prox} éléments dans la table Proximity.items).`)

})

TESTS.add("Modification acceptée d'une proximité avec mot créant une nouvelle proximité avec un autre canon", async function(){
  assert(1+1 == 2, "1+1 est bien égal à 2", "1+1 n'est pas du tout égal à 2, mon coco !")
  // assert(1+1 == 3, "1+1 est bien égal à 3", "1+1 n'est pas du tout égal à 3, mon coco !")
})

// * Faire une modification avec un mot dont le canon existe déjà (remplacer "permis", par "plusieurs")
// * Faire une modification avec un mot qui doit être ignoré (remplacer "qui" par "il")
// * Faire une modification avec plusieurs mots simples sans aucun canon
// * Faire une modification avec plusieurs mots simples où certains mots n'ont pas de canon
// * Faire une modification avec plusieurs mots simples où tous les canons doivent être faits
// * Faire une modification avec plusieurs mots et des ponctuations
// * Faire une modification qui supprime deux proximités en même temps
// * Faire une proximité qui touche le premier mot, et vérifier que le premier mot du texte (firstMot), qui permet de le reconstruire à l'enregistrement, ait bien été modifié (sinon, il sera impossible de reconstruire le texte sans rechercher le premier mot)
// * Une destruction de mot qui ne fait que supprimer la proximité
// * Une destruction de mot qui crée une autre proximité plus lointaine
