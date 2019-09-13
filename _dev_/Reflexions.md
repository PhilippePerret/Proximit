# Réflexion de fonctionnement

## Réflexion sur la modification

QUESTION : faut-il tenir compte des offsets, en sachant que lorsqu'un des premiers mots est modifié, il faudrait modifier l'offset de tous les mots (ça peut être des centaines de milliers) après.
En réalité, à quoi sert cette offset, si ce n'est, au moment de la relève des mots, pour déterminer le mot exact et le texte entre deux mots consécutifs.
Mais ensuite, c'est le mot et le tbw qui permet de reconstituer le texte.
=> Pour le moment, ne tenir aucun compte des changements d'offset (et voir à l'usage si ça pose problème).

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
