const domainList = document.getElementById('domain-list');
const emptyState = document.getElementById('empty-state');

function rootDomain(domain) {
  const parts = domain.split('.');
  return parts.length > 2 ? parts.slice(-2).join('.') : domain;
}

function groupByRoot(domains) {
  const groups = new Map();
  domains.forEach((domain) => {
    const root = rootDomain(domain);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(domain);
  });
  return groups;
}

function render(domains) {
  domainList.innerHTML = '';
  if (domains.length === 0) {
    domainList.hidden = true;
    emptyState.hidden = false;
    return;
  }
  domainList.hidden = false;
  emptyState.hidden = true;

  const groups = groupByRoot(domains);
  groups.forEach((members, root) => {
    if (members.length === 1) {
      const li = document.createElement('li');
      li.className = 'domain-row';
      const span = document.createElement('span');
      span.textContent = members[0];
      const btn = document.createElement('button');
      btn.textContent = 'Remove';
      btn.addEventListener('click', () => removeDomains([members[0]]));
      li.appendChild(span);
      li.appendChild(btn);
      domainList.appendChild(li);
      return;
    }

    // Group header (collapsed by default)
    const header = document.createElement('li');
    header.className = 'group-header collapsed';
    header.innerHTML = `<span class="toggle-icon">▶</span><span class="group-label">${root} (${members.length})</span>`;
    header.addEventListener('click', () => toggleGroup(root));
    header.dataset.group = root;
    domainList.appendChild(header);

    // Member rows (hidden by default)
    members.forEach((domain) => {
      const li = document.createElement('li');
      li.className = 'domain-row group-member';
      li.dataset.group = root;
      li.hidden = true;
      const span = document.createElement('span');
      span.textContent = domain;
      const btn = document.createElement('button');
      btn.textContent = 'Remove';
      btn.addEventListener('click', () => removeDomains([domain]));
      li.appendChild(span);
      li.appendChild(btn);
      domainList.appendChild(li);
    });

    // Remove all row (hidden by default)
    const removeAllLi = document.createElement('li');
    removeAllLi.className = 'remove-all-row group-member';
    removeAllLi.dataset.group = root;
    removeAllLi.hidden = true;
    const removeAllBtn = document.createElement('button');
    removeAllBtn.textContent = `Remove all for ${root}`;
    removeAllBtn.addEventListener('click', () => removeDomains(members));
    removeAllLi.appendChild(removeAllBtn);
    domainList.appendChild(removeAllLi);
  });
}

function toggleGroup(root) {
  const header = domainList.querySelector(`.group-header[data-group="${root}"]`);
  const members = domainList.querySelectorAll(`.group-member[data-group="${root}"]`);
  const isCollapsed = header.classList.contains('collapsed');

  header.classList.toggle('collapsed', !isCollapsed);
  header.querySelector('.toggle-icon').textContent = isCollapsed ? '▼' : '▶';
  header.querySelector('.group-label').textContent = isCollapsed
    ? root
    : `${root} (${members.length - 1})`; // -1 to exclude remove-all row

  members.forEach((m) => { m.hidden = isCollapsed ? false : true; });
}

function removeDomains(toRemove) {
  browser.storage.local.get('storedDomains').then((result) => {
    const updated = (result.storedDomains || []).filter((d) => !toRemove.includes(d));
    browser.storage.local.set({ storedDomains: updated }).then(() => render(updated));
  });
}

browser.storage.local.get('storedDomains').then((result) => {
  render(result.storedDomains || []);
});
