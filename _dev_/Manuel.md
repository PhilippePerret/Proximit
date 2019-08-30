

## Liste de proximités propre au texte

Dans le fichier proximit du texte, on peut définir un fichier `__proximites.txt` qui va contenir les proximités propres au projet. Ce fichier contient une ligne définissant la proximité minimale (un nombre) et dessous tous les mots qui doivent être abordés avec cette proximité minimale. Les lignes commençant par `#` sont des commentaires.

```ruby

200
Mot1
Mot2
Mot3
# Les lignes ci-dessus définissent que les trois mots seront considérés
# comme proches s'ils sont à moins de 200 caractères.

0
Mot4
Mot5
# Les deux mots ci-dessus ne seront jamais considérés en proximité.

```


Par exemple, ce fichier peut contenir en tout premier lieu le nom du protagoniste de l'histoire, en définissant que ses proximités peuvent être réduites par rapport à la valeur courante. Si la protagoniste s'appelle `France` alors le fichier pourra contenir :

```
250
France

```

Ce qui signifie que les mots `France` ne seront signalés comme proche que s'ils sont à moins de 250 caractères, contrairement aux 1500 habituels.
