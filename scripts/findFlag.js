const HOST_DATA_PATH = chrome.runtime.getURL('api/hosts.json');

//store what URLs have already been searched
let alreadySearched = [];

//find a brand by url in json
async function searchHostByUrl(jsonFileUrl, searchUrl) {
    try {
        // Fetch the JSON file
        const response = await fetch(jsonFileUrl);
        const hosts = await response.json(); // Parse the JSON

        // Convert object values into an array
        const hostArray = Object.values(hosts);

        // Search for the user with the matching key
        const host = hostArray.find(host => host['host-link'] === searchUrl);

        if (host){
            console.log("Host found in db: "+ host['name']);
        } else {
            console.log("Host not found in db: "+ searchUrl);
        }

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
            console.log("This was checked during this session already");
            return null;
        }
    }

    //add this url to the ones already searched this session
    alreadySearched.push(searchUrl);

    const host = await searchHostByUrl(jsonFileUrl, searchUrl);

    if (!host) {
        console.log("No data on this host");
        return null; // Host not found in the JSON file
    } else {
        console.log("got host: " + host);
    }

    // Get flag preferences
    const flagPreferences = await getFlagPreferences();
    console.log("got flag preferences: " + flagPreferences);

    // Check if host has any relevant flags
   // const relevantHost = host.flags.some(flag => flag["flag-type-key"] in flagPreferences);
    const relevantHost = true;

    if (!relevantHost){
        console.log("This host didn't match any of your preferences");
    }

    // Return true if userUrl exists in db and relevant to preferences
    return relevantHost ? host : null;
}