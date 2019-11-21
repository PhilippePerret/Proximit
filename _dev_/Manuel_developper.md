# PROXIMIT
# Manuel développeur

* [Présentation générale du fonctionnement de l'application](#fonctionnementgeneral)
  * [Concrètement dans le programme](#fctgeneinprogramme)
  * [Fonctionnement de l'affichage des pages](#fonctionnementaffpages)
* [Principes généraux](#principes_generaux)
* [Tests](#les_tests)
* [Obtenir l'instance d'un mot quelconque](#get_mot)
* [Modification d'une proximité](#modify_a_prox)
* [Appendum (gestion des modifications)](#laddendum)

## Présentation générale du fonctionnement de l'application {#fonctionnementgeneral}

**Proximi** permet de travailler sur un texte en se concentrant sur les proximités, qui sont abordés de façon plus profonde et plus souple qu'un logiciel comme [Antidote](https://www.antidote.info/fr).

* Un texte est choisi (soit le dernier ouvert, soit un texte choisi par le menu ou
  `CMD+O`). Le meilleur format est le format [Markdown](https://fr.wikipedia.org/wiki/Markdown) qui permet une mise en forme qui sera conservée dans le traitement.
* Ce texte est découpé en pages de 1500 caractères (par défaut) ou du nombre déterminé dans les préférences. Cela produit des instances `PPage` de la page.
* La première page (par défaut) ou la dernière page travaillée est affichée dans une section DOM (un `div`) gérée par [`editorjs`](https://editorjs.io/). Pour être affichée, on initialise chaque fois un nouvel éditeur (tant qu'on ne sait pas utiliser le `render` de `editorjs`), en transformant le contenu de la page en `data` compréhensible par `editorjs`, c'est-à-dire un object `blocks` qui contient les différents paragraphes et qui ressemble à :
```javascript

        [
          {
              type:'paragraph'
            , data:{text: "Texte du [paragraphe](https://fr.wikipedia.org/wiki/Paragraphe)."}
          }
        , {
              type:'paragraph'
            , data:{text: "Texte du <i>deuxième</i> paragraphe."}
          }
          // etc.
        ]

```
Noter que cet objet est agrémenté d'une nouvelle propriété `raw` qui permet de conserver une version brut du texte, sans formatage et sans lien, pour être analysé par le programme au niveau des proximités. La donnée réelle ressemble donc à :
```javascript

        [
          {
              type:'paragraph'
            , data:{
                  text: "Texte du [paragraphe](https://fr.wikipedia.org/wiki/Paragraphe)."
                , raw: "Texte du paragraph"
              }
          }
        , {
              type:'paragraph'
            , data:{
                  text: "Texte du <i>deuxième</i> paragraphe."
                , raw: "Texte du deuxième paragraphe."
              }
          }
          // etc.
        ]


```
* Toutes les 5 secondes, le texte de la page éditée est vérifiée au niveau des proximités (si elle a été modifiée) et ces proximités sont affichées en regard du texte, dans un *texte mirroir* qui reprend le texte original, mais en présentant toutes les proximités trouvés (et les fréquences de certains mots lorsqu'elle est élevée).

### Concrètement dans le programme {#fctgeneinprogramme}

* Si aucun texte n'est choisi, rien ne se passe, l'application attend que l'auteur en choisisse un.
* Pour choisir le texte (par menu ou raccourci), l'auteur passe par `PTexte::chooseText()`.
* Si un texte était déjà en édition et non sauvegardé, on avertit l'auteur et il choisit soit de renoncer, soit d'enregistrer le texte courant (`PTexte::saveAndChooseText()`) soit d'ignorer les modifications et de choisir directement le texte (`PTexte::proceedChooseText()`)
* `PTexte` se ressette (`PTexte::reset()`) (\*), ouvre le texte (`PTexte::open`) en le mettant en texte courant (dans `PTexte.current`). Il initie cette instance `PTexte` (`PTexte#open`). (\*) Cette initialisation consiste à nettoyer l'interface et à mettre toutes les valeurs connues à zéro, et notamment les comptes de proximités, de mots, de canon, etc.
* La méthode `PTexte#open` ouvre le texte. Cela consiste à :
  * régler l'interface (titre, hauteur pour prendre toute la place, résultat d'une précédente analyse le cas échéant, etc.) avec `PTexte#setUI()`
  * découper le texte entier en pages (instances `PPage`)
  *
* L'auteur peut mettre en route la surveillance des proximités en cliquant sur le bouton "Surveiller" en pied de page (ou autre bouton équivalent, ou le menu "Surveiller le texte").


### Fonctionnement de l'affichage des pages {#fonctionnementaffpages}

o On ouvre un texte
  <> Il contient une seule page
      => on étudie cette page et on affiche les proximités
  <> Il contient plus d'une page
      => on étudie la page et la page suivante
      => on affiche la page et son miroir taggué
      => [Coulisses] on construit la page suivante et son miroir taggué
        (note : pour le miroir taggué, il faut prendre en compte la 3e page)
      o On passe à la page suivante
        => On affiche la page
        => On construit la page suivante
        => On étudie les proximités avec la page suivante

Définition précise des méthodes :

`show()` pour afficher la page normale et la page miroir, entendu qu'il faut
  toujours afficher la page miroir avec
  Si la page n'est pas construite, il faut la construire (build)
  NOTE : dans la méthode générale appelant 'show', il faut regarder si la
  page possède des pages autour (prev et next) et les construire si elles ne
  le sont pas (pour accélérer l'affichage).
  NOTE 2 : pendant cette construction (le check ?), il faudrait empêcher de
  pouvoir passer à une autre page.

`showTagged()` pour afficher la page miroir taggué (et seulement ça)
  Si la page tagguée n'est pas construite, il faut la construire (buildTagged)

`build()` Construction de la page normale et de la page tagguée si nécessaire
`buildTagged()` Construction de la page tagguée. Si la page n'a pas été checkée, il faut le faire (check())

`check()` Vérification des proximités de la page
  En prenant les pages autour.

Note : toutes ces méthodes sont asynchrones puisqu'elles peuvent, dans l'absolu, appeler le check des proximités.


## Principes généraux {#principes_generaux}

* Tous les mots, mêmes les mots exclus ou les mots trop courts sont enregistrés dans la liste des canons (`table_resultats.datas.canons.datas`)
* Un mot quelconque possède un identifiant unique et inaltérable (même lorsque le mot change complètement)
* Un mot conserve en donnée le bout de texte (souvent une unique espace) qui le sépare du mot suivant (`tbw` — pour "[t]ext [b]etween [w]ords"). Ce bout de texte permet de reconstruire l'intégralité du texte.
* Un mot définit son mot précédent (`idP`) et son mot suivant (`idN`) qui, s'ils sont définis, permettent de reconstruire le mot.
* Une proximité est définie par deux mots à distance inférieure de la distance minimale par défaut ou la distance minimale personnalisée pour le texte. Le premier mot s'appelle `motA` et le second mot s'appelle `motB`.
* L'analyse du texte/des mots se fait en back-side, en ruby. Mais une partie est tout de même dévolue à JS pour modifier les données en live.

---------------------------------------------------------------------

## Les Tests {#les_tests}

Il y a deux types de tests dans **Proximi**, les premiers au niveau de l'analyse de texte, en ruby, effectués par `RSpec`. Il suffit donc, pour les lancer, de jouer `rspec spec/tests` ou `rspec spec/features`.

Les seconds testent le fonctionnement de l'application en intégration et utilisent mes `insite-tests` (version hyper-simplifiée). Cf. le document « Manuel_Inside_Tests.md ».

Pour lancer ces seconds tests il suffit de jouer `npm test`.

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

ABANDONNÉ. Maintenant, les modifications sont enregistrées.
