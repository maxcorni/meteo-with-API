
---

# Weather App

## Description

Une application météo interactive qui affiche les prévisions pour les 7 prochains jours, les prévisions heure par heure, ainsi que des informations détaillées sur la météo actuelle (température, direction du vent, etc.). L'application ajuste également l'image de fond en fonction du moment de la journée (jour ou nuit) et des conditions météorologiques. L'utilisateur peut choisir une ville via un formulaire et obtenir les informations correspondantes.

## 🚀 **Démo en ligne**
👉 [https://maxcorni.github.io/meteo-with-API/]


## Fonctionnalités

- **Affichage des prévisions à 7 jours** : Pour chaque jour, l'application affiche la température maximale et minimale, ainsi que l'icône associée à l'état du temps.
- **Affichage des prévisions heure par heure** : L'application affiche les prévisions détaillées pour chaque heure de la journée.
- **Affichage de la météo actuelle** : Inclut des informations comme la température actuelle, la direction et la vitesse du vent, avec une boussole dynamique pour la direction du vent.
- **Image de fond dynamique** : L'image de fond change en fonction de la météo (jour/nuit et état du ciel).
- **Sélection de la ville** : L'utilisateur peut saisir une ville via un formulaire pour obtenir les prévisions météorologiques correspondantes.
- **Défilement horizontal interactif** : Les utilisateurs peuvent faire défiler horizontalement les éléments de température et les prévisions de la semaine en glissant la souris.

## Technologies utilisées

- **HTML5** : Structure de base du site.
- **SCSS** : Mise en page et stylisation (notamment des éléments dynamiques comme la boussole et les sliders).
- **JavaScript** : Logique de récupération et d'affichage des données météo, gestion de l'interface utilisateur interactive.
- **API OpenWeather** : Pour récupérer les données météo en temps réel (météo actuelle, prévisions à 7 jours, prévisions heure par heure).
- **API Nominatim (OpenStreetMap)** : Pour récupérer les coordonnées géographiques de la ville choisie.
- **Icones personnalisées** : Affichage des icônes météo en fonction des conditions actuelles.

## Installation

1. Clonez ce repository sur votre machine locale :

   ```bash
   git clone https://github.com/maxcorni/weather-app.git
   ```

2. Allez dans le dossier du projet :

   ```bash
   cd weather-app
   ```

3. Ouvrez le fichier `index.html` dans votre navigateur pour tester l'application.

## Utilisation

1. **Affichage dynamique de la météo** :
   - La météo actuelle est affichée en temps réel, avec des informations sur la température et le vent.
   - Les prévisions pour les 7 prochains jours sont affichées avec des icônes correspondantes.
   - Les prévisions heure par heure sont également affichées pour fournir des informations plus détaillées sur la météo de chaque heure.

2. **Affichage du vent** :
   - La direction du vent est indiquée avec une **boussole dynamique**, dont la flèche pointe dans la direction du vent en temps réel.

3. **Sélection de la ville** :
   - L'utilisateur peut choisir la ville qu'il souhaite consulter grâce à un formulaire de saisie.
   - La ville choisie est utilisée pour récupérer les données météorologiques grâce à l'API **Nominatim** pour obtenir les coordonnées et **OpenWeather** pour les prévisions.

4. **Interactivité** :
   - Le slider de température et de semaine peut être contrôlé par glissement horizontal.

5. **Changement de fond** :
   - L'image de fond change automatiquement en fonction du moment de la journée (jour ou nuit) et des conditions météorologiques actuelles.


## Auteurs

- **Maxime Cornillon** - [MaximeCornillon](https://github.com/maxcorni)

## License

Projet réalisé dans le cadre pédagogique de Webecom 2025. Non destiné à un usage commercial.

---
