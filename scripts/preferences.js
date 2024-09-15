//update the flags that the user is subscribed to
function updatePreferences(){
    // Get all checkboxes within the form
    const checkboxes = document.querySelectorAll('#preference-options input[type="checkbox"]');
    
    // Filter out the checked checkboxes and collect their values
    const checkedValues = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    //save to chrome synced storage
    chrome.storage.sync.set({ flagPreferences: checkedValues }, function() {
        console.log('Flag preferences saved:', checkedValues);
    });
}