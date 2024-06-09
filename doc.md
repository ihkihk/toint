screenshot: 960x2079 96dpi (Was taken when DeviceZoom was On, which makes the viewport be 320x693)
iphone 12 pro: viewport 390x844,  screen size 1170x2532, DPR device pixel ratio 3

Remaining issues:
- The virtual keyboard shrinks a bit the pgEnterAmount page
- Still using hardcoded 390x844 sizes of the page div's
- Camera not working on iOS PWA

Improve:
- If the camera does not work, use a pull-down to select the supplier


// if (!navigator.mediaDevices?.enumerateDevices) {
//     console.log("enumerateDevices() not supported.");
// } else {
//     // List cameras and microphones.
//     navigator.mediaDevices
//         .enumerateDevices()
//         .then((devices) => {
//             devices.forEach((device) => {
//                 alert(`${device.kind}: ${device.label} id = ${device.deviceId}`);
//             });
//         })
//         .catch((err) => {
//             alert(`${err.name}: ${err.message}`);
//         });
// }

try {
    var caps = html5QrCode.getRunningTrackCapabilities();
    console.log(caps);
    //alert(caps);

    caps = html5QrCode.getRunningTrackCameraCapabilities();
    console.log(caps);
    alert(`enabled: ${caps.track.enabled}; label: ${caps.track.label}; muted: ${caps.track.muted}; readyState: ${caps.track.readyState}`);
    //alert(caps);
} catch {
    alert("getRunningTrackCapabilities failed");
}