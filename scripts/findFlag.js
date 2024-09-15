const HOST_DATA_PATH = '../api/hosts.json';

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

//check url for associated flag
async function checkForHost(searchUrl) {
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

    //check if host has any flags in preferences
    let relevantHost = false;
    chrome.storage.sync.get(['flagPreferences'], function(result) {
        //check each flag against preferences until one is found
        for (let i = 0; i < host.flags.length; i++){
            if (host.flags[i]["flag-type-key"] in result.flagPreferences){
                relevantHost = true;
                break;
            }
        }
    });
    if (!relevantHost) return null;

    //return true if userUrl exists in db and relevant to preferences
    return flag;
}

export default checkForHost;