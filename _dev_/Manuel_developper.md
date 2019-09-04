# Proximit
# Manuel développeur

* [Principes généraux](#principes_generaux)
* [Tests](#les_tests)
* [Obtenir l'instance d'un mot quelconque](#get_mot)
* [Modification d'une proximité](#modify_a_prox)
* [Appendum (gestion des modifications)](#laddendum)

## Principes généraux {#principes_generaux}

* Tous les mots, mêmes les mots exclus ou les mots trop courts sont enregistrés dans la liste des canons (`table_resultats.datas.canons.datas`)
* Un mot quelconque possède un identifiant unique et inaltérable (même lorsque le mot change complètement)
* Un mot conserve en donnée le bout de texte (souvent une unique espace) qui le sépare du mot suivant (`tbw` — pour "[t]ext [b]etween [w]ords"). Ce bout de texte permet de reconstruire l'intégralité du texte.
* Un mot définit son mot précédent (`idP`) et son mot suivant (`idN`) qui, s'ils sont définis, permettent de reconstruire le mot.
* Une proximité est définie par deux mots à distance inférieure de la distance minimale par défaut ou la distance minimale personnalisée pour le texte. Le premier mot s'appelle `motA` et le second mot s'appelle `motB`.
* L'analyse du texte/des mots se fait en back-side, en ruby. Mais une partie est tout de même dévolue à JS pour modifier les données en live.
* La première analyse, fait côté "serveur", n'est pas modifiée en cours de travail, un Addendum permet de mémoriser les changemens. C'est seulement lorsque l'auteur le décide que le texte est vraiment modifié pour prendre en compte les changements et qu'une nouvelle analyse est produite.

---------------------------------------------------------------------

## Les Tests {#les_tests}

Pour lancer les tests : `npm test`. Noter qu'il faut ensuite rejouer `npm run start-update` pour supprimer le chargement des modules de tests. Dans le cas contraire, ils ne seraient pas joués mais ils seraient chargés.

On utilise ici les `inside_tests` qui jouent les tests de l'intérieur. Pour que ça fonctionne, il faut :

* la librairie `inside_tests.js` dans le dossier `js/tests`,
* que le `main.html` contienne `<script type="text/javascript">const TESTS={tests:[]}`,
* que les tests (fichiers dans `js/tests`) définissent les tests à l'aide `TESTS.tests.push(function(){/* ici le test opéré */})`,
* que le `$(document).ready` appelle la méthode `TESTS.start()`

### Création des tests {#create_tests}

La création des tests se fait dans le dossier `js/tests` et ils s'écrivent comme du javascript normal, sans se prendre la tête.

On peut juste utiliser les méthodes `assert(valeur, message succès, message erreur)` pour produire des succès ou des erreurs dans la console suivant la valeur de `valeur`.

---------------------------------------------------------------------

## Obtenir l'instance d'un mot quelconque {#get_mot}

Pour retrouver un mot précis dans le programme JS, on utilise simplement la méthode `Mot.get(<id>)`. Cette méthode retourne l'instance `Mot` du mot, qui contient toutes ses données.


## Modification d'une proximité {#modify_a_prox}

Quand on modifie une proximité, c'est la class `ProxModif` qu'on invoque, avec l'instance `{Mot}` du mot remplacé et le nouveau mot (ou *les* nouveaux mots) qui doivent remplacer le mot.

De nombreux cas peuvent se présenter, parmi :

* les deux mots ont le même canon,
* le nouveau mot appartient à un canon existant/inexistant,
* il y a plusieurs mots présentant chacun des cas différents,


## Appendum (gestion des modifications) {#laddendum}

Au cours du travail sur les proximités, les données enregistrées en fichier, dans le dossier de proximités, ne sont jamais modifiées. Au lieu de ça, c'est un *Addendum* qui est géré, contenant toutes les modifications à faire.

Par exemple, si un canon est créé pour un nouveau nom, il est enregistré dans l'addendum et sera recréé au chargement de la page. Si un mot est remplacé par un autre, il gardera le même identifiant mais le mot sera changé, ainsi que tous les changements enregistrés (son canon par exemple). Lorsqu'une proximité sera supprimée, elle le sera dans l'addendum.

Les modifications seront vraiment effectuées lorsque l'auteur décidera de produire le nouveau texte prenant compte des modifications. Dans ce cas, le texte (ou les textes) original sera modifié et une nouvelle analyse sera produite, tenant compte évidemment des changements.

Cf. le fichier `./js/first-required/app/Addendum.js` qui définit la constante gérant le fichier `Addendum.js` du dossier des proximités (qui contient)
