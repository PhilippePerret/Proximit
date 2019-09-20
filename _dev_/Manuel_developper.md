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
