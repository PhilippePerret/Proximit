'use strict'


const Sys = {
}

document.addEventListener('DOMContentLoaded', function(event) {
  // console.clear()
  App.init.call(App)
  if ( TESTS ) TESTS.start()
})
