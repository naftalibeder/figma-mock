import { Casing, ListType, Sort } from "./enums";
import { CodeMessage, CodeMessageGetNodes, CodeMessageInit, InputConfig, InputNumberConfig, ListResponse, ListResponseList, InputStringConfig, TextNodeGroup, WindowMessage, WindowMessageConfirm } from "./types";
import { sorted, randomNumberString, randomDateString, slugify, fetchFromUrl, linesFromStr } from "./utils";

const nodesDropdown = document.getElementById('nodes-dropdown') as HTMLInputElement;

const tagsHolder = document.getElementById('input-tags-list');
const addTagButton = document.getElementById('input-add-button');
const listPreferencesHolder = document.getElementById('input-config-holder');

const listDropdown = document.getElementById('input-lists-dropdown') as HTMLInputElement;

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

const settingsButton = document.getElementById('settings-button');
const settingsOverlay = document.getElementById('settings-overlay');
const settingsUrlsList = document.getElementById('settings-urls-list');
const settingsErrorLabel = document.getElementById('settings-error-label');
const settingsIndexCodeExample = document.getElementById('settings-index-code-example');
const settingsBackButton = document.getElementById('settings-back-button');

const confirmButton = document.getElementById('confirm-button') as HTMLInputElement;
const cancelButton = document.getElementById('cancel-button') as HTMLInputElement;

listPreferencesHolder.hidden = true;
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

let inputConfigs: InputConfig[] = [];
let inputConfigActiveIndex: number | null = null;

onmessage = (event: MessageEvent<any>) => {
  const message = event.data.pluginMessage as CodeMessage;
  const { type } = message;

  if (type === 'init') {
    const { url, nodeGroups } = message as CodeMessageInit;

    let urls = ['https://raw.githubusercontent.com/naftalibeder/figma-mock-content/main/index.json'];
    if (url) urls.push(url);

    createSettingsUrlElements(urls);

    createNodeGroupElements(nodeGroups);
    confirmButton.disabled = nodeGroups.length === 0;

    fetchAndCreateListElements(urls);

    listDropdown.onchange = onListDropdownChange;
    onListDropdownChange();

    [casingDropdown, minNumberInput, maxNumberInput, precisionNumberInput, sortDropdown].forEach(o => {
      o.oninput = saveListPreferences;
    });
  } else if (type === 'nodes') {
    const { nodeGroups } = message as CodeMessageGetNodes;

    createNodeGroupElements(nodeGroups);
    confirmButton.disabled = nodeGroups.length === 0;
  }
};

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

const onClickAddTagButton = () => {
  const newConfig: InputConfig = {
    id: `input-tag-${Math.floor(Math.random() * 10000).toFixed(0)}`,
    title: 'First Names',
    listId: 'first-names', // TODO: Set initial list item?
    confirmed: false,
  };
  inputConfigs.push(newConfig);

  const inputTag = document.createElement('button');
  inputTag.className = 'tag';
  inputTag.innerHTML = newConfig.title;
  inputTag.id = newConfig.id;
  inputTag.onfocus = () => onInputTagFocus(inputTag.id);
  tagsHolder.insertBefore(inputTag, tagsHolder.childNodes[tagsHolder.childNodes.length - 2])
  inputTag.focus();
};

addTagButton.onclick = onClickAddTagButton;

const onInputTagFocus = (id: string) => {
  inputConfigActiveIndex = inputConfigs.findIndex(o => o.id === id);
  updateTagElements();
  populateListPreferencesElement();

  console.log('-------');
  inputConfigs.forEach(o => console.log(JSON.stringify(o)));
}

const updateTagElements = () => {
  // @ts-ignore
  const editableTags = [...tagsHolder.childNodes].slice(0, tagsHolder.childNodes.length - 2);
  editableTags.forEach((tag: HTMLElement) => {
    tag.className = tag.id === getActiveInputConfig().id ? "tag selected" : "tag";
  });
};

const populateListPreferencesElement = () => {
  listPreferencesHolder.hidden = false;

  let value = '';
  listDropdownElements().forEach(o => {
    if (o.id === getActiveInputConfig().listId) value = o.value;
  });
  listDropdown.value = value;

  onListDropdownChange();

  const activeInputConfig = getActiveInputConfig();
  const selectedOptionType = getSelectedListDropdownOptionType();

  if (selectedOptionType === ListType.Strings) {
    const config = activeInputConfig as InputStringConfig;
    casingDropdown.value = config.casing ?? Casing.None;
    sortDropdown.value = config.sort ?? Sort.Random;
  } else if (selectedOptionType === ListType.Numbers) {
    const config = activeInputConfig as InputNumberConfig;
    minNumberInput.value = `${config.min ?? 0}`;
    maxNumberInput.value = `${config.max ?? 100}`;
    precisionNumberInput.value = `${config.decimals ?? 0}`;
    sortDropdown.value = `${config.sort}`;
  } else if (selectedOptionType === ListType.Dates) {
    // TODO
  }
};

const getActiveInputConfig = (): InputConfig | null => {
  if (inputConfigActiveIndex !== null) {
    return inputConfigs[inputConfigActiveIndex];
  }
  return null;
};

const getFocusedInputTag = (): HTMLElement => {
  // @ts-ignore
  const editableTags = [...tagsHolder.childNodes].slice(0, tagsHolder.childNodes.length - 2);
  return editableTags.filter(o => o.id === getActiveInputConfig().id)[0];
};

const saveListDropdownOption = () => {
  const selectedOption = getSelectedListDropdownOption();

  if (!selectedOption) return;

  let updatedConfig: InputConfig = {
    ...inputConfigs[inputConfigActiveIndex],
    title: selectedOption.innerHTML,
    listId: selectedOption.id,
  };
  inputConfigs[inputConfigActiveIndex] = updatedConfig;

  const focusedInputTag = getFocusedInputTag();
  focusedInputTag.innerHTML = selectedOption.innerHTML;
};

const saveListPreferences = () => {
  const selectedOption = getSelectedListDropdownOption();
  const selectedOptionType = getSelectedListDropdownOptionType();

  if (!selectedOption) return;

  // @ts-ignore
  const sort = [...sortDropdown.children].filter(o => o.selected == true)[0].value as Sort;

  let inputConfig: InputConfig = {
    id: inputConfigs[inputConfigActiveIndex].id,
    title: selectedOption.innerHTML,
    listId: selectedOption.id,
    confirmed: inputConfigs[inputConfigActiveIndex].confirmed,
  };

  if (selectedOptionType === ListType.Strings) {
    const casing = casingDropdown.value as Casing;
    const config: InputStringConfig = { ...inputConfig, casing, sort };
    inputConfig = config;
  } else if (selectedOptionType === ListType.Numbers) {
    const min = parseFloat(minNumberInput.value)
    const max = parseFloat(maxNumberInput.value);
    const decimals = parseFloat(precisionNumberInput.value);
    const config: InputNumberConfig = { ...inputConfig, min, max, decimals, sort };
    inputConfig = config;
  } else if (selectedOptionType === ListType.Dates) {
    // TODO
    // const config: InputNumberConfig = { ...inputConfig,  };
    // inputConfig = config;
  }

  inputConfigs[inputConfigActiveIndex] = inputConfig;

  console.log(`Saved ${JSON.stringify(inputConfig)} to index ${inputConfigActiveIndex}`);
};

const createSettingsUrlElements = (urls: string[]) => {
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
      fetchAndCreateListElements(urlsCopy);
    };
    if (index === 0) urlTextField.disabled = true;
    urlWrap.appendChild(urlTextField);
  });
}

const fetchAndCreateListElements = async (urls: string[]) => {
  console.log(`Fetching from all urls: [${urls}]`);

  settingsErrorLabel.hidden = true;

  clearListSectionElements();
  createListLoadingElement();

  let responses: ListResponse[] = [];

  try {
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const response = await fetchListData(url, i);
      responses.push(response);
    }
  } catch (error) {
    settingsErrorLabel.hidden = false;
  }

  clearListSectionElements();

  for (let i = 0; i < responses.length; i++) {
    const response = responses[i];
    createListElements(response);
  }
}

const fetchListData = async (url: string, index: number): Promise<ListResponse> => {
  const baseUrl = url.replace('/index.json', '');

  if (!url || url.length === 0) {
    return Promise.resolve({ baseUrl });
  }

  console.log(`Fetching from ${url} at index ${index}`);

  try {
    const response = await fetchFromUrl(url);
    const responseObj = JSON.parse(response.response);
    const { lists } = responseObj;
    console.log(`Fetched ${lists.length} lists from ${url}`);
    if (response.error) throw response.error;
    return Promise.resolve({ baseUrl, ...responseObj });
  } catch (error) {
    console.log(`Error: ${error}`);
    return Promise.reject({ baseUrl, error });
  }
}

const createListLoadingElement = () => {
  const inputOption = document.createElement('option');
  inputOption.innerHTML = 'Loading...';
  listDropdown.appendChild(inputOption);
}

const createListElements = (response: ListResponse) => {
  const { baseUrl, name: sectionName, lists, error } = response;

  if (error) {
    settingsErrorLabel.hidden = false;
    return;
  }

  if (!sectionName || !lists) return;

  console.log(`Creating input elements from ${sectionName} (${baseUrl})`);

  const inputOptionGroup = document.createElement('optgroup');
  inputOptionGroup.label = sectionName;
  listDropdown.appendChild(inputOptionGroup);

  lists.forEach((list: ListResponseList, index: number) => {
    const { name, path, url, type } = list;

    const id = slugify(name);

    const inputOption = document.createElement('option');
    inputOption.id = id;
    inputOption.value = id;
    inputOption.dataset.url = path ? `${baseUrl}/${path}` : url ? url : '';
    inputOption.dataset.type = type ?? ListType.Strings;
    inputOption.innerHTML = name;
    inputOptionGroup.appendChild(inputOption);
  });
}

const onListDropdownChange = () => {
  saveListDropdownOption();

  optionsSectionStrings.hidden = true;
  optionsSectionNumbers.hidden = true;
  optionsSectionDates.hidden = true;

  const selectedOptionType = getSelectedListDropdownOptionType();

  if (selectedOptionType === ListType.Strings) {
    optionsSectionStrings.hidden = false;
  } else if (selectedOptionType === ListType.Numbers) {
    optionsSectionNumbers.hidden = false;
  } else if (selectedOptionType === ListType.Dates) {
    optionsSectionDates.hidden = false;
  }
}

const getSelectedNodeDropdownOption = (): HTMLInputElement => {
  // @ts-ignore
  return [...nodesDropdown.children].filter(o => o.selected == true)[0];
};

const getSelectedListDropdownOption = (): HTMLInputElement => {
  return listDropdownElements().filter(o => o.selected == true)[0];
};

const getSelectedListDropdownOptionType = (): ListType | null => {
  const selectedOption = getSelectedListDropdownOption();
  if (!selectedOption) return null;
  return selectedOption.dataset.type as ListType;
};

confirmButton.onclick = async () => {
  const selectedNodeDropdownOption = getSelectedNodeDropdownOption();
  const selectedListDropdownOption = getSelectedListDropdownOption();

  // @ts-ignore
  const sort = [...sortDropdown.children].filter(o => o.selected == true)[0].value as Sort;

  const casing = casingDropdown.value as Casing;

  const inputUrl = selectedListDropdownOption.dataset.url;
  const inputType = selectedListDropdownOption.dataset.type as ListType;
  const nodeCount: number = parseInt(selectedNodeDropdownOption.dataset.nodeCount);

  console.log(`Selected ${selectedListDropdownOption.id}, type: ${inputType}, casing ${casing}, sort ${sort}, count ${nodeCount}`);

  const message: WindowMessageConfirm = {
    type: 'confirm',
    items: [],
    groupingKey: selectedNodeDropdownOption.value,
    casing,
  };
  let items: string[] = [];

  if (inputType === ListType.Strings && inputUrl.length > 0) {
    console.log('Fetching:', inputUrl);
    const response = await fetchFromUrl(inputUrl);
    items = linesFromStr(response.response);
    items = sorted(items, sort);
  } else if (inputType === ListType.Numbers) {
    for (let i = 0; i < nodeCount; i++) {
      items.push(`${randomNumberString(parseFloat(minNumberInput.value), parseFloat(maxNumberInput.value), parseFloat(precisionNumberInput.value))}`);
    }
    items = sorted(items, sort);
  } else if (inputType === ListType.Dates) {
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

const listDropdownElements = () => {
  let o = [];
  for (let i = 0; i < listDropdown.children.length; i++) {
    const section = listDropdown.children[i];
    for (let i = 0; i < section.children.length; i++) {
      const option = section.children[i];
      o.push(option);
    }
  }
  return o;
}

const clearListSectionElements = () => {
  while (listDropdown.firstChild) {
    listDropdown.removeChild(listDropdown.firstChild);
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