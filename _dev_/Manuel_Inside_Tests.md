# Inside Tests
# Manuel d'utilisation

* [Todo List/Wish List](#todolist)
* [Description/introduction](#introduction)
* [Lancement des tests](#run_tests)
  * [Lancer seulement un test particulier](#run_only_special_tests)
  * [Exclure un ou des tests de l'analyse](#exclude_some_tests)
* [Construction d'un test](#build_a_test)
* [Interactions avec la page](#interact_with_page)

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

  assert(false,"pas de succès", "C'est un faux volontaire")
  // Produira l'échec "C'est un faux volontaire"

  assert(false, "4 est égal à 2 + 3")
  // Produira l'échec : "FAUX : 4 est égal à 2 + 3"
})

```

## Interactions avec la page {#interact_with_page}

Plusieurs méthodes existent pour intéragir avec la page HTML.

### `Page.get(<ref>[, <type>])` {#page_get_method}

Pas spécifiquement une méthode d'interaction, mais elle permet de récupérer un élément quelconque de la page, soit avec son sélecteur précis, son identifiant ou son contenu.

`<type>` peut être `button` ou `link` et limitera la recherche à ces éléments s'il est renseigné. Noter que le type `button` recherche dans les `button`, `input[type="button"]` et `input[type="submit"]`.

### `click(<ref>)` {#page_click_method}

Simule un click souris sur l'élément `<ref>`. `<ref>` peut être le sélecteur de l'élément (par exemple `#monIdBouton`), l'identifiant de l'élément (p.e. `monIdBouton`) ou le contenu textuel de l'élément (p.e. `Cliquez-moi !`).
