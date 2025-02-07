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
      return parts.slice(-2).join('.');
  }
  return domain;
}

browser.menus.create({
  id: "log-selection",
  title: browser.i18n.getMessage("menuItemSelectionLogger"),
  contexts: ["selection"]
}, onCreated);

browser.menus.create({
  id: "thisdomain",
  parentId: "log-selection",
  title: "This domain",
  contexts: ["selection"]
});

browser.menus.create({
  id: "choosedomain",
  parentId: "log-selection",
  title: "Choose...",
  contexts: ["selection"]
});

browser.menus.onClicked.addListener((info, tab) => {
  if(info.menuItemId === "choosedomain") {
      const url = new URL(tab.url);
      const domain = url.hostname;
      browser.storage.local.set({ selectedText: info.selectionText });
      browser.action.openPopup();
      browser.search.get().then((engines) => {
        engines.forEach((engine) => {
          console.log(`Name: ${engine.name}, Is Default: ${engine.isDefault}`);
        });
      });
  } else if(info.menuItemId === "thisdomain") {
    const url = new URL(tab.url);
    const domain = url.hostname;
    // Construct the query: selected text + site:<user-entered domain>
    const query = `${info.selectionText} site:${getSubdomain(domain)}`;
    // Perform the search using the default search engine
    browser.search.search({ query });
  }
});