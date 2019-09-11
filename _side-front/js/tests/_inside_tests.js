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
    this.errors   = []
    this.pendings = []
    this.success_count = 0
    my.title("Lancement des tests inside-tests")
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
          await dtest.function.call().catch((err)=>{throw(err)})
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
        , failure   = failures_count > 0
        , s_failure = (!failure || failures_count > 1) ? 's' : '';
    const pending_count = this.pendings.length
        , pending   = pending_count > 0
        , s_pending = (!pending || pending_count > 1) ? 's' : '';
    const couleur = failure ? 'red' : 'blue'
    console.log("\n\n")
    console.log(`%c${this.success_count} succès,  ${failures_count} failure${s_failure},  ${pending_count} pending${s_pending}`, `font-size:1.3em;color:${couleur};font-weight:bold;`)
    this.errors.forEach(dfailure => {
      console.log(`%c${dfailure.name} : ${dfailure.error_msg}`, "padding-left:2em;color:red;")
      console.log(`%cIN: ${dfailure.filename} AT LINE: ${dfailure.lineNumber}`, "padding-left:22em;font-size:0.91em;color:red;")
    })
    if ( my.excludedTests.length ) {
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

, addSuccess(message){
    TESTS.success_count += 1
    console.log("%c"+message, "padding-left:2em;color:green;font-weight:bold;")
    return true
  }
, addFailure(message_failure, message_success){
    if ( !message_failure) message_failure = `FAUX : ${message_success}`
    console.log("%c"+message_failure, "padding-left:2em;color:red;font-weight:bold;")
    throw new Error(message_failure)
    return false
  }
, addPending(message){
    console.log("%c"+message, "padding-left:2em;color:orange;font-weight:bold;")
    this.pendings.push(message)
  }
})

function assert(resultat, message_success, message_failure){
  if ( resultat ) {
    return TESTS.addSuccess(message_success)
  } else {
    return TESTS.addFailure(message_failure, message_success)
  }
}
function pending(message){
  return TESTS.addPending(message||'')
}


/**
  | ---------------------------------------------------------------------
  |
  | CLASS PAGE
  | ----------
  | Pour les tests de la page courante, avec pour commencer la méthode de
  | test `has`
  |
**/
const Page = {
  name: 'Objet pour tester la page courante'

  /**
    |
    | Retourne l'élément DOM désigné par +ref+, qui peut être un titre, un
    | id ou un name
    |
    | Si +type+ est indéfini ou "button", on cherchera un bouton par son
    | contenu (titre).
    | Si +type+ est indéfini ou "link", on cherchera un lien également par
    | son titre/texte.
    |
  **/
, get(ref, type){
    var c = document.querySelector(ref)
    if ( c ) return c
    c = document.querySelector(`#${ref}`)
    if ( c ) return c
    if ( undefined === type || type == 'button' ) {
      var tags = document.querySelectorAll('button, input[type="button"], input[type="submit"]')
      for ( var tag of tags ) { if ( tag.innerHTML == ref ) return tag }
    } else if ( undefined === type || type == 'link' ) {
      var tags = document.querySelectorAll('A')
      for ( var tag of tags ) { if ( tag.innerHTML == ref ) return tag }
    }
  }

  /**
    Retourne le contenu de l'élément de référence +ref+ (cf. la méthode `get`)
    en le simplifiant (pour le moment, les insécables sont remplacées par des
    espaces simples et les apostrophes courbes par des apostrophes droits)
  **/
, getInner(ref, type){
    let element = this.get(ref, type)
    if (undefined === element) throw new Error(`L'élément de référence "${ref}" est introuvable. Impossible de retourner son contenu.`)
    return element.innerHTML.replace(/( |&nbsp;)/g,' ').replace(/’/g, "'")
  }
  /**
    Produit un succès si la balise +tag+ existe avec les attributs et le
    contenu défini par +attrs+

    Attributs particuliers
    ----------------------
      :resOnly      Si true, on ne fait que renvoyer le résultat du test.
                    Sert par exemple pour `has_not`
      :attrs        Des attributs supplémentaires non commun (donc hors de
                    id, class, title)
      :visible      Si true, l'élément doit être visible
      :checked      Si true, l'élément doit être checké
  **/
, has(tag, attrs, success_message, failure_message){
    let attrs_init = {}
    Object.assign(attrs_init, attrs)
    let onlyResultat = attrs.resOnly
    delete attrs.resOnly
    let text = attrs.text
    delete attrs.text
    let visible = attrs.visible
    delete attrs.visible
    let checked = attrs.checked
    delete attrs.checked

    var sel = `${tag}`
    attrs.id    && (sel += `#${attrs.id}`)
    if (undefined !== attrs.class){
      if ('string' === typeof attrs.class) attrs.class = [attrs.class]
      sel += `.${attrs.class.join('.')}`
    }

    attrs.title && ( sel += `[title=\"${attrs.title}\"]` )

    if ( attrs.attrs ) {
      for ( var attr in attrs.attrs ) {
        sel += `[${attr}=\"${attrs.attrs[attr]}\"]`
      }
    }

    // Débug
    // console.log("Sélecteur à trouver :", sel)

    let el = document.querySelector(sel)
    let ok = !!el

    if ( ok && text ) {
      let contenu = el.innerHTML
      ok = contenu.match(text)
    }

    if ( ok && undefined !== checked ) {
      // TODO Vérifier par le DOM si l'élément est checké
    }

    if ( onlyResultat ) return ok
    else {
      let refEl = `L'élément DOM défini par ${JSON.stringify(attrs_init)}`
      if ( ok ) {
        TESTS.addSuccess(success_message || `${refEl} existe bien.`)
      } else {
        TESTS.addFailure(failure_message || `${refEl} devrait exister`)
      }
    }
  }

, not_has(tag, attrs, success_message, failure_message){
    attrs = attrs || {}
    Object.assign(attrs,{resOnly:true})
    if ( false === this.has(tag, attrs, success_message, failure_message) ) {
      TESTS.addSuccess(success_message)
    } else {
      TESTS.addFailure(failure_message, success_message)
    }
  }
}

/**
  Simule le click sur l'élément référencé par +ref+
  +ref+ peut être le titre du bouton/lien/input-submit/etc., son identifiant ou
  son name.
**/
function click(ref, type){
  // Dans un premier temps, il faut trouver l'élément
  let element = Page.get(ref, type)
  // console.log("élément trouvé : ", element)
  if ( element ) element.click()
  else { throw new Error(`Impossible de trouver l'élément référencé par '${ref}'`)}
}
