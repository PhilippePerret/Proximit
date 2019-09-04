'use script'
/**

  inside_tests
  ------------
  version 1.0.0
**/

TESTS.start = function(){
  console.clear()
  TESTS.tests.forEach(fun => fun.call())
}

function assert(resultat, message_success, message_failure){
  if ( resultat ) {
    console.log("%c"+message_success, "color:green;font-weight:bold;")
    return true
  } else {
    console.error(message_failure)
    return false
  }
}
