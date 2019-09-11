'use strict'
/**
  Tests préliminaires de l'application Proximit
  Tous les objets utiles doivent être définis.
**/
TESTS.add("Test de l'existence des objets", function(){
  // Toutes les classes doit être définies
  const classes = [
      [typeof(PTexte), "PTexte"]
    , [typeof(Mot), "Mot"]
    , [typeof(Proximity), "Proximity"]
    , [typeof(Canon), "Canon"]
    , [typeof(App), "App"]
    // , [typeof(ErreurExpres), "ErreurExprès"]
    , [typeof(Addendum), "Addendum"]
    , [typeof(ProxModif), "ProxModif"]
  ]
  classes.forEach( paire => {
    assert('undefined'!==paire[0],`${paire[1]} est un object défini.`, `${paire[1]} devrait être un object défini (c'est un ${paire[0]}).`)
  })
})
