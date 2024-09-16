const FLAG_TYPES_PATH = chrome.runtime.getURL('api/flag-types.json');

//store the flag types globally, but do not await it at the top level
let flagTypes = null;

//fetch the flag types during service worker initialization
async function initializeFlagTypes() {
    flagTypes = await fetchFlagTypes();
    console.log("Flag types: " + flagTypes);
}

// Initialize flag types on startup (using `chrome.runtime.onInstalled`)
chrome.runtime.onInstalled.addListener(() => {
    initializeFlagTypes();
});

// show dynamic notification based on host data
export default function showNotification(hostObj) {
    //initialize text content
    let notifTitle = "";
    let notifMessage = "";
    let notifIconUrl = 'images/icons/icon-128.png';
    let notifButtonMessage = "";

    //get the host info
    const pageName = hostObj.name;
    const flags = hostObj.flags;

    let negativityCount = 0;

    //dynamically set notification message
    notifMessage = `${pageName} has been flagged as `;

    //differnet logic if there is only one flag
    if (flags.length === 1){
        notifMessage += `${formatFlagName(flags[0])}.`;
    } else {
        for (let i = 0; i < flags.length - 1; i++) {
            notifMessage += `${formatFlagName(flags[i])}, `;

            //count how many negative flags there are
            if (flags[i]["pos-neg"] === "neg"){
                negativityCount++;
            }
        }
        notifMessage += `and ${formatFlagName(flags[flags.length - 1])}.`;
    }

    //dynamically set title
    if (negativityCount >= 1){
        notifTitle = `Watch out for ${pageName}`;
    } else {
        notifTitle = `${pageName} is great!`;
    }

    //dynamically set icon based on proportion of negative flags
    const positivityScore = flags.length - negativityCount;
    if (positivityScore <= 0){
        //set red icon
        notifButtonMessage = "Find alternatives";
    } else if (positivityScore >= flags.length){
        //set green icom
        notifButtonMessage = "Find out more";
    } else {
        //set yellow icon
        notifButtonMessage = "Find alternatives";
    }

    // Check if the notifications API is available
    if (chrome.notifications) {
        chrome.notifications.create('openInfo',{
            type: 'basic',
            iconUrl: notifIconUrl,
            title: notifTitle,
            message: notifMessage,
            priority: 2,
            buttons: [
                { title: notifButtonMessage }
            ]
        });
    } else {
        console.error("Notifications API is unavailable.");
    }
}

//format the flag name for the message based on its flag type and positivity
function formatFlagName(f){
    //fecth flag types if haven't already
    if (!flagTypes){
        console.error('Flag types not yet retrieved');
        return null;
    }

    //get this flag type
    const thisFlagType = flagTypes[f["flag-type-key"]];

    //whether this is a positive or negative flag
    let formattedName;
    if (f["pos-neg"] === "pos"){
        //positive flag
        formattedName = thisFlagType["positive-name"];
    } else {
        //negative flag
        formattedName = thisFlagType["negative-name"];

    }
    //make it all lower case
    formattedName = formattedName.toLowerCase();

    return formattedName;
}

// Handle the notification button click event
chrome.notifications.onButtonClicked.addListener((notificationId) => {
    console.log(`Notification button clicked: ${notificationId}`);
    
    if (notificationId === 'openInfo') {
        console.log("Opening side panel from notification button");
        
        // Use setOptions to dynamically load a page into the side panel
        chrome.tabs.create({ url: 'popup/info.html' });
    }
});

//CANT GET THIS WORKING IDK WHAT TO DO
async function openSidePanel() {
    const tabId = getCurrentTab();
    chrome.sidePanel.open({ tabId: tabId });
}

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }

//get the flag types from JSON
async function fetchFlagTypes() {
    try {
        const response = await fetch(FLAG_TYPES_PATH);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        return null;
    }
}