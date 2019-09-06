'use script'
/**

  inside_tests
  ------------
  version 1.0.0
**/
Object.assign(TESTS,{
  name: 'Méthodes de TESTS'
, current: null
, start(){
    const my = this
    console.clear()
    this.errors = []
    this.success_count = 0
    TESTS.tests.forEach(dtest => my.runTest(dtest))
    this.finale_report()
  }
  /**
    Pour jouer le test de données +dtest+
  **/
, runTest(dtest){
    const my = this
    my.current = dtest
    console.log("%c"+dtest.name, "font-weight:bold;font-size:1.3em;")
    try {
      dtest.function.call()
    } catch (e) {
      this.addError(e)
    }
  }
  /**
    Pour ajouter un test (utilisé par les feuilles de tests)
  **/
, add(name, fun){
    // Pour récupérer le path de l'erreur
    let dpath;
    try {throw Error()}
    catch (e) {
      // On récupère le nom du fichier et la ligne
      let path = e.stack.split("\n").reverse()[0]
      let reg = new RegExp(`at file://${remote.app.getAppPath()}/_side-front/js/tests`)
      path  = path.replace(reg, ".")
      dpath = path.split(':')
    }
    TESTS.tests.push({name:name, function:fun, filename:dpath[0].trim(), lineNumber:dpath[1], colNumber:dpath[2]})
  }
  /**
    Pour ajouter une erreur en cours de tests (pour pouvoir la ré-afficher
    plus bas et faire le résultat)
  **/
, addError(error_msg){
    this.errors.push(Object.assign(this.current,{error_msg:error_msg}))
  }
, finale_report(){
    const failures_count = this.errors.length
    const failure = failures_count > 0;
    const couleur = failure ? 'red' : 'blue'
    console.log("\n\n")
    console.log(`%c${this.success_count} succès,  ${failures_count} failure(s),  Pending : ---`, `font-size:1.3em;color:${couleur};font-weight:bold;`)
    this.errors.forEach(dfailure => {
      console.log(`%c${dfailure.name} : ${dfailure.error_msg}`, "padding-left:2em;color:red;")
      console.log(`%cIN: ${dfailure.filename} AT LINE: ${dfailure.lineNumber}`, "padding-left:22em;font-size:0.91em;color:red;")
    })
    if ( failure ) {
      alert("Des erreurs sont survenues. Consulter la console.")
    }
    console.log("\n\n")
  }
})

function assert(resultat, message_success, message_failure){
  if ( resultat ) {
    TESTS.success_count += 1
    console.log("%c"+message_success, "padding-left:2em;color:green;font-weight:bold;")
    return true
  } else {
    if ( undefined === message_failure) message_failure = `FAUX : ${message_success}`
    // TESTS.addError(message_failure) // par le throw ci-dessous
    console.log("%c"+message_failure, "padding-left:2em;color:red;font-weight:bold;")
    throw new Error(message_failure)
    return false
  }
}
