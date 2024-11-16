// Sprache des Browsers abrufen
const userLanguage = navigator.language || navigator.userLanguage;

// Funktion zur Bestimmung der Sprache
function getLanguage() {
    if (userLanguage.startsWith("de")) {
        return "de"; // Deutsch
    } else {
        return "en"; // Englisch als Standard
    }
}

// Aktuelle Sprache festlegen
const currentLanguage = getLanguage();

// Übersetzungen
const translations = {
    de: {
        statusFetching: "Standort wird ermittelt...",
        statusSuccess: "Standort erfolgreich gesendet!",
        statusError: "Fehler beim Senden des Standorts.",
        geolocationNotSupported: "Geolocation wird von diesem Gerät nicht unterstützt.",
        geolocationError: "Fehler bei der Standortermittlung: "
    },
    en: {
        statusFetching: "Fetching location...",
        statusSuccess: "Location successfully sent!",
        statusError: "Error sending location.",
        geolocationNotSupported: "Geolocation is not supported by this device.",
        geolocationError: "Error retrieving location: "
    }
};

// Übersetzte Texte verwenden
function getTranslation(key) {
    return translations[currentLanguage][key];
}

// Event-Listener für den Button
document.getElementById("sendLocationBtn").addEventListener("click", function() {
    const statusElement = document.getElementById("status");
    statusElement.textContent = getTranslation("statusFetching");

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        statusElement.textContent = getTranslation("geolocationNotSupported");
        sendErrorToAirtable(getTranslation("geolocationNotSupported"));
    }

    function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        statusElement.textContent = `Standort: (${latitude}, ${longitude})`;

        sendLocationToAirtable(latitude, longitude);
    }

    function error(err) {
        statusElement.textContent = `${getTranslation("geolocationError")}${err.message}`;
        sendErrorToAirtable(`${getTranslation("geolocationError")}${err.message}`);
    }
});

function sendLocationToAirtable(lat, long) {
    const airtableApiKey = 'patKGZansVOgQzmoO.cbba17752195e08b14aef61da396fbdeffeb5acfe58eaacf94dbdbe9f7d7fdbc';    // Airtable API-Schlüssel
    const airtableBaseId = 'appECl30m16Rv1iTS';           // Airtable Base-ID
    const airtableTableName = 'currentLocation';        // Airtable Tabellenname
    const recordId = 'rec41O8E9RVes5BvP';               // ID des Datensatzes, den du überschreiben möchtest

    const url = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableName}/${recordId}`;
    const data = {
        fields: {
            "Latitude": lat,
            "Longitude": long,
            "Error": ""  // Fehler wird gelöscht, wenn der Standort erfolgreich ist
        }
    };

    fetch(url, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${airtableApiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errData => {
                throw new Error(`Fehler ${response.status}: ${errData.error.message}`);
            });
        }
        return response.json();
    })
    .then(data => {
        document.getElementById("status").textContent = getTranslation("statusSuccess");
    })
    .catch(error => {
        document.getElementById("status").textContent = getTranslation("statusError");
        console.error("Error:", error);
    });
}

function sendErrorToAirtable(errorMessage) {
    const airtableApiKey = 'patKGZansVOgQzmoO.cbba17752195e08b14aef61da396fbdeffeb5acfe58eaacf94dbdbe9f7d7fdbc';    // Airtable API-Schlüssel
    const airtableBaseId = 'appECl30m16Rv1iTS';           // Airtable Base-ID
    const airtableTableName = 'currentLocation';        // Airtable Tabellenname
    const recordId = 'rec41O8E9RVes5BvP';               // ID des Datensatzes, den du überschreiben möchtest

    const url = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableName}/${recordId}`;
    const data = {
        fields: {
            "Error": errorMessage,
            "Latitude": "",  // Leeren, da keine Koordinaten ermittelt wurden
            "Longitude": ""  // Leeren, da keine Koordinaten ermittelt wurden
        }
    };

    fetch(url, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${airtableApiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errData => {
                throw new Error(`Fehler ${response.status}: ${errData.error.message}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log("Fehlermeldung erfolgreich an Airtable gesendet:", data);
    })
    .catch(error => {
        console.error("Fehler beim Senden der Fehlermeldung:", error);
    });
}
