'use strict'


const Sys = {
}

document.addEventListener('DOMContentLoaded', function(event) {
  // console.clear()
  UI.waiter("Pour voir l'application se charger avec un long texte…")
  App.init.call(App)
  if ( TESTS ) TESTS.start()
})
