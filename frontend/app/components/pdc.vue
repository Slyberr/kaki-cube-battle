<template>
    <p class="">La politique de confidentialité pourrait évoluer, veuillez la lire attentivement (Dernière maj : 12 sept
        2026).</p>
    <div class="text-muted">
        <div class="text-lg">1/ Motivation sur la vie privée et les données </div>
        <p class="text-xs">
            Le but premier en créant le site Kaki cube était de pouvoir trouver une solution aux grandes alternatives
            existantes qui propose le même service.
            Le point commun entre tous c'est qu'il faut impérativement créer un compte pour profiter du service.
            <br />
            Précision pour Cstimer qui propose ce service sans compte mais de façon plus restreinte (uniquement le 3x3,
            que le dernier temps montré, etc).
            <br />
            <br />
            Proposer ce service sans compte allège grandement les soucis quant à la fuite des données sensibles et la
            vie privée.
            <br />
            Ce site fonctionne sans base de données, c'est aussi pourquoi les données nécessaires au fonctionnement de
            la salle sont supprimées dès que possible pour des raisons de performance.
            <br />
            Aucun cookie, même techniques n'est utilisé. 
            <br />
        </p>
        <div class="text-md">1.1/ Responsable du traitement</div>
        <p class="text-xs">
            Le responsable du traitement des données mentionnées dans ce document est Louis Presti, exploitant le site kakicube.com à titre personnel.
            Pour toute question relative à vos données ou pour exercer vos droits (accès, rectification, suppression), vous pouvez utiliser l'adresse contact@kakicube.com.
            <br/>
            Les demandes concernant les données présentes dans les log (voir section 6) doivent également être relayées à cette adresse. Louis Presti se chargera, si nécessaire, de relayer
            la demande auprès de Railway © en tant que sous-traitant technique.
        </p>
        <br />
        <div class="text-lg">2/ Cycle de vie d'une salle de jeu</div>
        <p class="text-xs">
            Lorsqu'un joueur décide de créer une salle, il est automatiquement affecté comme modérateur et est le seul à
            pouvoir réaliser des opérations impactant
            les autres joueurs de la salle (nettoyer une session, changer d'épreuve ou exclure quelqu'un).
            S'il décide de partir, un autre modérateur se voit prendre sa place, arbitrairement.
            <br />
            Les salles sont toutes stockées dans une variable globale sur le serveur qui contient toutes les
            informations nécessaires pour toutes les salles actives.
            Cette variable suit le cycle de vie du serveur. Si le serveur est arrêté, toutes les données sont
            définitivement supprimées du serveur.
            <br />
            S'il ne reste plus personne dans la salle de jeu, la salle est automatiquement supprimée.
            <br />
            Si vous décidez de partir d'une salle, vos temps seront instanément supprimées de la salle.
        </p>
        <br />
        <div class="text-md">2.1/ Channel de discussion</div>
        <p class="text-xs">
            Chaque salle privée ou publique possède un channel de discussion afin d'échanger entres les joueurs présent
            dans la salle.
            <br />
            <u>Aucun message n'est stocké sur le serveur,</u> le message passe par l'étape serveur uniquement pour
            atteindre les autres joueurs.
            <br />
            Vous êtes le seul responsable des messages que vous envoyez. Pour plus d'informations veuillez bien
            consultez les CGU ainsi que le message de prévention
            quand vous arrivez sur une salle de jeu.
            <br />
            Les joueurs venant d'arriver dans la salle ne peuvent pas savoir ce que vous avez écris, puisque le second
            point l'en empêche.
        </p>
        <br />

        <div class="text-md">2.2/ Précision sur la durée de vie de la session d'un joueur</div>
        <p class="text-xs">
            Lorsque vous fermez l'onglet,que vous rechargez la plage où même que vous ne laissez plus l'onglet au
            premier plan sur un téléphone ou une tablette,
            votre session est expirée, c'est à dire que l'ancien identifiant que vous étiez n'existe plus sur le
            serveur. Vous perdez alors la salle où vous étiez, vos scores ainsi que votre pseudo.
        </p>
        <br />
        <div class="text-lg">3/ Le formulaire de retour</div>
        <p class="text-xs">
            Pendant votre session de jeu ou directement à l'accueil, vous pouvez décider de faire un retour afin de
            m'aider à inclure de nouvelles idées ou simplement me notifier un bug.
            <br />
            Il vous est proposé de renseigner votre mail afin de, si besoin, vous fournir une réponse (quand vous faites
            un retour à l'adresse mail contact@kakicube.com, c'est cette adresse qui s'envoit elle-même un mail avec ce
            que vous avez renseigné).

            Votre mail ne sortira jamais de la boite mail contact@kakicube.com et ne sera utilisé que pour vous
            répondre.
            A rappeler que l'adresse mail contact@kakicube.com est deservie par IONOS © avec une configuration DNS
            assuré par Cloudfare ©.

            <br />
            La boite mail sera purgée manuellement mais régulièrement. L'information de votre mail sera supprimé de la
            boite quand :

        </p>
        <br />
        <ul class="text-xs">
            <li>- Vous le désirez, cela sera fait immédiatemment mais tous les échanges seront supprimées.</li>
            <li>- La proposition de la nouvelle fonctionnalité est réfusée ou validée, vous en serez informé.</li>
            <li>- Si c'est un bug, lors de sa résolution, vous en serez informé.</li>
            <li>- Si je n'ai plus de nouvelles depuis un moment considérable lors d'une relance pour avoir des
                précisions par exemple.</li>
        </ul>
        <br />
        <div class="text-lg">4/ Donation</div>
        <p class="text-xs">
           kakicube.com propose une direction vers le compte <u><a href="https://buymeacoffee.com/">Buy me a Coffee ©</a></u> de Louis Presti.
           Tous ce qui concerne les CGU, les mentions légales ou la politique de confidentialité à savoir lorsque qu'on réalise une donation sont 
           présente sur ce site.
        </p>
        <br />
        <div class="text-lg">5/ Socket.io</div>
        <p class="text-xs">
            A l'instar des requêtes HTTP, les webs sockets permettent de trasmettre des données client à serveur et
            serveur à client, à l'exception que les webs sockets permettent une écoute constante.
            Socket.io peut contenir quelques informations sensibles comme la configuration de votre navigateur (empreinte
            numérique) et possiblement votre adresse IP publique (à vérifier).
            <br />
            Votre IP publiques est visible via les logs serveurs, voir la section 6 juste en dessous.
        </p>
        <br />
        <div class="text-lg">6/ Logs serveur</div>
        <p class="text-xs">
            Pour avoir une trace des évenements qui se déroulent sur le site, le serveur renvoies des logs qui sont
            accessible sur le compte Railway © associée à Louis Presti.
            Tous ces logs sont exploités uniquement pour le site web et 
            ne sont jamais visualisées ou retransmisses à d'autres tiers sauf pour Railway ©, hébergeur et sous-traitant indirect du site web kakicube.com 
            pour des obligations légales.

            Les logs sont conservés pendant 7 jours uniquement, conformément à l'abonnement actuel qu'utilise kakicube.com (Hobby).
            Pour toute demande de suppression d'informations vous conernant directement ou non, veuillez vous référez à la section 1.1/.
            
            Les logs contiennent :

        </p>
        <br />
        <ul class="text-xs">
            <li>- L'ID qui vous est assigné lors que vous arrivez et partez</li>
            <li>- A savoir, votre ID socket.io est associé à votre pseudo afin de permettre une association entre
                votre pseudo et votre session navigateur afin que la salle de jeu fonctionne correctement.</li>
            <li>- L'information des arrivées et des départs de salles (pseudo)</li>
            <li>- Créer une salle + pseudo, rejoindre une salle + pseudo, salle supprimée.</li>
            <li>- toutes les requêtes réseaux avec donc votre ip publique (v4/v6) en clair</li>
            <li>- Toutes les requêtes HTTPS (récuperation des données du site, date et heure lorsque vous envoyez un retour)</li>
        </ul>
         <div class="text-lg">7/ Statistiques</div>
         <p class="text-xs">
            Railway © et Cloudfare © proposent chacun des statistiques générales sur les performances du site : 

         </p>
         <ul class="text-xs">
            <li>- Nombre de requêtes</li>
            <li>- Nombre de visiteurs avec un top de Pays/Régions. Les informations sont agrégées et non individualisées.</li>
            <li>- Usage CPU/Mémoire du site</li>
            <li>- Traffic réseau (complété par les logs réseaux)</li>

         </ul>
    </div>


</template>