
browser.storage.local.get("selectedText", (result) => {
  // Check if the selectedText exists in storage
  const selectedText = result.selectedText || "No text selected.";
  
  // Display the selected text in the popup
  document.getElementById("selected-text").textContent = selectedText;
});

let selectedRoot = '';

document.getElementById("dns-select").addEventListener("change", () => {
  selectedRoot = document.getElementById("dns-select").value;
})

document.getElementById("search-btn").addEventListener("click", () => {
  // Get the user-entered domain
  let domain = document.getElementById("domain").value;
  
  if (selectedRoot !== '')
    domain = selectedRoot;
  else if(!domain)
    return
  
  const selectedText = document.getElementById("selected-text").textContent.trim();
  if (selectedText) {
    // Construct the query: selected text + site:<user-entered domain>
    const query = `${selectedText} site:${domain}`;
    
    // Perform the search using the default search engine
    browser.search.search({ query });
  }
  // Close the popup after search
  window.close();
});
