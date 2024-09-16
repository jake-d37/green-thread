import checkForHost from "./scripts/findFlag.js";
import showNotification from './scripts/notify.js';

console.log("Doing something");

//get the hostname from a URL
function getHostName(url) {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
}

//when a new page loads
chrome.webNavigation.onCompleted.addListener(async function (details) {
    //ensure we don't get too specific of a url
    let hostName = getHostName(details.url);

    console.log('Host: ', hostName);

    //check for flagged host
    const hostObj = await checkForHost(hostName);
    if (hostObj) {
        //show notification is flagged
        showNotification(hostObj);
    }

}, { url: [{ urlMatches: 'https://*/*' }] });