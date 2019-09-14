'use strict';

TESTS.add("Modification d'une proximité avec mot créant une nouvelle proximité avec un autre canon", async function(){
  assert(1+1 == 3, "1+1 est bien égal à 3", "1+1 n'est pas du tout égal à 3, mon coco !")
})

TESTS.add(true,"Modification d'une proximité avec nouveau mot sans proximité ni canon existant", async function(){
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
  fieldFirstWord.focus()
  fieldFirstWord.innerHTML = 'auquel'
  fieldFirstWord.blur()
  fieldAfterWord.focus()

  // Il faut attendre jusqu'à ce que le traitement ait été effectué
  // Il y a des méthodes asynchrones ou des méthodes qui demandent confirmation
  // par l'auteur.
  await TESTS.waitFor(() => ProxModif.running === false)

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
  click("▶️")
  let firstMot  = Page.getInner('#word-before')
  let secondMot = Page.getInner('#word-after')
  assert(firstMot == 'doit' && secondMot == 'doivent', "La proximité suivante concerne 'doit' et 'doivent'", `La proximité suivante devrait concerner 'doit' et doivent', elle concerne '${firstMot}' et '${secondMot}'.`)
  click("▶️")
  firstMot  = Page.getInner('#word-before')
  secondMot = Page.getInner('#word-after')
  assert(firstMot == 'proximités' && secondMot == 'proximité', "La proximité suivante concerne 'proximités' et 'proximité'", `La proximité suivante devrait concerner 'proximités' et 'proximité', elle concerne '${firstMot}' et '${secondMot}'.`)

})

// * Faire une modification avec un mot dont le canon existe déjà (remplacer "permis", par "plusieurs")
// * Faire une modification avec un mot qui doit être ignoré (remplacer "qui" par "il")
// * Faire une modification avec plusieurs mots simples sans aucun canon
// * Faire une modification avec plusieurs mots simples où certains mots n'ont pas de canon
// * Faire une modification avec plusieurs mots simples où tous les canons doivent être faits
// * Faire une modification avec plusieurs mots et des ponctuations
// * Faire une modification qui supprime deux proximités en même temps
