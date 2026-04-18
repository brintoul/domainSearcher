
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

const performSearch = () => {
    // Get the user-entered domain
    let domain = document.getElementById("search").value;

    if (selectedRoot !== '')
      domain = selectedRoot;
    else if(!domain)
      return

    const searchTerm = document.getElementById("search-term").value.trim();
    if (searchTerm) {
      // Construct the query: search term + site:<user-entered domain>
      const query = `${searchTerm} site:${domain}`;
      storeDomain(domain);
      // Perform the search using the default search engine
      browser.search.search({ query });
    }
    // Close the popup after search
    window.close();
}

document.addEventListener("DOMContentLoaded", async function () {

  const domainBoxText = document.getElementById("search");
  const list = document.getElementById("autocomplete-list");

  const defaultDomains = [".com", ".org", ".edu", ".net", ".gov", ".io"];
  let suggestions = [];

  // Load suggestions from storage, always including defaults
  async function loadSuggestions() {
      const result = await browser.storage.local.get("storedDomains");
      const stored = result.storedDomains || [];
      suggestions = [...new Set([...defaultDomains, ...stored])];
  }

  // Run initial load
  await loadSuggestions();

  // Pre-populate search term if launched from context menu
  const storageResult = await browser.storage.local.get(["selectedText", "launchSource"]);
  if (storageResult.launchSource === "contextMenu" && storageResult.selectedText) {
    document.getElementById("search-term").value = storageResult.selectedText;
    browser.storage.local.remove("launchSource");
  }

  let currentIndex = -1;
  let selectionMade = false;

  domainBoxText.addEventListener("keydown", (e) => {
    const items = list.getElementsByTagName("li");
    //if (!items.length) return;

    if (e.key === "ArrowDown") {
        e.preventDefault();
        if (currentIndex < items.length - 1) currentIndex++;
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (currentIndex > 0) currentIndex--;
    } else if (e.key === "Enter") {
        e.preventDefault();
        if(currentIndex > -1) {
          console.log("The current index is greater than -1");
          domainBoxText.value = items[currentIndex].textContent;
          list.innerHTML = ""; // Close dropdown
          currentIndex = -1;
          selectionMade = true;
        } else if(selectionMade) {
          performSearch();
        } else {
          performSearch();
        }
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
      }
    }
  );

  //for some reason doing this with a bit of delay is the only way
  //to get the focus into the search textbox.
  setTimeout(() => {
    const searchTerm = document.getElementById("search-term");
    if (searchTerm.value) {
      document.getElementById("search").focus();
    } else {
      searchTerm.focus();
    }
  }, 100);

});

let selectedRoot = '';

document.getElementById("search-btn").addEventListener("click", () => {
  performSearch();
});
