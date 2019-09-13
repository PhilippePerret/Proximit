# Inside Tests
# Manuel d'utilisation

* [Todo List/Wish List](#todolist)
* [Description/introduction](#introduction)
* [Lancement des tests](#run_tests)
  * [Lancer seulement un test particulier](#run_only_special_tests)
  * [Exclure un ou des tests de l'analyse](#exclude_some_tests)
* [Construction d'un test](#build_a_test)
  * [Les assertions](#les_assertions)
    * [assert](#assertion_assert)
    * [Les vérification silencieuses avec `assert`](#assertion_verif_silencieuse)
    * [Page.has](#assertion_page_has)
* [Interactions avec la page](#interact_with_page)
  * [Obtenir un élément (`Page.get(<ref>[, <type>])`)](#page_get_method)
  * [Obtenir le contenu d'un élément (`Page.getInner`)](#page_getinner_method)
  * [Simuler un click](#page_click_method)
  * [Simuler une case cochée/décochée](#page_check_method)

## Todo List/Wish List {#todolist}

* S'assure que c'est bien le module `_inside_tests.js` qui est chargé en tout premier.

## Description/introduction {#introduction}

Les *Inside Tests* permettent de lancer des tests de l'intérieur même de l'application (note : c'est une version simplifiée de la version précédente).

Noter donc une chose très simple : si l'application ne peut pas se charger, on ne peut pas la tester.

## Lancement des tests {#run_tests}

Pour lancer les tests : `npm test`. Noter qu'il faut ensuite rejouer `npm run start-update` pour supprimer le chargement des modules de tests. Dans le cas contraire, ils ne seraient pas joués mais ils seraient chargés.

On utilise ici les `inside_tests` qui jouent les tests de l'intérieur. Pour que ça fonctionne, il faut :

* la librairie `_inside_tests.js` dans le dossier `js/tests`,
* que le `main.html` contienne `<script type="text/javascript">const TESTS={tests:[]}</script>`,
* que les tests (fichiers dans `js/tests`) définissent les tests à l'aide `TESTS.add("nom du test", function(){/* ici le test opéré */})`,
* que le `$(document).ready` appelle la méthode `TESTS.start()` (par exemple par le biais de la méthode `App.init()`).

### Lancer seulement un test particulier {#run_only_special_tests}

Pour ne lancer qu'un ou plusieurs tests particuliers, il suffit d'ajouter `true` au début de leur définition avec `TESTS.add` :

```javascript

TESTS.add(true, "Mon seul test à jouer", function(){/* le test ici */})

```

### Exclure un ou des tests de l'analyse {#exclude_some_tests}

Inversement, pour exclure des tests, il suffit d'ajouter `false` en premier argument de leur définition.

```javascript

TESTS.add(false, "Ce test sera exclu", function(){/* le test ici */})

```

---------------------------------------------------------------------

## Construction d'un test {#build_a_test}

Pour construire un test, il suffit de créer un fichier dans le dossier `<app>/_side-front/js/tests/` et de mettre dedans :

```javascript

TESTS.add("Mon tests", ()=>{

  assert(4 = 2 + 2, "Le calcul est juste")
  // Produira le succès "Le calcul est juste"

  assert(false, "pas de succès", "C'est un faux volontaire")
  // Produira l'échec "C'est un faux volontaire"

  assert(false, "4 est égal à 2 + 3")
  // Produira l'échec : "FAUX : 4 est égal à 2 + 3"
})

```

### Les assertions {#les_assertions}

#### assert {#assertion_assert}

L'assertion de base se construit par :

```javascript

assert(<resultat booleen>, "<message en cas de succès>"[, "<message en cas d'échec>"])

```

Si le message en cas d'échec n'est pas stipulé, on utilisera le message `FAUX : <message en cas de succès>`.

#### Les vérification silencieuses avec `assert` {#assertion_verif_silencieuse}

La méthode `assert` permet aussi de faire des *vérifications silencieuse*, c'est-à-dire des tests, qui ne sont pas considérés comme tels et n'affiche un message d'erreur que lorsqu'ils échouent. On les construit en mettant en premier argument de la méthode `assert` le niveau de verbosité minimum qu'il faut pour que le message possitif s'affiche :

```javascript

assert(<verbosity level>, <resultat boolean>, "<message succès>")

```

Noter que le niveau de verbosité n'est considéré qu'en cas de succès (l'échec provoque toujours le message d'erreur). Si le `verbosity level` est supérieur au niveau courant (5 par défaut), alors le message de succès ne s'affiche pas. Inversement, si le niveau de verbosité est inférieur ou égal au niveau courant, alors le message de succès s'affiche dans le rapport de test, indiquant la vérification.

#### Page.has {#assertion_page_has}

## Interactions avec la page {#interact_with_page}

Plusieurs méthodes existent pour intéragir avec la page HTML.

### Obtenir un élément (`Page.get(<ref>[, <type>])`) {#page_get_method}

Pas spécifiquement une méthode d'interaction, mais elle permet de récupérer un élément quelconque de la page, soit avec son sélecteur précis, son identifiant ou son contenu.

`<type>` peut être `button` ou `link` et limitera la recherche à ces éléments s'il est renseigné. Noter que le type `button` recherche dans les `button`, `input[type="button"]` et `input[type="submit"]`.

### Obtenir le contenu d'un élément (`Page.getInner`) {#page_getinner_method}

La méthode `Page.getInner(<reference>)` permet d'obtenir le contenu (`innerHTML`) de l'élément de référence `<reference>`.

Noter cependant **un point important** : dans ce retour, toutes les espaces insécables ont été remplacées par des espaces simples et les apostrophes courbes par des apostrophes droits. Ceci afin de faciliter les travaux de comparaison.

### `click(<ref>)` {#page_click_method}

Simule un click souris sur l'élément `<ref>`. `<ref>` peut être le sélecteur de l'élément (par exemple `#monIdBouton`), l'identifiant de l'élément (p.e. `monIdBouton`) ou le contenu textuel de l'élément (p.e. `Cliquez-moi !`).

### Simuler une case cochée/décochée {#page_check_method}

La méthode `check(<ref element>)` ou `uncheck(<ref element>)` permet de cocher ou de décocher la case (input type "checkbox") de référence `<ref element>`.

Noter que la procédure déclenche l'évènement `onclick` s'il est défini sur la case à cocher.
