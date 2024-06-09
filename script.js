
function isStandaloneApp() {
    return window.matchMedia("(display-mode: standalone)").matches;
}

function toggleFullscreen() {
    const elem = document.documentElement;

    if (!document.fullscreenElement) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
    }
}

/*
 * Service worker
 */

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

/*
 * Router
 */

window.addEventListener("load", () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches('[data-link]')) {
            e.preventDefault();
            console.log("Clicked " + e.target.href);
            navigateTo(e.target.href)
        }
    });

    document.getElementById("pgStart").style.display = "flex";

    document.getElementById("vwsize").textContent = `${window.visualViewport.width} x ${window.visualViewport.height}`;
});


const navigateTo = (url) => {
    
    // Page exit actions
    if (document.getElementById("pgScanQR").style.display !== 'none') {
        if (!url.includes("gotoPageScanQR")) {
            stopScanner();
        }
    }
    
    document.getElementById("pgStart").style.display = 'none';
    document.getElementById("pgScanQR").style.display = 'none';
    document.getElementById("pgEnterAmount").style.display = 'none';
    document.getElementById("pgPaymentOK").style.display = 'none';

    // Page entry actions
    if (url.includes("gotoStartPage")) {
        document.getElementById("pgStart").style.display = 'flex';
    } else if (url.includes("gotoPageScanQR")) {
        document.getElementById("pgScanQR").style.display = 'flex';

        startScanner();
    } else if (url.includes("gotoPageEnterAmount")) {
        document.getElementById("pgEnterAmount").style.display = 'flex';

        if (iosPwaCameraBug || noCodeScanned) {
            var result = prompt("Provide description:");
            if (!result) {
                result = "Zudi Güggeli-Grill";
            }
            document.getElementById("lblVendorConfirm").textContent = result;
        }

        document.getElementById("inpAmount").value = "";
        document.getElementById("butTwint").setAttribute("state", "disabled");
        validAmount = "";
    } else if (url.includes("gotoPagePaymentOk")) {
        document.getElementById("pgPaymentOK").style.display = 'flex';

        const date = new Date();
        document.getElementById("lblDateTime").textContent = date.toLocaleDateString('fr-CH') + " | " + date.toLocaleTimeString('fr-CH');
        document.getElementById("lblAmount").textContent = "CHF " + normalizeAmount(document.getElementById("inpAmount").value);
        document.getElementById("lblVendorFinal").textContent = document.getElementById("lblVendorConfirm").textContent;
    } else if (url.includes("gotoFullscreen")) {
        toggleFullscreen();
    }
}

/*
 * QR Code Scanner & vendor data management
 */

const LCLSTRG_KEY_KNOWN_VENDORS = 'keyKnownVendors';

var html5QrCode;
var iosPwaCameraBug = false;
var knownVendors;
var noCodeScanned = true;

const loadKnownVendors = () => {
    const storedValues = localStorage.getItem(LCLSTRG_KEY_KNOWN_VENDORS);
    return storedValues ? JSON.parse(storedValues) : {};
};

const saveKnownVendors = (values) => {
    localStorage.setItem(LCLSTRG_KEY_KNOWN_VENDORS, JSON.stringify(values));
};

window.addEventListener("load", () => {
    html5QrCode = new Html5Qrcode("vidScanner");

    knownVendors = loadKnownVendors();
});

function stopScanner() {
    try {
        let state = html5QrCode?.getState();
        if (state && (state !== Html5QrcodeScannerState.NOT_STARTED)) {
            html5QrCode.stop().catch((err) => alert(`Error scanner stop: ${err}`));
        }
    } catch (err) {
        alert(`stopScanner throw: ${err}`);
    }
}

function startScanner() {
    const successCallback = (decodedText, decodedResult) => {
        var result = "";
        if (knownVendors.hasOwnProperty(decodedText)) {
            result = knownVendors[decodedText];
        } else {
            result = prompt("Provide description:");
            if (result) {
                knownVendors[decodedText] = result;
                saveKnownVendors(knownVendors);
            }
        }

        document.getElementById("lblVendorConfirm").textContent = result;

        //alert(`QR Code detected: ${decodedText}`);
        html5QrCode.stop().then((ignore) => {
            noCodeScanned = false;
            navigateTo("gotoPageEnterAmount");
        }).catch((err) => {
            console.error(err);
        });
    };

    const config = { fps: 10, qrbox: { width: 200, height: 150 } };

    if (html5QrCode.getState() !== Html5QrcodeScannerState.NOT_STARTED) {
        console.warn("Scanner is not stopped.");
        return;
    }
    noCodeScanned = true;
    html5QrCode.start({ facingMode: "environment" }, config, successCallback).then(() => {
        setTimeout(() => {
            if (document.getElementById("pgScanQR").style.display === 'none') {
                return;
            }
            let trackSettings = html5QrCode.getRunningTrackCameraCapabilities();
            let info = `enbl: ${trackSettings.track.enabled}; lbl: ${trackSettings.track.label}; muted: ${trackSettings.track.muted}; state: ${trackSettings.track.readyState}`
            document.getElementById("videoData").textContent = info;
            iosPwaCameraBug = (trackSettings.track.readyState !== "live");
            document.getElementById("videoData").style.color = iosPwaCameraBug ? "red" : "green";
        }, 1000);
    }).catch(err => {
        console.error(err);
    });
};

/*
 * Amount input field validation
 */

document.getElementById('inpAmount').addEventListener("input", validateAndFormatInput);

var validAmount = "";

function validateAndFormatInput() {
    const inputField = document.getElementById('inpAmount');
    let value = inputField.value;

    // Remove any invalid characters
    const regex = '[^0-9.]';
    if (value.match(regex)) {
        value = validAmount;
        inputField.value = value;
        return;
    }

    // If there's a leading zero, it can be followed only by a decimal point
    if (value.length > 1 && value[0] === '0' && value[1] !== '.') {
        value = validAmount;
        inputField.value = value;
        return;
    }

    // Limit to a single decimal point
    let count = 0;
    for (let i = 0; i < value.length; i++) {
        if (value[i] === '.') {
            count++;
        }
    }
    if (count > 1) {
        value = validAmount;
        inputField.value = value;
        return;
    }

    // Split the value into integer and decimal parts
    const parts = value.split('.');
    let integerPart = parts[0];
    let decimalPart = parts[1] || '';

    // Limit to 1000
    if (parseInt(integerPart) > 1000) {
        value = validAmount;
        inputField.value = value;
        return;
    }

    // Limit the decimal part to 2 digits
    if (decimalPart !== '' && decimalPart.length > 2) {
        value = validAmount;
        inputField.value = value;
        return;
    }

    validAmount = value;

    // Update the input field with the formatted value
    inputField.value = value;

    if (inputField.value === "") {
        document.getElementById("butTwint").setAttribute("state", "disabled");
    } else {
        document.getElementById("butTwint").setAttribute("state", "enabled");
    }
}

function normalizeAmount(value) {
    // Split the value into integer and decimal parts
    const parts = value.split('.');
    let integerPart = parts[0];
    let decimalPart = parts[1] || '';

    if (integerPart.length === 0) {
        integerPart = "0";
    }

    if (decimalPart.length === 0) {
        decimalPart = "00";
    } else if (decimalPart.length === 1) {
        decimalPart = `${decimalPart}0`;
    }

    // Reconstruct the value
    value = `${integerPart}.${decimalPart}`;

    return value;
}
/* EOF */
