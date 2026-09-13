Kaki Cube est une application web réalisée en Nuxt.js avec Socket.io pour la transmission des données.

Cette application permet de créer des salles privées ou publiques afin de pouvoir faire s'affronter des Speedcubeurs sur n'importe quelle épreuve WCA.
Le principal avantage est que l'utilisation du site ne nécessite aucun compte pour pouvoir totalement l'utiliser.

#### *Pourquoi un dossier frontend/ ?*

###### A l'origine il y avait un dossier frontend/ et un dossier server/ afin de séparer les deux logiques et de pouvoir avoir un server isolé.

###### Finalement, lancer deux instances (une serveur node.js et une nuxt.js) était plus compliqué d'autre chose (même si c'est théoriquement possible de travailler qu'avec le .output/ du frontend).

###### Nuxt.js propose de combiner facilement les deux en un : j'ai finalement tout rassemblé dans frontend/.
###### Migrer les fichiers hors du dossier frontend/ ferrait perdre l'historique de tous les fichiers.
