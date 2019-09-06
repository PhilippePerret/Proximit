# Inside Tests
# Manuel d'utilisation

* [Description/introduction](#introduction)
* [Lancement des tests](#run_tests)
* [Construction d'un test](#build_a_test)

## Description/introduction {#introduction}

Les *Inside Tests* permettent de lancer des tests de l'intérieur même de l'application (note : c'est une version simplifiée de la version précédente).

Noter donc une chose très simple : si l'application ne peut pas se charger, on ne peut pas la tester.

## Lancement des tests {#run_tests}

Pour lancer les tests : `npm test`. Noter qu'il faut ensuite rejouer `npm run start-update` pour supprimer le chargement des modules de tests. Dans le cas contraire, ils ne seraient pas joués mais ils seraient chargés.

On utilise ici les `inside_tests` qui jouent les tests de l'intérieur. Pour que ça fonctionne, il faut :

* la librairie `inside_tests.js` dans le dossier `js/tests`,
* que le `main.html` contienne `<script type="text/javascript">const TESTS={tests:[]}</script>`,
* que les tests (fichiers dans `js/tests`) définissent les tests à l'aide `TESTS.add("nom du test", function(){/* ici le test opéré */})`,
* que le `$(document).ready` appelle la méthode `TESTS.start()` (par exemple par le biais de la méthode `App.init()`).

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
