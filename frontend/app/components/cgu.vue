<template>
    <p>Les CGU pourraient évoluer, veuillez les lire attentivement.(Dernière maj : 24 sept 2026)</p>
    <div class="text-muted">

        <p class="text-lg">1/ Objectif de Kaki Cube VS</p>

        <p class="text-xs">
            Kaki Cube VS permet de créer ou de rejoindre des salles où des joueurs s'affrontent à une ou
            plusieurs épreuves WCA, sans compte.
        </p>
        <br />
        <p class="text-lg">2/ Transmission de données</p>
        <p class="text-md">2.1/ Données dans les salles de jeux</p>
        <p class="text-xs">
            Voici les données que votre navigateur transmettera aux autres (et inversement) et sur le serveur lorsque
            vous serez dans une salle :
        </p>
        <br />
        <ul class="text-xs">
            <li>- pseudo</li>
            <li>- état de jeu (en inspection, en résolution...) </li>
            <li>- temps réalisés</li>
            <li>- moyenne (mean, ao5,ao12)</li>
            <li>- messages que vous écrivez dans le channel de la salle. (aucune persistance des messages sur le
                serveur)</li>
        </ul>
        <br />
        <p class="text-sm">2.1.1/Channel de salle</p>
        <p class="text-xs">
            Un channel est proposé dans chaque salle créée. Cela vous permet d'échanger entre joueurs pendant le temps
            où vous êtes dans la salle.
            Veuillez bien lire les conditions affichées dans le channel avant d'envoyer un message.
        </p>
        <p class="text-xs">VOUS ETES LE SEUL ET UNIQUE RESPONSABLE DE CE QUE VOUS ENVOYEZ.</p>
        <br />
        <p class="text-md">2.2/Persistance de session </p>
        <p class="text-xs">
            Depuis la version 1.1 de Kaki Cube, une persistance de session est mise en place afin de retrouver votre
            salle et vos scores dans les cas suivants :
        </p>

        <ul class="text-xs">
            <li>- Fermeture de l'onglet actif.</li>
            <li>- Fermeture du navigateur.</li>
            <li>- Rechargement de la page.</li>
            <li>- Déconnexions non voulues.</li>
        </ul>
        <br />
        <p class="text-xs">
            La persistance de session est stocké dans une variable dans votre navigateur.
            Si vous partez, votre session devient expirable au bout de 30 minutes, à moins que vous reveniez avant.
            Au maximum, votre session peut durer 40 minutes car le serveur vérifie toutes les 10 minutes s'il faut
            purger certaines salles.
            <br />
            <br />
            Il n'est pas possible d'ouvrir plusieurs onglets pour avoir plusieurs parties en cours. Pour contourner,
            vous pouvez :
        </p>
        <ul class="text-xs">
            <li>- Lancer une autre page de votre navigateur en navigation privée.</li>
            <li>- Lancer une autre page sur un navigateur différent.</li>
        </ul>
        <br />
        <p class="text-md">2.3/Persistance de paramétrage </p>
        <p class="text-xs">
            Depuis la version 1.1.3 de Kaki Cube, une nouvelle variable de stockage local est apparue : 'options'.
            Elle a pour but de sauvegarder vos options préférées (Son pour l'inspection, mode de saisie...).
        </p>

        <br />
        <p class="text-md">Pour plus d'informations concernant le stockage local et savoir comment le supprimer,
            veuillez consultez la section 2.2/ de la politique de confidentialité.</p>
        <br />
        <p class="text-lg">3/ Donations via Buy me a Coffee ©</p>
        <p class="text-md">3.1/ Affirmations à respecter avant de donner.</p>
        <p class="text-xs">
            Vous avez la possibilité de réaliser un don pour soutenir le projet.
            Merci de bien vouloir être d'accord avec TOUTES les phrases suivantes avant d'en réaliser un :
        </p>
        <br />
        <ul class="text-xs">
            <li>- J'ai envie de soutenir le projet. </li>
            <li>- J'ai les moyens de vouloir faire un don de X euro(s). </li>
            <li>- Je fais la distinction entre le projet et la personne qui s'en occupe derrière. </li>
            <li>- Faire ce don ne changera rien à mes habitudes financières.</li>
            <li>- Je n'attends aucun contrepartie lorsque je réalise le don, quelque soit le montant du don.</li>
        </ul>
        <br />
        <p class="text-md">3.2/ Utilisation des dons</p>
        <p class="text-sm">
            Louis Presti s'engage à utiliser les dons reçus dans l'ordre de décroissant des priorités qui suit :
        </p>
        <ul class="text-xs">

            <li>- Hébergement : 5$ / 20$ par mois (selon l'abonnement). L'abonnement à 20$ n'arrivera pas avant une
                popularité non négligeable de
                Kaki Cube.</li>
            <li>- Nom de domaine : 10 à 15 € par an </li>
            <li>- Email de contact : ~1.50 € par mois</li>
            <li>- Utilisation personnelle (loyer, nourriture, loisirs, etc)</li>
            <li>- Matériel pour pérenniser ce site web et potentiellement d'autres (Raspberry pi, NAS, SSD,
                ondulateur...).</li>
        </ul>
        <br />


        <p class="text-lg">4/ Formulaire de retour</p>
        <p class="text-xs">
            Vous avez la possibilité de faire un retour via le formulaire "Faire un retour" présent en haut de l'écran.
            Pour plus d'informations sur le cheminement des données transmisses, veuillez consulter la section 3 de la
            politique de confidentialité ainsi que
            la section 1.3/ des mentions légales.
        </p>
        <br />
        <p class="text-lg">5/ Droits applicables et litiges</p>
        <p class="text-xs">
            Les présentes CGU sont soumises au droit français. En cas de litige relatif à l'utilisation de kakicube.com,
            et à défaut de résolution amiable,
            les tribunaux français seront les seuls compétents, dans les conditions de droit commun.
        </p>
        <br />
        <p class="text-lg">6/ Licence et propriété du code</p>
        <p class="text-xs">
            Le code source de Kaki Cube VS est disponible publiquement sur <u><a
                    href="https://github.com/Slyberr/kaki-cube-battle">Github©</a></u>.
            Ce projet est sous licence <i>GNU AFFERO GENERAL PUBLIC LICENSE (AGPL)</i>.
            <br />
            Cette licence vous autorise à consulter, utiliser, modifier et redistribuer le code, à condition que tout
            projet dérivé soit également publié sous license AGPL ou d'autres licences compatibles. Le code source devra
            être rendu accessible.
            Le texte complet de la licence est disponible dans le fichier LICENSE du dépôt.

        </p>
    </div>


</template>
