'use script'

const TESTS_TIMEOUT_DEFAULT   = 10000 // 10 secondes
const TESTS_FREQUENCE_DEFAULT = 200 // tous les cinquièmes de seconde

const CONSOLE_TITLE_STYLE = "font-weight:bold;font-size:2em;text-decoration:underline;margin-top:2em;margin-bottom:0.3em;font-variant:small-caps;"
/**

  inside_tests
  ------------
  version 1.0.0
**/
Object.assign(TESTS,{
  name: 'Méthodes de TESTS'
, current: null
, init(){
    const my = this
    my.onlyTests      = []
    my.commonTests    = []
    my.excludedTests  = []
    return this ; // chainage éventuel
  }
, async start(){
    const my = this
    console.clear()
    my.title("Lancement des tests inside-tests")
    this.errors = []
    this.success_count = 0
    // La liste de tests à prendre, en fonction des focalisations (only) et des
    // exclusion
    if ( my.onlyTests.length ) {
      TESTS.tests = my.onlyTests
    } else {
      TESTS.tests = my.commonTests
    }
    this.runTest()
  }

  /**
    Pour jouer le test de données +dtest+
  **/
, async runTest(){
    const my = this
    // On prend le test courant, s'il y en a encore un
    let dtest = this.current = my.tests.shift()
    // S'il y en a encore un, on le lance, sinon, on marque
    // le rapport final
    if ( my.current ) {
      console.log("%c"+dtest.name, "font-weight:bold;font-size:1.3em;")
      try {
        const isAsync = dtest.function.toString().substring(0,50).split(' ')[0] == 'async'
        if ( isAsync ) {
          // <= Une promise
          await dtest.function.call()
        } else {
          // <= Pas une promise
          dtest.function.call()
        }
      } catch (e) {
        my.addError(e)
      } finally {
        // On passe au test suivant
        my.runTest()
      }
    } else {
      my.finale_report()
    }
  }

  /**
    Pour ajouter un test (utilisé par les feuilles de tests)

    Les arguments peuvent être :
    @param {String}   name  Le nom du test
    @param {Function} fun   La fonction contenant le test
    OU
    @param {Boolean}  runable True : c'est un des seuls tests à jouer
                              False : ce test doit être exclu.
    @param {String}   name    Nom du test
    @param {Function} fun     La fonction définissant le test
  **/
, add(name, fun, trois){
    const my = this

    if ( undefined === my.onlyTests ) {
      // => Il faut initialiser les tests
      my.init()
    }

    let runable = null ;

    if ( name === true || name === false) {
      runable = !!name
      name    = String(fun)
      fun     = trois
    }

    // === On prend les données du test pour faire un objet ===
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
    var dtest = {name:name, function:fun, filename:dpath[0].trim(), lineNumber:dpath[1], colNumber:dpath[2]}

    // On ajoute le test dans la liste adéquate
    if ( runable === true ) {
      // => La liste des tests à jouer est réduite
      my.onlyTests.push(dtest)
    } else if ( runable === false) {
      // => Ce test est à exclure
      my.excludedTests.push(dtest)
    } else {
      // => Un test "normal", ni only, ni exclu
      my.commonTests.push(dtest)
    }
  }
  /**
    Pour ajouter une erreur en cours de tests (pour pouvoir la ré-afficher
    plus bas et faire le résultat)
  **/
, addError(error_msg){
    this.errors.push(Object.assign(this.current,{error_msg:error_msg}))
  }
, finale_report(){
    const my = this
    const failures_count = this.errors.length
    const failure = failures_count > 0;
    const couleur = failure ? 'red' : 'blue'
    console.log("\n\n")
    console.log(`%c${this.success_count} succès,  ${failures_count} failure(s),  Pending : ---`, `font-size:1.3em;color:${couleur};font-weight:bold;`)
    this.errors.forEach(dfailure => {
      console.log(`%c${dfailure.name} : ${dfailure.error_msg}`, "padding-left:2em;color:red;")
      console.log(`%cIN: ${dfailure.filename} AT LINE: ${dfailure.lineNumber}`, "padding-left:22em;font-size:0.91em;color:red;")
    })
    if ( my.excludedTests ) {
      // <= Des tests ont été exclus
      // => On en indique la liste
      my.title("Tests exclus")
      my.excludedTests.forEach(dtest => console.log("- %s (%s, %d)", dtest.name, dtest.filename, dtest.lineNumber))
    }
    if ( failure ) {
      alert("Des erreurs sont survenues. Consulter la console.")
    }
    console.log("\n\n")
  }

, title(titre){
    console.log("%c"+titre, CONSOLE_TITLE_STYLE)
  }

  /** ---------------------------------------------------------------------
    | Méthodes utiles
  **/

  /**
    Attend jusqu'à ce que la fonction +funTrue+ retourne true
  **/
, waitFor(funTrue, options){
    options = options || {}
    const timeout   = options.timeout   || TESTS_TIMEOUT_DEFAULT
    const frequence = options.frequence || TESTS_FREQUENCE_DEFAULT
    return new Promise((ok,ko)=>{
      // Tous les laps millisecondes, on teste la méthode
      var laps  = 0
      var timer = setInterval(()=>{
        if ( funTrue.call() === true ) {
          ok()
        } else if ( laps > timeout ) {
          clearInterval(timer)
          timer = null
          ko()
        } else {
          // On poursuit
          laps += frequence
        }
      }, frequence)
    })
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
