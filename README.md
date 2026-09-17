Kaki Cube est une application web réalisée en Nuxt.js avec Socket.io pour la transmission des données.

Cette application permet de créer des salles privées ou publiques afin de pouvoir faire s'affronter des Speedcubeurs sur n'importe quelle épreuve WCA.
Le principal avantage est que l'utilisation du site ne nécessite aucun compte pour pouvoir totalement l'utiliser.

#### *Pourquoi un dossier frontend/ ?*

###### A l'origine il y avait un dossier frontend/ et un dossier server/ afin de séparer les deux logiques et de pouvoir avoir un server isolé.

###### Finalement, lancer deux instances (une serveur node.js et une nuxt.js) était plus compliqué d'autre chose (même si c'est théoriquement possible de travailler qu'avec le .output/ du frontend).

###### Nuxt.js propose de combiner facilement les deux en un : j'ai finalement tout rassemblé dans frontend/.
###### Migrer les fichiers hors du dossier frontend/ ferrait perdre l'historique de tous les fichiers.



#### Mise au clair au sujet de l’utilisation de l'intelligence artificielle sur le projet.


##### l'IA générative a été utilisée uniquement pour : 

###### - Trouver plus facilement de la documentation et l'appliquer dans le code.

###### - Comme aide pour trouver certains bugs coriaces de performance ou d’hydratation.

###### - Aider à mettre en place correctement le nom de domaine le DNS et la config de hébergeur (jamais expérimenté auparavant).

###### - Générer le CODE du SVG de l’icône qui sert d'emblème au site, sachant qu'il a été sensiblement modifié pour s'adapter à mes envies.

###### - Assurer un role de tuteur : poser des questions pour comprendre un concept inconnu afin de rapidement comprendre comme l'exploiter.



