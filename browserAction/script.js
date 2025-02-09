
browser.storage.local.get("selectedText", (result) => {
  // Check if the selectedText exists in storage
  const selectedText = result.selectedText || "No text selected.";
  // Display the selected text in the popup
  document.getElementById("selected-text").textContent = selectedText;
});

document.addEventListener("DOMContentLoaded", async function () {

  const domainBoxText = document.getElementById("search");
  const list = document.getElementById("autocomplete-list");

  let suggestions = []; // Will be populated from storage

  // Load suggestions from storage
  async function loadSuggestions() {
      const result = await browser.storage.local.get("storedDomains");
      suggestions = result.storedDomains || []; // Default to empty array if not found
  }

  // Run initial load
  await loadSuggestions();

  domainBoxText.addEventListener("input", function () {
      const query = this.value.toLowerCase();
      list.innerHTML = "";

      if (!query) return;

      suggestions
          //.filter(item => item.toLowerCase().includes(query))
          .filter(item => item.toLowerCase().startsWith(query))
          .forEach(item => {
              const div = document.createElement("div");
              div.classList.add("autocomplete-item");
              div.textContent = item;
              div.addEventListener("click", function () {
                domainBoxText.value = item;
                list.innerHTML = "";
              });
              list.appendChild(div);
          });
      }
  );

  browser.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "local" && changes.storedDomains) {
          suggestions = changes.storedDomains.newValue || [];
          console.log("Updated suggestions:", suggestions);
      }
    }
  );
});

const storeDomain = (domain) => {

  browser.storage.local.get("storedDomains", (result) => {
    let storedDomains = result.storedDomains || [];
    console.log("the stored domains are: " + JSON.stringify(result));
    if(!storedDomains.includes(domain)) {
      storedDomains.push(domain);
      browser.storage.local.set({ storedDomains: storedDomains });
    }
  });

}

let selectedRoot = '';

document.getElementById("search-btn").addEventListener("click", () => {
  // Get the user-entered domain
  let domain = document.getElementById("search").value;

  if (selectedRoot !== '')
    domain = selectedRoot;
  else if(!domain)
    return
  const selectedText = document.getElementById("selected-text").textContent.trim();
  if (selectedText) {
    // Construct the query: selected text + site:<user-entered domain>
    const query = `${selectedText} site:${domain}`;
    storeDomain(domain);
    // Perform the search using the default search engine
    browser.search.search({ query });
  }
  // Close the popup after search
  window.close();
});
