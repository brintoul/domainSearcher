const defaultDomains = [".com", ".org", ".edu", ".net", ".gov", ".io"];

browser.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed!", details);
  browser.storage.local.get("storedDomains").then((result) => {
    if (!result.storedDomains || result.storedDomains.length === 0) {
      browser.storage.local.set({ storedDomains: defaultDomains });
      console.log("Seeded default domains.");
    }
  });
});

// Put all the javascript code here, that you want to execute in background.
function onCreated() {
  if (browser.runtime.lastError) {
    console.error(`Error: ${browser.runtime.lastError}`);
  } else {
    console.log("Context menu item created successfully.");
  }
}

function getSubdomain(domain) {
  let parts = domain.split('.');
  if (parts.length > 2) {
      return parts.slice(-3).join('.');
  }
  return domain;
}

browser.menus.removeAll().then(() => {
  browser.menus.create({
    id: "text-selection",
    title: browser.i18n.getMessage("menuItemSelectionLogger"),
    contexts: ["selection"]
  }, onCreated);

  browser.menus.create({
    id: "thisdomain",
    parentId: "text-selection",
    title: "This domain",
    contexts: ["selection"]
  });

  browser.menus.create({
    id: "choosedomain",
    parentId: "text-selection",
    title: "Choose...",
    contexts: ["selection"]
  });
});

browser.menus.onClicked.addListener((info, tab) => {
  if(info.menuItemId === "choosedomain") {
      const url = new URL(tab.url);
      const domain = url.hostname;
      browser.storage.local.set({ selectedText: info.selectionText, launchSource: "contextMenu" });
      browser.action.openPopup();
  } else if(info.menuItemId === "thisdomain") {
    const url = new URL(tab.url);
    const storeDomain = getSubdomain(url.hostname);
    const parts = url.hostname.split('.');
    const searchDomain = parts.length > 2 ? parts.slice(-2).join('.') : url.hostname;
    // Save both the subdomain and root domain for autocomplete
    browser.storage.local.get("storedDomains").then((result) => {
      const storedDomains = result.storedDomains || [];
      let changed = false;
      for (const d of [storeDomain, searchDomain]) {
        if (!storedDomains.includes(d)) {
          storedDomains.push(d);
          changed = true;
        }
      }
      if (changed) browser.storage.local.set({ storedDomains });
    });
    // Construct the query: selected text + site:<root domain>
    const query = `${info.selectionText} site:${searchDomain}`;
    // Perform the search using the default search engine
    browser.search.search({ query });
  }
});