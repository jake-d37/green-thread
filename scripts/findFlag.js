const HOST_DATA_PATH = chrome.runtime.getURL('api/hosts.json');

//store what URLs have already been searched
let alreadySearched = [];

//find a brand by url in json
async function searchHostByUrl(jsonFileUrl, searchUrl) {
    try {
        // Fetch the JSON file
        const response = await fetch(jsonFileUrl);
        const hosts = await response.json(); // Parse the JSON

        // Search for the user with the matching key
        const host = hosts.find(host => host.link === searchUrl);

        // Return the
        return host;
    } catch (error) {
        console.error('Error loading or searching JSON file:', error);
        return null;
    }
}

function getFlagPreferences() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['flagPreferences'], (result) => {
            resolve(result.flagPreferences || {});
        });
    });
}

//check url for associated flag
export default async function checkForHost(searchUrl) {
    const jsonFileUrl = HOST_DATA_PATH;

    //ensure the url hasn't been checked already this session
    for (let i = 0; i < alreadySearched.length; i++) {
        if (searchUrl === alreadySearched[i]) {
            //its already been checked
            return null;
        }
    }

    //add this url to the ones already searched this session
    alreadySearched.push(searchUrl);

    const host = await searchHostByUrl(jsonFileUrl, searchUrl);

    if (!host) {
        return null; // Host not found in the JSON file
    }

    // Get flag preferences
    const flagPreferences = await getFlagPreferences();

    // Check if host has any relevant flags
    const relevantHost = host.flags.some(flag => flag["flag-type-key"] in flagPreferences);

    // Return true if userUrl exists in db and relevant to preferences
    return relevantHost ? host : null;
}