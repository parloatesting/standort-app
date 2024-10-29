document.getElementById("sendLocationBtn").addEventListener("click", function() {
    const statusElement = document.getElementById("status");
    statusElement.textContent = "Standort wird ermittelt...";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        statusElement.textContent = "Geolocation wird von diesem Gerät nicht unterstützt.";
        sendErrorToAirtable("Geolocation wird nicht unterstützt");
    }

    function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        statusElement.textContent = `Standort: (${latitude}, ${longitude})`;

        sendLocationToAirtable(latitude, longitude);
    }

    function error(err) {
        statusElement.textContent = `Fehler bei der Standortermittlung: ${err.message}`;
        sendErrorToAirtable(`Fehler bei der Standortermittlung: ${err.message}`);
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
            // Hier die Antwort als JSON lesen und im Fehlerfall ausgeben
            return response.json().then(errData => {
                throw new Error(`Fehler ${response.status}: ${errData.error.message}`);
            });
        }
        return response.json();
    })
    .then(data => {
        document.getElementById("status").textContent = "Standort erfolgreich gesendet!";
    })
    .catch(error => {
        document.getElementById("status").textContent = "Fehler beim Senden des Standorts.";
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
