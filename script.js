// ---------------------------------------------------------
// Fonction d'initialisation lors du chargement de la page
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", async function () {
    const defaultWeatherURL = "https://api.open-meteo.com/v1/forecast?latitude=45.4401467&longitude=4.3873058&daily=weather_code,temperature_2m_min,temperature_2m_max&hourly=temperature_2m,precipitation&current=temperature_2m,is_day,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto";

    try {
        // Récupération des données météo par défaut
        const response = await fetch(defaultWeatherURL);
        const donnees = await response.json();
        console.log("Données météo par défaut :", donnees);
        afficherMeteo(donnees);  // Appel de la fonction pour afficher les données
    } catch (error) {
        // Gestion des erreurs de récupération des données météo
        console.error("Erreur lors du chargement des données météo par défaut :", error);
    }
});


// ---------------------------------------------------------
// Gestion du formulaire de recherche de ville
// ---------------------------------------------------------
document.getElementById("weatherForm").addEventListener("submit", async function(event) {
    event.preventDefault();  // Empêche la soumission du formulaire par défaut

    const cityInput = document.getElementById("city");
    const city = cityInput.value.trim();  // Récupère la ville entrée par l'utilisateur

    if (!city) return;  // Si aucune ville n'est saisie, on arrête la fonction

    try {
        // Recherche de la ville via l'API Nominatim pour obtenir ses coordonnées géographiques
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`);
        const geoData = await geoRes.json();

        if (geoData.length === 0) {
            alert("Ville introuvable !");
            return;  // Si la ville n'est pas trouvée, on arrête la fonction
        }

        const lat = geoData[0].lat;  // Latitude de la ville
        const lon = geoData[0].lon;  // Longitude de la ville

        // Mise à jour du titre avec le nom de la ville
        document.querySelector("h1").innerHTML = city;

        // ---------------------------------------------------------
        // Construction de l'URL pour récupérer les données météo
        // ---------------------------------------------------------
        const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_min,temperature_2m_max&hourly=temperature_2m,precipitation&current=temperature_2m,is_day,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`;

        console.log(weatherURL);  // Affiche l'URL générée pour débogage
        document.getElementById("city").value = "";  // Efface le champ de la ville
        cityInput.placeholder = "Entrez une ville";  // Restaure le texte du placeholder

        // ---------------------------------------------------------
        // Vider les anciennes données affichées avant d'afficher les nouvelles
        // ---------------------------------------------------------
        document.getElementById("slider").innerHTML = "";
        document.getElementById("dateTime").innerHTML = "";
        document.getElementById("dayNight").innerHTML = "";
        document.getElementById("curentWeather").innerHTML = "";
        document.getElementById("compass").innerHTML = "";

        // Effacement des données des jours de la semaine
        const jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
        jours.forEach(jour => {
            document.getElementById(jour).innerHTML = "";
        });

        // ---------------------------------------------------------
        // Récupérer les nouvelles données météo et les afficher
        // ---------------------------------------------------------
        fetch(weatherURL)
            .then(response => response.json())
            .then(donnees => {
                console.log("Nouvelles données météo :", donnees);
                afficherMeteo(donnees);  // Appel de la fonction pour afficher les nouvelles données météo
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des données météo :", error);
            });

    } catch (error) {
        // Gestion des erreurs pendant la récupération des données de la ville
        console.error("Erreur lors de la récupération des données :", error);
    }
});

// ---------------------------------------------------------
// Fonction d'Affichage
// ---------------------------------------------------------

function afficherMeteo(donnees){

    // ---------------------------------------------------------
    // Date et heure actuelle
    // ---------------------------------------------------------
    const weatherNow = donnees?.current || {};  // Récupère les données actuelles météo
    let date = new Date(weatherNow?.time || "--");  // Crée un objet Date avec l'heure actuelle
    let dateTime = document.getElementById("dateTime");  // Récupère l'élément DOM pour afficher la date/heure

    let dateFormat = formatDate(date);  // Formate la date
    let timeFormat = formatTime(date);  // Formate l'heure
    console.log(timeFormat);  // Affiche l'heure dans la console pour le débogage

    // Crée et affiche une carte avec la date et l'heure
    let cardTime = document.createElement("div");
    cardTime.classList.add("card", "card-time");
    cardTime.innerHTML = `
        <p>${dateFormat}</p>
        <p>${timeFormat}</p>
    `;
    dateTime.appendChild(cardTime);

    // ---------------------------------------------------------
    // Prévisions horaires pour les 24 prochaines heures
    // ---------------------------------------------------------
    const weatherHour = donnees?.hourly || {};  // Récupère les prévisions horaires
    const temperature = weatherHour?.temperature_2m || [];  // Température à chaque heure
    const precipitations = weatherHour?.precipitation || [];  // Précipitations à chaque heure
    const heures = weatherHour?.time || [];  // Heures des prévisions
    const slider = document.getElementById("slider");  // Récupère l'élément DOM pour afficher les cartes horaires
    const totalCards = 24;  // Nombre total de cartes à afficher (pour 24 heures)

    // Trouve l'index de l'heure actuelle dans le tableau des heures
    const currentHour = new Date(weatherNow?.time || "--").getHours();
    const currentIndex = heures.findIndex(hour => {
        const hourDate = new Date(hour);
        return hourDate.getHours() === currentHour;
    });

    // Crée des cartes pour chaque heure de la journée
    for (let i = 0; i < totalCards; i++) {
        let index = currentIndex + i;
        if (index >= heures.length) {
            break; // Arrête si l'index dépasse le nombre d'heures disponibles
        }

        let date = new Date(heures[index]);
        let timeFormat = formatTime(date);  // Formate l'heure pour chaque carte

        let cardHourly = document.createElement("div");
        cardHourly.classList.add("card", "card-hourly");

        // Si les précipitations ou la température sont manquantes, on les remplace par une valeur par défaut
        let precip = precipitations[index] !== undefined ? precipitations[index] : 0;
        let temp = temperature[index] !== undefined ? temperature[index] : '--';

        cardHourly.innerHTML = `
            <p><img src="assets/images/icons/thermometer.png" alt="Pictogramme thermomètre"> ${temp === '--' ? '--' : temp + '°C'}</p>
            <p><img src="assets/images/icons/umbrella.png" alt="Pictogramme précipitations"> ${precip === 0 ? '0 mm' : precip + ' mm'}</p>
            <p>${timeFormat}</p>
        `;
        slider.appendChild(cardHourly);  // Ajoute la carte au slider
    }

    // ---------------------------------------------------------
    // Vérification jour ou nuit
    // ---------------------------------------------------------
    let isDay = weatherNow?.is_day;  // Vérifie si c'est le jour ou la nuit
    let dayNight = document.getElementById("dayNight");  // Récupère l'élément DOM pour afficher l'icône jour/nuit

    // Crée et affiche l'icône correspondant à jour ou nuit
    let cardIsDay = document.createElement("div");
    cardIsDay.classList.add("card", "card-day");
    cardIsDay.innerHTML = `
        <img src="assets/images/icons/${isDay === 1 ? "day" : "night"}.png" alt="Pictogramme jour/nuit">
    `;
    dayNight.appendChild(cardIsDay);

    // ---------------------------------------------------------
    // Météo actuelle (température, icône, description)
    // ---------------------------------------------------------
    let codeNow = weatherNow?.weather_code;  // Récupère le code météo actuel
    let temperatureNow = weatherNow?.temperature_2m;  // Récupère la température actuelle
    let temperatureNowFormatted = temperatureNow !== undefined ? temperatureNow : '--';  // Formate la température si disponible

    let { icon, keyword } = updateWeatherIcon(codeNow);  // Met à jour l'icône et la description de la météo

    let curentWeather = document.getElementById("curentWeather");  // Récupère l'élément DOM pour la météo actuelle
    let weatherCard = document.createElement("div");

    weatherCard.classList.add("card", "card-now");
    weatherCard.innerHTML = `
        <p>${keyword}</p>
        <img src="assets/images/picto-meteo/${icon}.png" alt="Icône météo">
        <p>${temperatureNowFormatted === '--' ? '--' : temperatureNowFormatted + '°C'}</p>
    `;
    curentWeather.appendChild(weatherCard);  // Ajoute la carte de la météo actuelle

    // ---------------------------------------------------------
    // Image de fond en fonction du jour ou de la nuit
    // ---------------------------------------------------------
    let main = document.getElementById("main");  // Récupère l'élément DOM pour afficher l'image de fond
    let background = document.createElement("div");
    background.classList.add("background");
    background.innerHTML = `
        <img src="assets/images/background/${isDay === 1 ? icon + '.jpg' : 'night.jpg'}" alt="Icône météo">
    `;
    main.appendChild(background);  // Ajoute l'image de fond correspondant à la météo actuelle

    // ---------------------------------------------------------
    // Prévisions météo pour les 7 prochains jours
    // ---------------------------------------------------------
    const weatherDaily = donnees?.daily || {};  // Récupère les prévisions quotidiennes
    let dateDaily = weatherDaily?.time || [];
    let codeDaily = weatherDaily?.weather_code || [];
    let temperatureDailyMax = weatherDaily?.temperature_2m_max || [];
    let temperatureDailyMin = weatherDaily?.temperature_2m_min || [];

    const days = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

    // Crée une carte pour chaque jour de la semaine
    for (let i = 0; i < 7; i++) {
        let date = new Date(dateDaily[i]);
        let dateFormat = formatDate(date);  // Formate la date du jour

        let maxTemp = temperatureDailyMax[i] !== undefined ? temperatureDailyMax[i] : '--';
        let minTemp = temperatureDailyMin[i] !== undefined ? temperatureDailyMin[i] : '--';
        let { icon, keyword } = updateWeatherIcon(codeDaily[i]);  // Met à jour l'icône et la description pour chaque jour

        let dailyWeather = document.getElementById(days[i]);  // Récupère l'élément DOM pour chaque jour
        let dailyCard = document.createElement("div");

        dailyCard.classList.add("card", "card-daily");
        dailyCard.innerHTML = `
            <p>${dateFormat}</p>
            <img src="assets/images/picto-meteo/${icon}.png" alt="Icône météo">
            <p>${maxTemp === '--' ? '--' : maxTemp + '°C'}</p>
            <p>${minTemp === '--' ? '--' : minTemp + '°C'}</p>
        `;
        dailyWeather.appendChild(dailyCard);  // Ajoute la carte de chaque jour
    }

    // ---------------------------------------------------------
    // Direction et vitesse du vent
    // ---------------------------------------------------------
    let windDir = weatherNow?.wind_direction_10m;  // Récupère la direction du vent
    let windSpeed = weatherNow?.wind_speed_10m;  // Récupère la vitesse du vent
    let windDirFormatted = windDir !== undefined ? windDir : '--';  // Formate la direction du vent
    let windSpeedFormatted = windSpeed !== undefined ? windSpeed : '--';  // Formate la vitesse du vent

    let rotation = windDirFormatted !== '--' ? `${windDirFormatted}deg` : '0deg';  // Détermine la rotation de l'icône de la boussole

    let compass = document.getElementById("compass");  // Récupère l'élément DOM pour afficher la boussole
    let compassCard = document.createElement("div");
    compassCard.classList.add("card", "card-compass");

    compassCard.innerHTML = `
        <div class="compass-container">
            <img src="assets/images/icons/compass.png" alt="Icône compass" class="compass">
            <img src="assets/images/icons/compass-arrow.png" alt="Icône compass arrow" class="compass-arrow">
        </div>
        <p>${windSpeedFormatted === '--' ? '--' : windSpeedFormatted + ' km/h'}</p>
    `;
    compass.appendChild(compassCard);  // Ajoute la carte de la boussole

    // Ajoute la rotation à l'icône de la flèche de la boussole
    let compassArrow = compassCard.querySelector(".compass-arrow");
    compassArrow.style.setProperty('--rotation', rotation);
    compassArrow.classList.add("rotate");
}

// ---------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------

/**
 * Formate une date en heure locale avec le format "hh:mm".
 * Exemple : "14h30".
 * @param {Date} date - L'objet Date à formater.
 * @returns {string} L'heure formatée sous forme de chaîne de caractères.
 */
function formatTime(date) {
    // Utilise la méthode toLocaleTimeString pour obtenir l'heure avec un format spécifique
    return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",    // Affiche l'heure sur deux chiffres
        minute: "2-digit"   // Affiche les minutes sur deux chiffres
    }).replace(":", "h");  // Remplace le ":" par "h" pour respecter le format français
}

/**
 * Formate une date en format "jj/mm/aaaa".
 * Exemple : "26/03/2025".
 * @param {Date} date - L'objet Date à formater.
 * @returns {string} La date formatée sous forme de chaîne de caractères.
 */
function formatDate(date) {
    // Utilise la méthode toLocaleDateString pour obtenir la date avec un format spécifique
    return date.toLocaleDateString("fr-FR", {
        day: "2-digit",   // Affiche le jour sur deux chiffres
        month: "2-digit", // Affiche le mois sur deux chiffres
        year: "numeric"   // Affiche l'année sur quatre chiffres
    });
}


// ---------------------------------------------------------
//  Weather Code
// ---------------------------------------------------------

// Dictionnaire pour associer les codes météo aux types d'icônes.
const weatherIcons = {
    sun: [0],                  // Code météo pour le soleil
    suncloud: [1, 2, 3],       // Codes météo pour soleil partiellement nuageux
    cloud: [45, 48],           // Codes météo pour nuageux
    rain: [51, 53, 55, 61, 63, 65, 66, 67, 80, 81, 82], // Codes météo pour pluvieux
    snow: [71, 73, 75, 77, 85, 86], // Codes météo pour neigeux
    thunder: [95, 96, 99]      // Codes météo pour orageux
};

// Dictionnaire pour associer les types d'icônes à une description textuelle en français.
const weatherKeywords = {
    sun: "Dégagé",            // Description pour le soleil
    suncloud: "Partiellement nuageux",  // Description pour soleil partiellement nuageux
    cloud: "Nuageux",          // Description pour nuageux
    rain: "Pluvieux",          // Description pour pluvieux
    snow: "Neigeux",           // Description pour neigeux
    thunder: "Orageux"         // Description pour orageux
};

/**
 * Met à jour l'icône météo et la description en fonction du code météo.
 * @param {number} code - Le code météo reçu.
 * @returns {Object} Un objet contenant l'icône et la description associée au code météo.
 */
function updateWeatherIcon(code) {
    let weather = 'cloud';  // Valeur par défaut : nuageux
    let keyword = "Nuageux"; // Valeur par défaut : description de nuageux

    // Parcours le dictionnaire weatherIcons pour trouver l'icône correspondant au code météo
    for (let icon in weatherIcons) {
        // Si le code météo est trouvé dans les codes de l'icône
        if (weatherIcons[icon].includes(code)) {
            weather = icon;        // Mise à jour de l'icône
            keyword = weatherKeywords[icon]; // Mise à jour de la description
            break;  // Sort de la boucle dès que l'icône correspondante est trouvée
        }
    }

    // Retourne un objet contenant l'icône et la description
    return { icon: weather, keyword: keyword };
}

// ---------------------------------------------------------
// Gestion du défilement horizontal des sliders
// ---------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    // Sélection des éléments de type slider (température et semaine)
    const sliders = document.querySelectorAll(".temperature, .week");
    
    // Variables de contrôle pour gérer le déplacement du slider
    let isDown = false;  // Indicateur pour savoir si la souris est enfoncée
    let startX;  // Position initiale de la souris (sur l'axe X)
    let scrollLeft;  // Position initiale du scroll horizontal du slider

    // Parcours des sliders pour ajouter les événements nécessaires
    sliders.forEach(slider => {
        // ---------------------------------------------------------
        // Gestion du clic (début du déplacement du slider)
        // ---------------------------------------------------------
        slider.addEventListener("mousedown", (e) => {
            isDown = true;  // Indique que la souris est enfoncée
            slider.classList.add("active");  // Ajoute une classe pour changer l'apparence du slider
            startX = e.pageX - slider.offsetLeft;  // Calcul de la position initiale de la souris
            scrollLeft = slider.scrollLeft;  // Récupère la position initiale du scroll horizontal
            document.body.style.userSelect = "none";  // Désactive la sélection de texte pendant le défilement
        });

        // ---------------------------------------------------------
        // Gestion de la sortie de la souris (arrêt du déplacement)
        // ---------------------------------------------------------
        slider.addEventListener("mouseleave", () => {
            isDown = false;  // Désactive le déplacement
            slider.classList.remove("active");  // Enlève la classe d'activation
            document.body.style.userSelect = "";  // Réactive la sélection de texte
        });

        // ---------------------------------------------------------
        // Gestion du relâchement du bouton de la souris (fin du déplacement)
        // ---------------------------------------------------------
        slider.addEventListener("mouseup", () => {
            isDown = false;  // Désactive le déplacement
            slider.classList.remove("active");  // Enlève la classe d'activation
            document.body.style.userSelect = "";  // Réactive la sélection de texte
        });

        // ---------------------------------------------------------
        // Gestion du mouvement de la souris (déplacement du slider)
        // ---------------------------------------------------------
        slider.addEventListener("mousemove", (e) => {
            if (!isDown) return;  // Si la souris n'est pas enfoncée, rien ne se passe
            e.preventDefault();  // Empêche le comportement par défaut du navigateur (sélection de texte, etc.)
            const x = e.pageX - slider.offsetLeft;  // Nouvelle position de la souris sur l'axe X
            const walk = (x - startX) * 2;  // Calcule la distance parcourue et ajuste la vitesse du défilement
            slider.scrollLeft = scrollLeft - walk;  // Déplace le slider en fonction de la distance parcourue
        });
    });
});

