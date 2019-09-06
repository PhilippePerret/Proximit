'use strict'
/**
  Note : les modules de tests ne sont chargés que si la variable TESTS
  est true.
  Pour les jouer : TESTS=true npm start
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
