browser.storage.local.get("selectedText", (result) => {
  // Check if the selectedText exists in storage
  const selectedText = result.selectedText || "No text selected.";
  // Display the selected text in the popup
  document.getElementById("selected-text").textContent = selectedText;
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

  let currentIndex = -1;

  domainBoxText.addEventListener("keydown", (e) => {
    const items = list.getElementsByTagName("li");
    if (!items.length) return;

    if (e.key === "ArrowDown") {
        e.preventDefault();
        if (currentIndex < items.length - 1) currentIndex++;
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (currentIndex > 0) currentIndex--;
    } else if (e.key === "Enter" && currentIndex > -1) {
        e.preventDefault();
        domainBoxText.value = items[currentIndex].textContent;
        list.innerHTML = ""; // Close dropdown
        currentIndex = -1;
        return;
    }

    // Remove previous highlight
    Array.from(items).forEach(item => item.classList.remove("highlighted"));

    // Add highlight to the selected item
    if (currentIndex > -1) {
        items[currentIndex].classList.add("highlighted");
    }
  });

  domainBoxText.addEventListener("input", function () {
      const query = this.value.toLowerCase();
      list.innerHTML = "";

      if (!query) return;

      suggestions
        .filter(item => item.toLowerCase().startsWith(query))
        .forEach(item => {
            const li = document.createElement("li");
            li.classList.add("autocomplete-item");
            li.textContent = item;
            li.addEventListener("click", function () {
                domainBoxText.value = item;
                list.innerHTML = "";
            });
            list.appendChild(li);
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
