let url = "https://api.open-meteo.com/v1/forecast?latitude=45.4339&longitude=4.39&daily=weather_code,temperature_2m_min,temperature_2m_max&hourly=temperature_2m,precipitation&current=temperature_2m,is_day,weather_code,wind_speed_10m,wind_direction_10m&timezone=Europe%2FBerlin";

fetch(url)
    .then(response => response.json())
    .then(donnees => {
        console.log(donnees);

        // Récupérer les données horaire
        const weatherHour = donnees?.hourly || {};
        const temperature = weatherHour?.temperature_2m || [];
        const precipitations = weatherHour?.precipitation || [];
        const heures = weatherHour?.time || [];
        const slider = document.getElementById("slider");
        const totalCards = 24;

        // Créer les cartes horaires
        for (let i = 0; i < totalCards; i++) {
            let date = new Date(heures[i]);
            let timeFormat = formatTime(date);

            let cardHourly = document.createElement("div");
            cardHourly.classList.add("card","card-hourly");

            // Vérification pour afficher "0 mm" si les précipitations sont à 0
            let precip = precipitations[i] !== undefined ? precipitations[i] : 0;
            // Vérification pour afficher la température 0°C si c'est le cas
            let temp = temperature[i] !== undefined ? temperature[i] : '--';

            cardHourly.innerHTML = `
                <p><img src="assets/images/icons/thermometer.png" alt="Pictogramme thermomètre"> ${temp === '--' ? '--' : temp + '°C'}</p>
                <p><img src="assets/images/icons/umbrella.png" alt="Pictogramme précipitations"> ${precip === 0 ? '0 mm' : precip + ' mm'}</p>
                <p>${timeFormat}</p>
            `;

            slider.appendChild(cardHourly);
        }


        // ------------------------------ Date Time ---------------------------------//

        const weatherNow = donnees?.current || {};
        let date = new Date(weatherNow?.time || Date.now());
        let dateTime = document.getElementById("dateTime");

        let dateFormat = formatDate(date);
        let timeFormat = formatTime(date);

        let cardTime = document.createElement("div");
        cardTime.classList.add("card","card-time");
        cardTime.innerHTML = `
            <p>${dateFormat}</p>
            <p>${timeFormat}</p>
        `;
        dateTime.appendChild(cardTime);

        // ------------------------------ Is day ---------------------------------//

        let isDay = weatherNow?.is_day;
        let dayNight = document.getElementById("dayNight");

        let cardIsDay = document.createElement("div");
        cardIsDay.classList.add("card","card-day");
        cardIsDay.innerHTML = `
            <img src="assets/images/icons/${isDay === 1 ? "day" : "night"}.png" alt="Pictogramme jour/nuit">
        `;
        dayNight.appendChild(cardIsDay);

        // ------------------------------ Meteo Now ---------------------------------//

        let codeNow = weatherNow?.weather_code;
        let temperatureNow = weatherNow?.temperature_2m;
        let temperatureNowFormatted = temperatureNow !== undefined ? temperatureNow : '--';

        let { icon, keyword } = updateWeatherIcon(codeNow);

        let curentWeather = document.getElementById("curentWeather");
        let weatherCard = document.createElement("div");

        weatherCard.classList.add("card","card-now");
        weatherCard.innerHTML = `
            <p>${keyword}</p>
            <img src="assets/images/picto-meteo/${icon}.png" alt="Icône météo">
            <p>${temperatureNowFormatted === '--' ? '--' : temperatureNowFormatted + '°C'}</p>
        `;

        curentWeather.appendChild(weatherCard);

        let main = document.getElementById("main");
        main.style.backgroundImage = `url("assets/images/background/${icon}.jpg")`;

        // ------------------------------ Meteo Daily ---------------------------------//
        const weatherDaily = donnees?.daily || {};
        let dateDaily = weatherDaily?.time || [];
        let codeDaily = weatherDaily?.weather_code || [];
        let temperatureDailyMax = weatherDaily?.temperature_2m_max || [];
        let temperatureDailyMin = weatherDaily?.temperature_2m_min || [];

        const days = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

        for (let i = 0; i < 7; i++) {
            let date = new Date(dateDaily[i]);
            let dateFormat = formatDate(date);

            let maxTemp = temperatureDailyMax[i] !== undefined ? temperatureDailyMax[i] : '--';
            let minTemp = temperatureDailyMin[i] !== undefined ? temperatureDailyMin[i] : '--';
            let { icon, keyword } = updateWeatherIcon(codeDaily[i]);

            let dailyWeather = document.getElementById(days[i]);
            let dailyCard = document.createElement("div");

            dailyCard.classList.add("card","card-daily");
            dailyCard.innerHTML = `
                <p>${dateFormat}</p>
                <img src="assets/images/picto-meteo/${icon}.png" alt="Icône météo">
                <p>${maxTemp === '--' ? '--' : maxTemp + '°C'}</p>
                <p>${minTemp === '--' ? '--' : minTemp + '°C'}</p>
            `;

            dailyWeather.appendChild(dailyCard);
        }

        // ------------------------------ Compass ---------------------------------//

        let windDir = weatherNow?.wind_direction_10m;
        let windSpeed = weatherNow?.wind_speed_10m;
        let windDirFormatted = windDir !== undefined ? windDir : '--';
        let windSpeedFormatted = windSpeed !== undefined ? windSpeed : '--';

        // Calcul de la rotation (en degrés) en fonction de la direction du vent
        let rotation = windDirFormatted !== '--' ? `${windDirFormatted}deg` : '0deg';

        // Récupération de l'élément de la boussole
        let compass = document.getElementById("compass");

        // Création de la carte de la boussole
        let compassCard = document.createElement("div");
        compassCard.classList.add("card", "card-compass");

        // Ajout du contenu HTML pour la boussole
        compassCard.innerHTML = `
            <div class="compass-container">
                <img src="assets/images/icons/compass.png" alt="Icône compass" class="compass">
                <img src="assets/images/icons/compass-arrow.png" alt="Icône compass arrow" class="compass-arrow">
            </div>
            <p>${windSpeedFormatted === '--' ? '--' : windSpeedFormatted + ' km/h'}</p>
        `;

        // Ajouter la carte de la boussole au DOM
        compass.appendChild(compassCard);

        // Sélection de l'élément de la flèche de la boussole
        let compassArrow = compassCard.querySelector(".compass-arrow");

        // Appliquer la rotation via une variable CSS
        compassArrow.style.setProperty('--rotation', rotation);

        // Ajouter la classe 'rotate' pour appliquer la transformation avec la transition fluide
        compassArrow.classList.add("rotate");        
        
    })
    .catch(erreur => {
        console.log(erreur);
        document.getElementById("today").innerText = "Erreur de chargement.";
    });


// ------------------------------ Helper Functions ------------------------------//

function formatTime(date) {
    return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
    }).replace(":", "h");
}

function formatDate(date) {
    return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

// ------------------------------ weather code ---------------------------------//

const weatherIcons = {
    sun: [0],
    suncloud: [1, 2, 3],
    cloud: [45, 48],
    rain: [51, 53, 55, 61, 63, 65, 66, 67, 80, 81, 82],
    snow: [71, 73, 75, 77, 85, 86],
    thunder: [95, 96, 99]
};

const weatherKeywords = {
    sun: "Ensoleillé",
    suncloud: "Partiellement nuageux",
    cloud: "Nuageux",
    rain: "Pluvieux",
    snow: "Neigeux",
    thunder: "Orageux"
};

// Fonction qui retourne l'icône et le mot-clé basé sur le code météo
function updateWeatherIcon(code) {
    let weather = 'cloud'; // Valeur par défaut
    let keyword = "Nuageux"; // Valeur par défaut

    // On parcourt les clés (noms d'images) et leurs codes associés
    for (let icon in weatherIcons) {
        if (weatherIcons[icon].includes(code)) {
            weather = icon;
            keyword = weatherKeywords[icon]; // Récupérer le mot-clé associé
            break;
        }
    }

    return { icon: weather, keyword: keyword };
}

// ------------------------------ Slider Interaction ------------------------------//

let slider = document.getElementById("slider");
let isDown = false;
let startX;
let translateX = 0;
let prevTranslate = 0;

slider.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.clientX;
    prevTranslate = translateX;
    slider.style.transition = "none"; // Supprime la transition pour un mouvement fluide
    document.body.style.userSelect = "none"; // Désactive la sélection du texte
});

slider.addEventListener("mouseleave", () => {
    isDown = false;
    document.body.style.userSelect = ""; // Réactive la sélection du texte
});

slider.addEventListener("mouseup", () => {
    isDown = false;
    document.body.style.userSelect = ""; // Réactive la sélection du texte
    snapToCard();
});

slider.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    let deltaX = e.clientX - startX;
    translateX = prevTranslate + deltaX;

    // Limite la position de translateX pour ne pas dépasser la dernière carte
    if (translateX < -23 * (slider.firstElementChild.offsetWidth + 10)) {
        translateX = -23 * (slider.firstElementChild.offsetWidth + 10);  // Limite la position à la 24ème carte
    }
    slider.style.transform = `translateX(${translateX}px)`;
});

function snapToCard() {
    let cardWidth = slider.firstElementChild.offsetWidth + 10; // 10px de marge
    let maxTranslateX = -23 * cardWidth; // Limite à la 24ème carte (index 23)

    let index = Math.round(-translateX / cardWidth);

    // Limite l'index pour ne pas dépasser la carte 24 (index 23)
    index = Math.max(0, Math.min(index, 16)); // L'index max doit être 23, pas slider.childElementCount - 1

    translateX = -index * cardWidth;

    // Applique une limite de mouvement pour éviter que translateX dépasse la 24ème carte
    if (translateX < maxTranslateX) {
        translateX = maxTranslateX;  // Empêche de dépasser la 24ème carte
    }

    // Applique la transition pour un effet de glissement fluide
    slider.style.transition = "transform 0.5s ease-in-out";
    slider.style.transform = `translateX(${translateX}px)`;
}
