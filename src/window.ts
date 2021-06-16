import { Casing, InputType, Sort } from "./enums";
import { CodeMessage, CodeMessageGetNodes, CodeMessageInit, InputResponse, InputResponseList, TextNodeGroup, WindowMessage, WindowMessageConfirm } from "./types";
import { sorted, randomNumberString, randomDateString, slugify, fetchFromUrl, linesFromStr } from "./utils";

const nodesDropdown = document.getElementById('nodes-dropdown') as HTMLInputElement;
const inputDropdown = document.getElementById('input-dropdown') as HTMLInputElement;

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

const sortDropdown = document.getElementById('sort-dropdown') as HTMLInputElement;
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
  const message = event.data.pluginMessage as CodeMessage;
  const { type } = message;

  if (type === 'init') {
    const { url, nodeGroups } = message as CodeMessageInit;
    let urls = ['https://raw.githubusercontent.com/naftalibeder/figma-mock-content/main/index.json'];
    if (url) urls.push(url);

    createSettingsUrlElements(urls);

    createNodeGroupElements(nodeGroups);
    confirmButton.disabled = nodeGroups.length === 0;

    fetchAndCreateInputElements(urls);

    inputDropdown.onchange = onInputDropdownChange;
    onInputDropdownChange();
  } else if (type === 'nodes') {
    const { nodeGroups } = message as CodeMessageGetNodes;

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

const fetchAndCreateInputElements = async (urls: string[]) => {
  console.log(`Fetching from all urls: [${urls}]`);

  settingsErrorLabel.hidden = true;

  clearInputOptionSections();
  createLoadingInputElement();

  let responses: InputResponse[] = [];

  try {
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const response = await fetchInputs(url, i);
      responses.push(response);
    }
  } catch (error) {
    settingsErrorLabel.hidden = false;
  }

  clearInputOptionSections();

  for (let i = 0; i < responses.length; i++) {
    const response = responses[i];
    createInputElements(response);
  }
}

const fetchInputs = async (url: string, index: number): Promise<InputResponse> => {
  const baseUrl = url.replace('/index.json', '');

  if (!url || url.length === 0) {
    return Promise.resolve({ baseUrl });
  }

  console.log(`Fetching from ${url} at index ${index}`);

  try {
    const response = await fetchFromUrl(url);
    const responseObj = JSON.parse(response.response);
    const { name, lists } = responseObj;
    console.log(`Fetched ${lists.length} lists from ${url}`);
    if (response.error) throw response.error;
    return Promise.resolve({ baseUrl, ...responseObj });
  } catch (error) {
    console.log(`Error: ${error}`);
    return Promise.reject({ baseUrl, error });
  }
}

const createLoadingInputElement = () => {
  const inputOption = document.createElement('option');
  inputOption.innerHTML = 'Loading...';
  inputDropdown.appendChild(inputOption);
}

const createInputElements = (response: InputResponse) => {
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

  lists.forEach((list: InputResponseList, index: number) => {
    const { name, path, url, type } = list;

    const inputOption = document.createElement('option');
    inputOption.id = slugify(name);
    inputOption.innerHTML = name;
    inputOption.dataset.url = path ? `${baseUrl}/${path}` : url ? url : '';
    inputOption.dataset.type = type ?? InputType.Strings;
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

  let type = InputType.Strings;

  if (event) {
    type = event.target['options'][event.target['selectedIndex']].dataset.type as InputType;
  }

  console.log(`Changed input: ${type}`);

  if (type === InputType.Strings) {
    optionsSectionStrings.hidden = false;
  } else if (type === InputType.Numbers) {
    optionsSectionNumbers.hidden = false;
  } else if (type === InputType.Dates) {
    optionsSectionDates.hidden = false;
  }
}

confirmButton.onclick = async () => {
  const selectedInputDropdownOption = inputOptions().filter(o => o.selected == true)[0];
  // @ts-ignore
  const selectedNodeDropdownOption = [...nodesDropdown.children].filter(o => o.selected == true)[0];

  // @ts-ignore
  const sort = [...sortDropdown.children].filter(o => o.selected == true)[0].value as Sort;

  const casing = casingDropdown.value as Casing;
  const prepend = prependInput.value;
  const append = appendInput.value;

  const inputUrl = selectedInputDropdownOption.dataset.url;
  const inputType = selectedInputDropdownOption.dataset.type as InputType;
  const nodeCount: number = selectedNodeDropdownOption.dataset.nodeCount;

  console.log(`Selected ${selectedInputDropdownOption.id}, type: ${inputType}, casing ${casing}, sort ${sort}, count ${nodeCount}`);

  const message: WindowMessageConfirm = {
    type: 'confirm',
    items: [],
    groupingKey: selectedNodeDropdownOption.value,
    casing,
    prepend,
    append,
  };
  let items: string[] = [];

  if (inputType === InputType.Strings && inputUrl.length > 0) {
    console.log('Fetching:', inputUrl);
    const response = await fetchFromUrl(inputUrl);
    items = linesFromStr(response.response);
    items = sorted(items, sort);
  } else if (inputType === InputType.Numbers) {
    for (let i = 0; i < nodeCount; i++) {
      items.push(`${randomNumberString(parseFloat(minNumberInput.value), parseFloat(maxNumberInput.value), parseFloat(precisionNumberInput.value))}`);
    }
    items = sorted(items, sort);
  } else if (inputType === InputType.Dates) {
    const minDate = new Date(minDateInput.value).getTime();
    const maxDate = new Date(maxDateInput.value).getTime();
    const format = formatDateInput.value;
    for (let i = 0; i < nodeCount; i++) {
      items.push(`${randomDateString(minDate, maxDate, format)}`);
    }
    // TODO: Order dates _before_ stringifying.
    items = sorted(items, sort);
  }

  if (items.length > 0) {
    message.items = items;
    sendMessage(message);

    confirmButton.disabled = true;
  }
};

const sendMessage = (message: WindowMessage) => {
  parent.postMessage({ pluginMessage: message }, '*');
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

parent.postMessage({ pluginMessage: { type: 'init' } }, '*');