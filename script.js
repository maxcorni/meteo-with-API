document.addEventListener("DOMContentLoaded", async function () {
    const defaultWeatherURL = "https://api.open-meteo.com/v1/forecast?latitude=45.4401467&longitude=4.3873058&daily=weather_code,temperature_2m_min,temperature_2m_max&hourly=temperature_2m,precipitation&current=temperature_2m,is_day,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto";

    try {
        const response = await fetch(defaultWeatherURL);
        const donnees = await response.json();
        console.log("Données météo par défaut :", donnees);
        afficherMeteo(donnees);
    } catch (error) {
        console.error("Erreur lors du chargement des données météo par défaut :", error);
    }
});


document.getElementById("weatherForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const cityInput = document.getElementById("city");
    const city = cityInput.value.trim();

    if (!city) return;

    try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`);
        const geoData = await geoRes.json();

        if (geoData.length === 0) {
            alert("Ville introuvable !");
            return;
        }

        const lat = geoData[0].lat;
        const lon = geoData[0].lon;

        document.querySelector("h1").innerHTML = city;

        // Construire la nouvelle URL Open-Meteo
        const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_min,temperature_2m_max&hourly=temperature_2m,precipitation&current=temperature_2m,is_day,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`;

        console.log(weatherURL);
        document.getElementById("city").value = "";  
        cityInput.placeholder = "Entrez une ville";  

        // 1. Vider les anciennes données affichées
        document.getElementById("slider").innerHTML = "";
        document.getElementById("dateTime").innerHTML = "";
        document.getElementById("dayNight").innerHTML = "";
        document.getElementById("curentWeather").innerHTML = "";
        document.getElementById("compass").innerHTML = "";

        const jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
        jours.forEach(jour => {
            document.getElementById(jour).innerHTML = "";
        });

        // 2. Récupérer les nouvelles données météo et les afficher
        fetch(weatherURL)
            .then(response => response.json())
            .then(donnees => {
                console.log("Nouvelles données météo :", donnees);
                afficherMeteo(donnees);
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des données météo :", error);
            });

    } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
    }
});


function afficherMeteo(donnees){

    // ------------------------------ Date Time ---------------------------------//

    const weatherNow = donnees?.current || {};
    let date = new Date(weatherNow?.time ||"--");
    let dateTime = document.getElementById("dateTime");

    let dateFormat = formatDate(date);
    let timeFormat = formatTime(date);
    console.log(timeFormat);


    let cardTime = document.createElement("div");
    cardTime.classList.add("card", "card-time");
    cardTime.innerHTML = `
        <p>${dateFormat}</p>
        <p>${timeFormat}</p>
    `;
    dateTime.appendChild(cardTime);

    // ------------------------------ Hourly ---------------------------------//

    // Récupérer les données horaire
    const weatherHour = donnees?.hourly || {};
    const temperature = weatherHour?.temperature_2m || [];
    const precipitations = weatherHour?.precipitation || [];
    const heures = weatherHour?.time || [];
    const slider = document.getElementById("slider");
    const totalCards = 24;

    // Trouver l'indice de l'heure actuelle dans le tableau des heures
    const currentHour = new Date(weatherNow?.time ||"--").getHours();
    const currentIndex = heures.findIndex(hour => {
        const hourDate = new Date(hour);
        return hourDate.getHours() === currentHour;
    });

    // Créer les cartes horaires à partir de l'heure actuelle et pour les 24 prochaines heures
    for (let i = 0; i < totalCards; i++) {
        let index = currentIndex + i;
        if (index >= heures.length) {
            break; // Si l'index dépasse la taille du tableau, on s'arrête
        }

        let date = new Date(heures[index]);
        let timeFormat = formatTime(date);

        let cardHourly = document.createElement("div");
        cardHourly.classList.add("card", "card-hourly");

        // Vérification pour afficher "0 mm" si les précipitations sont à 0
        let precip = precipitations[index] !== undefined ? precipitations[index] : 0;
        // Vérification pour afficher la température 0°C si c'est le cas
        let temp = temperature[index] !== undefined ? temperature[index] : '--';

        cardHourly.innerHTML = `
            <p><img src="assets/images/icons/thermometer.png" alt="Pictogramme thermomètre"> ${temp === '--' ? '--' : temp + '°C'}</p>
            <p><img src="assets/images/icons/umbrella.png" alt="Pictogramme précipitations"> ${precip === 0 ? '0 mm' : precip + ' mm'}</p>
            <p>${timeFormat}</p>
        `;

        slider.appendChild(cardHourly);
    }

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
        main.style.backgroundImage = `url("assets/images/background/${isDay === 1 ? icon + '.jpg' : 'night.jpg'}")`;

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

    let rotation = windDirFormatted !== '--' ? `${windDirFormatted}deg` : '0deg';

    let compass = document.getElementById("compass");
    let compassCard = document.createElement("div");
    compassCard.classList.add("card", "card-compass");

    compassCard.innerHTML = `
        <div class="compass-container">
            <img src="assets/images/icons/compass.png" alt="Icône compass" class="compass">
            <img src="assets/images/icons/compass-arrow.png" alt="Icône compass arrow" class="compass-arrow">
        </div>
        <p>${windSpeedFormatted === '--' ? '--' : windSpeedFormatted + ' km/h'}</p>
    `;

    compass.appendChild(compassCard);

    let compassArrow = compassCard.querySelector(".compass-arrow");
    compassArrow.style.setProperty('--rotation', rotation);
    compassArrow.classList.add("rotate");        

}
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
    sun: "Dégagé",
    suncloud: "Partiellement nuageux",
    cloud: "Nuageux",
    rain: "Pluvieux",
    snow: "Neigeux",
    thunder: "Orageux"
};

function updateWeatherIcon(code) {
    let weather = 'cloud'; 
    let keyword = "Nuageux"; 

    for (let icon in weatherIcons) {
        if (weatherIcons[icon].includes(code)) {
            weather = icon;
            keyword = weatherKeywords[icon]; 
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
    index = Math.max(0, Math.min(index, 17)); // L'index max doit être 23, pas slider.childElementCount - 1

    translateX = -index * cardWidth;

    // Applique une limite de mouvement pour éviter que translateX dépasse la 24ème carte
    if (translateX < maxTranslateX) {
        translateX = maxTranslateX;  // Empêche de dépasser la 24ème carte
    }

    // Applique la transition pour un effet de glissement fluide
    slider.style.transition = "transform 0.5s ease-in-out";
    slider.style.transform = `translateX(${translateX}px)`;
}
