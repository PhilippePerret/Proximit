# PROXIMIT
# NOTES

> Dernière note 001

## #001

**Concernant la non utilisation des offsets**

Lorsque l'analyse est faite, les offsets des mots est défini, qui permet de connaitre leur éloignement (et donc leur proximité). Au départ, il était prévu qu'on se serve de cet offset pour checker les proximités en cours de modification du texte. Mais à cause du fait que cet offset peut énormément bougé, par exemple lorsqu'il y a plusieurs mots qui doivent remplacer un mot unique, se servir d'eux s'avère trop coûteur.

Démonstration : par exemple, si on a un texte de 300 000 mots et qu'on remplace le mot "simple" qui se trouve à la deuxième place par le mot "compliqué", on il faut modifier l'offset des 299 998 mots qui suivent et, plus compliqué, le modifier aussi dans les données qui s'en servent, comme les canons qui les conservent dans une propriétés `offsets`.

Au lieu de fonctionner comme ça, on fait plutôt une lecture, à partir du mot recherché, en avant et en arrière pour voir si on trouve, dans la distance minimum du canon, un frère ou un jumeau du nouveau mot. C'est la méthode `Proximity.for` qui s'en charge.

En revanche, à l'enregistrement de la nouvelle table de résultats, on fait tous les calculs nécessaires pour enregistrer des offsets corrects.
