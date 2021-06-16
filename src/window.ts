import { TextNodeGroup } from "./types";

const nodesDropdown = document.getElementById('nodes-dropdown') as HTMLInputElement;
const inputDropdown = document.getElementById('input-dropdown') as HTMLInputElement;

const typeOptionsTitle = document.getElementById('type-options-title');
const optionsSectionStrings = document.getElementById('options-section-strings');
const optionsSectionNumbers = document.getElementById('options-section-numbers');
const optionsSectionDates = document.getElementById('options-section-dates');

const casingDropdown = document.getElementById('casing-dropdown') as HTMLInputElement;

const minNumberInput = document.getElementById('min-number-input') as HTMLInputElement;
const maxNumberInput = document.getElementById('max-number-input') as HTMLInputElement;
const precisionNumberInput = document.getElementById('precision-number-input') as HTMLInputElement;

const minDateInput = document.getElementById('min-date-input') as HTMLInputElement;
const maxDateInput = document.getElementById('max-date-input') as HTMLInputElement;
const formatDateInput = document.getElementById('format-date-input') as HTMLInputElement;

const orderDropdown = document.getElementById('order-dropdown') as HTMLInputElement;
const prependInput = document.getElementById('prepend-input') as HTMLInputElement;
const appendInput = document.getElementById('append-input') as HTMLInputElement;

const settingsButton = document.getElementById('settings-button');
const settingsOverlay = document.getElementById('settings-overlay');
const settingsUrlsList = document.getElementById('settings-urls-list');
const settingsErrorLabel = document.getElementById('settings-error-label');
const settingsIndexCodeExample = document.getElementById('settings-index-code-example');
const settingsBackButton = document.getElementById('settings-back-button');

const confirmButton = document.getElementById('confirm-button') as HTMLInputElement;
const cancelButton = document.getElementById('cancel-button') as HTMLInputElement;

settingsOverlay.hidden = true;
confirmButton.disabled = true;

settingsIndexCodeExample.innerHTML = `{
"name": "Coffee",
"lists": [
    {
      "name": "Bean Types",
      "url": "https://public.coffee/bean-types.txt"
    }
    {
      "name": "Roasts",
      "path": "roasts.txt"
    }
  ]
}`;

onmessage = event => {
  const message = event.data.pluginMessage;
  const { type } = message;

  if (type === 'init') {
    const { url, nodeGroups } = message;
    let urls = ['https://raw.githubusercontent.com/naftalibeder/figma-mock-content/main/index.json'];
    if (url) urls.push(url);

    createSettingsUrlElements(urls);

    createNodeGroupElements(nodeGroups);
    confirmButton.disabled = nodeGroups.length === 0;

    fetchAndCreateInputElements(urls);

    inputDropdown.onchange = onInputDropdownChange;
    onInputDropdownChange();
  } else if (type === 'get-nodes') {
    const { nodeGroups } = message;

    createNodeGroupElements(nodeGroups);
    confirmButton.disabled = nodeGroups.length === 0;
  }
};

const createSettingsUrlElements = (urls) => {
  clearSettingsUrlElements();

  let urlsCopy = [...urls];
  if (urlsCopy.length === 1) urlsCopy.push(null);

  console.log(`Creating settings url elements from: [${urlsCopy}]`);

  urlsCopy.forEach((url, index) => {
    const urlWrap = document.createElement('div');
    urlWrap.className = 'horizontal-item-and-text';
    settingsUrlsList.appendChild(urlWrap);

    const urlTextField = document.createElement('input');
    urlTextField.type = 'text';
    urlTextField.placeholder = "https://mysite.com/index.json";
    urlTextField.value = url;
    urlTextField.onblur = () => {
      parent.postMessage({ pluginMessage: { type: 'save-url', url: urlTextField.value } }, '*');
      urlsCopy[index] = urlTextField.value;
      fetchAndCreateInputElements(urlsCopy);
    };
    if (index === 0) urlTextField.disabled = true;
    urlWrap.appendChild(urlTextField);
  });
}

const fetchAndCreateInputElements = (urls) => {
  console.log(`Fetching from all urls: [${urls}]`);

  clearInputOptionSections();
  createLoadingInputElement();

  let responses = []; // { baseUrl, name, lists, error }

  const next = (i) => {
    fetchInputs(urls[i], i, (response) => {
      responses.push(response);
      if (i < urls.length - 1) {
        next(i + 1);
      } else {
        clearInputOptionSections();
        for (let i = 0; i < responses.length; i++) {
          const response = responses[i];
          createInputElements(response);
        }
      }
    });
  };

  next(0);
}

const fetchInputs = (url, index, onResponse) => {
  const baseUrl = url.replace('/index.json', '');

  if (!url || url.length === 0) {
    onResponse?.({ baseUrl });
    return;
  }

  console.log(`Fetching from ${url} at index ${index}`);

  fetchLists(url, (response, error) => {
    try {
      response = JSON.parse(response);
      const { name, lists } = response;
      console.log(`Fetched ${lists.length} lists from ${url}`);
      settingsErrorLabel.hidden = true;
      if (error) throw error;
      onResponse?.({ baseUrl, ...response, error });
    } catch (error) {
      console.log(`Error: ${error}`);
      onResponse?.({ baseUrl, error });
    }
  });
}

const createLoadingInputElement = () => {
  const inputOption = document.createElement('option');
  inputOption.innerHTML = 'Loading...';
  inputDropdown.appendChild(inputOption);
}

const createInputElements = (response) => {
  const { baseUrl, name: sectionName, lists, error } = response;

  if (error) {
    settingsErrorLabel.hidden = false;
    return;
  }

  if (!sectionName || !lists) return;

  console.log(`Creating input elements from ${sectionName} (${baseUrl})`);

  const inputOptionGroup = document.createElement('optgroup');
  inputOptionGroup.label = sectionName;
  inputDropdown.appendChild(inputOptionGroup);

  lists.forEach((list, index) => {
    const { name, path, url, type } = list;

    const inputOption = document.createElement('option');
    inputOption.id = slugify(name);
    inputOption.innerHTML = name;
    inputOption.dataset.url = path ? `${baseUrl}/${path}` : url ? url : '';
    inputOption.dataset.type = type ?? 'strings';
    inputOptionGroup.appendChild(inputOption);
  });
}

const createEmptyNodeGroupElement = () => {
  const nodeOption = document.createElement('option');
  nodeOption.innerHTML = 'No items selected';
  nodesDropdown.appendChild(nodeOption);
};

const createNodeGroupElements = (nodeGroups: TextNodeGroup[]) => {
  clearNodeGroupElements();

  if (nodeGroups.length === 0) {
    createEmptyNodeGroupElement();
    nodesDropdown.disabled = true;
  } else {
    nodeGroups.forEach((nodeGroup, i) => {
      const nodes = Object.values(nodeGroup.nodesMap);
      const nodeGroupTexts = [...new Set(nodes.map(o => o.characters))];
      const fieldCountDisplay = `(${nodes.length} fields)`;
      const multipleTextValues = nodeGroupTexts.length > 1;

      let nodesDisplayText = '';
      if (multipleTextValues) {
        nodesDisplayText = `${nodeGroupTexts[0].slice(0, 12)}, ${nodeGroupTexts[1].slice(0, 12)}, ... ${fieldCountDisplay}`;
      } else {
        nodesDisplayText = `${nodeGroupTexts[0].slice(0, 30)} ${fieldCountDisplay}`;
      }

      const nodeOption = document.createElement('option');
      nodeOption.value = nodeGroup.key;
      nodeOption.innerHTML = nodesDisplayText;
      nodeOption.dataset.nodeCount = `${nodeGroup.count}`;
      if (i === 0) nodeOption.selected = true;
      nodesDropdown.appendChild(nodeOption);
    });

    nodesDropdown.disabled = false;
  }
}

const onInputDropdownChange = (event?: Event) => {
  optionsSectionStrings.hidden = true;
  optionsSectionNumbers.hidden = true;
  optionsSectionDates.hidden = true;

  if (!event) {
    typeOptionsTitle.innerHTML = `Text options`;
    optionsSectionStrings.hidden = false;
    return;
  }

  const type = event.target['options'][event.target['selectedIndex']].dataset.type;
  console.log(`Changed input: ${type}`);

  if (type === 'strings') {
    typeOptionsTitle.innerHTML = `Text options`;
    optionsSectionStrings.hidden = false;
  } else if (type === 'numbers') {
    typeOptionsTitle.innerHTML = `Number options`;
    optionsSectionNumbers.hidden = false;
  } else if (type === 'dates') {
    typeOptionsTitle.innerHTML = `Date options`;
    optionsSectionDates.hidden = false;
  }
}

confirmButton.onclick = () => {
  const selectedInputDropdownOption = inputOptions().filter(o => o.selected == true)[0];
  // @ts-ignore
  const selectedNodeDropdownOption = [...nodesDropdown.children].filter(o => o.selected == true)[0];

  // @ts-ignore
  const order = [...orderDropdown.children].filter(o => o.selected == true)[0].value;
  const casing = casingDropdown.value;
  const prepend = prependInput.value;
  const append = appendInput.value;

  const inputUrl = selectedInputDropdownOption.dataset.url;
  const inputType = selectedInputDropdownOption.dataset.type;
  const nodeCount = selectedNodeDropdownOption.dataset.nodeCount;

  console.log(`Selected ${selectedInputDropdownOption.id}, casing ${casing}, order ${order}, count ${nodeCount}`);

  const config = {
    type: 'confirm',
    items: [],
    groupingKey: selectedNodeDropdownOption.value,
    casing,
    prepend,
    append,
  };

  if (inputUrl.length > 0) {
    console.log('Fetching:', inputUrl);
    fetchLists(inputUrl, (response, error) => {
      let items = itemsFromStr(response);
      items = ordered(items, order);
      parent.postMessage({ pluginMessage: { ...config, items } }, '*');
    });
  } else if (inputType === 'numbers') {
    let items = [];
    for (let i = 0; i < nodeCount; i++) {
      items.push(`${randomNumberString(minNumberInput.value, maxNumberInput.value, precisionNumberInput.value)}`);
    }
    items = ordered(items, order);
    parent.postMessage({ pluginMessage: { ...config, items } }, '*');
  } else if (inputType === 'dates') {
    let items = [];
    const minDate = new Date(minDateInput.value).getTime();
    const maxDate = new Date(maxDateInput.value).getTime();
    const format = formatDateInput.value;
    for (let i = 0; i < nodeCount; i++) {
      items.push(`${randomDateString(minDate, maxDate, format)}`);
    }
    // TODO: Order dates _before_ stringifying.
    items = ordered(items, order);
    parent.postMessage({ pluginMessage: { ...config, items } }, '*');
  }
};

cancelButton.onclick = () => {
  parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*');
};

settingsButton.onclick = () => {
  settingsOverlay.hidden = false;
};

settingsBackButton.onclick = () => {
  settingsOverlay.hidden = true;
};

const fetchLists = (url: string, onResponse) => {
  let request = new XMLHttpRequest();
  try {
    request.open('GET', url);
    request.responseType = 'text';
    request.onload = () => onResponse(request.response);
    request.onerror = (error) => onResponse(null, error);
    request.send();
  } catch (error) {
    onResponse(null, error)
  }
}

const itemsFromStr = (str) => {
  return str.split('\n').filter(line => line.length > 0);
}

const inputOptions = () => {
  let o = [];
  for (let i = 0; i < inputDropdown.children.length; i++) {
    const section = inputDropdown.children[i];
    for (let i = 0; i < section.children.length; i++) {
      const option = section.children[i];
      o.push(option);
    }
  }
  return o;
}

const clearInputOptionSections = () => {
  while (inputDropdown.firstChild) {
    inputDropdown.removeChild(inputDropdown.firstChild);
  }
}

const clearNodeGroupElements = () => {
  while (nodesDropdown.firstChild) {
    nodesDropdown.removeChild(nodesDropdown.firstChild);
  }
}

const clearSettingsUrlElements = () => {
  while (settingsUrlsList.firstChild) {
    settingsUrlsList.removeChild(settingsUrlsList.firstChild);
  }
}

const randomNumberString = (min, max, precision) => {
  min = parseFloat(min);
  max = parseFloat(max);
  precision = parseFloat(precision);
  const randNum = min + Math.random() * (max - min);
  return randNum.toFixed(precision);
}

const randomDateString = (min, max, format) => {
  const randDate = new Date(min + Math.random() * (max - min));
  return format
    .replace('DD', randDate.getDate())
    .replace('dddd', randDate.toLocaleString("default", { weekday: "long" }))
    .replace('ddd', randDate.toLocaleString("default", { weekday: "short" }))
    .replace('mmmm', randDate.toLocaleString("default", { month: "long" }))
    .replace('mmm', randDate.toLocaleString("default", { month: "short" }))
    .replace('MM', randDate.getMonth() + 1)
    .replace('YYYY', randDate.getFullYear());
}

const ordered = (items, rule) => {
  console.log(`Ordering ${items.length} items with ${rule} rule`);

  if (rule === 'random') {
    const unrandomized = [...items];
    const randomized = [];
    while (unrandomized.length > 0) {
      const item = unrandomized.splice(Math.floor(Math.random() * unrandomized.length), 1)[0];
      randomized.push(item);
    }
    return randomized;
  } else if (rule === 'ascending') {
    return items.sort((a, b) => a - b);
  } else if (rule === 'descending') {
    return items.sort((a, b) => b - a);
  } else {
    return items;
  }
}

const slugify = (text) => {
  return text.replace(' ', '-').toLowerCase();
}

parent.postMessage({ pluginMessage: { type: 'init' } }, '*');