const FLAG_TYPES_PATH = "../api/flag-types.json";

//store the flag types
let flagTypes = fetchFlagTypes();

// show dynamic notification based on host data
function showNotification(hostObj) {
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
    for (let i = 0; i < flags.length - 1; i++) {
        notifMessage += `${formatFlagName(flags[i])}, `;

        //count how many negative flags there are
        if (flags[i]["pos-neg"] === "neg"){
            negativityCount++;
        }
    }
    notifMessage += `and ${formatFlagName(flags[flags.length - 1])}`;

    //dynamically set title
    if (negativityCount >= 1){
        notifTitle = `Watch out for ${pageName}`;
    } else {
        notifTitle = `${pageName} is great!`;
    }

    //dynamically set icon based on proportion of negative flags
    const positivityScore = flags.length - negativityCount;
    if (negDiff <= 0){
        //set red icon
    } else if (negDiff >= flags.length){
        //set green icom
    } else {
        //set yellow icon
    }

    // Check if the notifications API is available
    if (chrome.notifications) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: notifIconUrl,
            title: notifTitle,
            message: notifMessage,
            priority: 2
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

export default showNotification;