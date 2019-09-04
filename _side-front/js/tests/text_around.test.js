'use strict'
/**
  Note : les modules de tests ne sont chargés que si la variable TESTS
  est true.
  Pour les jouer : TESTS=true npm start
**/
TESTS.tests.push(function(){
  assert(true, "Doit produire un succès", "Ne devrait pas produire un échec")
  assert(false, "Ne devrait pas produire un succès", "Doit produire un échec")
})
