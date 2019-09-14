# Réflexion de fonctionnement

## REFLEXION 02

Comme précisé dans une note, l'offset est au cœur du fonction de l'application, puisque c'est lui permet de connaitre l'éloignement des mots.

Cependant, modifier les offsets peut être extrêmement consommateur entendu que pour le faire, il faut :

* modifier tous les offsets des mots suivant le mot modifié
* modifier tous les offsets de tous les canons
* modifier toutes ces données dans la table de résultats qu'il faut enregistrer

Ne vaudrait-il pas mieux d'imaginer un autre système pour surveiller les proximités : en vérifiant chaque fois qu'un mot est modifié s'il possède un "frère" ou un "jumeau" dans la distance limite.

Pour le moment, pour savoir si un mot est en proximité avec un frère ou un jumeau, on se sert de la liste `offsets` du canon. C'est extrêmement rapide, mais on pourrait lui reprocher cependant de fonctionner toujours depuis la première occurence. Si on est sur le mot "texte" qui possède 6000 occurences, et qu'on modifie le dernier texte, les 6000 offsets doivent être testés pour trouver le dernier.

Ici, on fonctionnerait plutôt de cette manière : quand un mot est modifié, grâce à son `idN` et `idP` qui donne l'identifiant du mot avant et après, on peut remonter jusqu'à la distance de proximité minimale (donnée par le canon). On peut savoir à quelle distance on se trouve du mot grâce à la donnée `full_length` du mot qui comptabiliserait la longueur du mot et la longueur du `btw`. Cela ne ferait qu'approximativement 500 mots à checker, en sachant que ce serait juste des propriétés qu'il faudrait lire, et que la seule opération serait une opération d'addition sur la distance courante (c'est la propriété `canon` qui permettrait de savoir si on rencontre un frère ou un jumeau).

Note : c'est seulement à la toute fin, au moment d'enregistrer la table des résultats, qu'on pourrait actualiser les offsets pour leur donner leur vrai valeur. Mais à quoi cela servirait-il au fond si le système ci-dessus est adopté.

## Réflexion sur la modification

QUESTION : faut-il tenir compte des offsets, en sachant que lorsqu'un des premiers mots est modifié, il faudrait modifier l'offset de tous les mots (ça peut être des centaines de milliers) après.
En réalité, à quoi sert cet offset, si ce n'est, au moment de la relève des mots, pour déterminer le mot exact et le texte entre deux mots consécutifs.
NON !!!! CET OFFSET est au contraire au cœur de l'application puisque c'est lui qui permet de gérer les proximités. Ces proximités sont calculées en fonction de l'offset.
DONC => IL EST INDISPENSABLE DE LE TENIR À JOUR, QUELLES QUE SOIENT LES OPÉRATIONS QUE ÇA DEMANDE.
À la rigueur : content le temps de modification pour estimer le temps.
Mettre un message "Rectification des offsets…" lorsque c'est nécessaire.

QUESTION : Lorsqu'un mot est changé, faut-il changer l'instance ou changer les données du mot précédent ? A priori, je serais plus partant de créer une nouvelle instance, pour que les propriétés calculées puissent l'être.


## Principe lors de la modification d'une proximité

- OLDM est identique à NIRM et trop proche. Ils appartiennent au canon OLDC.
- OLDM est remplacé par NEWM

CAS 1 - OLDM est remplacé par un mot unique, NEWM
--------------------------------------------------

CAS A - Une autre proximité a été détectée
------------------------------------------

La nouvelle proximité est signalée, pour confirmation : soit on prend en
compte cette modification, soit on renonce (on revient au mot OLDM)

CAS B - Aucune autre proximité n'a été détectée
-----------------------------------------------


CAS 1.1 - OLDM et NEWM ont le même canon mais NEWM est différent de NIRM [1]
----------------------------------------------------------------------
  L'indice de similarité diminue, mais la proximité demeure
  Elle doit pouvoir être omise (continuer d'exister, mais sans la montrer)
  Aucune autre modification n'est à faire, le canon ne change pas.

CAS 1.2 - OLDM et NEWM n'ont pas le même canon
-----------------------------------------
  - OLDM doit être retiré du canon OLDC

  CAS 1.2.1 le canon de NEWM n'existe pas (NEWC)
  ----------------------------------------
    - Le canon NEWC doit être créé
    - Le mot NEWM doit être ajouté au canon NEWC

  CAS 1.2.2 le canon de NEWM existe déjà (OTHC)
  ---------------------------------------
    - Le mot NEWM doit être ajouté au canon OTHC

CAS 2 - NEWM est remplacé par plusieurs mots
---------------------------------------------

Il faut procéder à l'étude de chaque mot, comme s'il était unique,
en considérant chaque fois les nouveaux écartements que ça produit.


-----------------------------------------------------------------------
Notes
=====
[1] Même si ça ne résout pas complètement le problème de proximité, ça l'« adoucit » si les mots sont différents.

## Une proximité est *retirée* sans changer les mots

=> Bouton pour supprimer la proximité (ne plus la considérer, appeler ça "la déconsidérer").

- On cherche si le motA (premier mot) crée une proximité
  avec le prochain mot du même canon
- On cherche si le motB (second mot) créer une proximité
  avec le mot précédent motA dans le même canon
