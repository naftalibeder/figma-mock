import { Casing, ListType, Sort } from "./enums";
import { CodeMessage, InputConfig, InputConfigNumber, ListResponse, ListResponseList, InputConfigString, TextNodeGroup, WindowMessage, WindowMessageConfirm, InputConfigBase, WindowMessageInit, WindowMessageCancel } from "./types";
import { sorted, randomNumberString, randomDateString, slugify, fetchFromUrl, linesFromStr, cased } from "./utils";

const nodesDropdown = document.getElementById('nodes-dropdown') as HTMLInputElement;

const tagsHolder = document.getElementById('input-tags-list');
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

const exampleOutputLabel = document.getElementById('example-output-label');

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
let nodeGroupsAreEmpty = true;

onmessage = (event: MessageEvent<any>) => {
  const message = event.data.pluginMessage as CodeMessage;

  console.log('Message:', message);

  if (message.type === "INIT") {
    const { url, nodeGroups } = message;

    let urls = ['https://raw.githubusercontent.com/naftalibeder/figma-mock-content/main/index.json'];
    if (url) urls.push(url);

    createSettingsUrlElements(urls);

    nodeGroupsAreEmpty = nodeGroups.length === 0;
    updateConfirmButtonEnabled();
    createNodeGroupElements(nodeGroups);

    refreshInputTagElements();

    fetchAndCreateListElements(urls);

    listDropdown.onchange = onListDropdownChange;
    onListDropdownChange();

    [casingDropdown, minNumberInput, maxNumberInput, precisionNumberInput, sortDropdown].forEach(o => {
      o.oninput = saveListPreferences;
    });

    refreshExampleOutputLabel();
  } else if (message.type === 'NODES') {
    const { nodeGroups } = message;

    nodeGroupsAreEmpty = nodeGroups.length === 0;
    updateConfirmButtonEnabled();
    createNodeGroupElements(nodeGroups);
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
};

const onInputTagFocus = (id: string) => {
  inputConfigActiveIndex = inputConfigs.findIndex(o => o.id === id);
  updateTagElementsSelectedAppearance();
  populateListPreferencesElement();
};

const addInputConfig = (beforeInputConfigId?: string) => {
  const inputConfig: InputConfigString = {
    type: "InputConfigString",
    id: `input-tag-${Math.floor(Math.random() * 10000).toFixed(0)}`,
    title: '',
    listId: '',
    url: '',
    casing: Casing.Original,
    sort: Sort.Random,
    confirmed: false,
  };
  const configIndex = beforeInputConfigId
    ? inputConfigs.findIndex(o => o.id === beforeInputConfigId)
    : inputConfigs.length;
  inputConfigs.splice(configIndex, 0, inputConfig);

  inputConfigActiveIndex = configIndex;

  refreshInputTagElements();
};

const refreshInputTagElements = () => {
  while (tagsHolder.firstChild) {
    tagsHolder.removeChild(tagsHolder.firstChild);
  }

  inputConfigs.forEach(config => {
    const spacer = document.createElement('button');
    spacer.dataset.kind = 'spacer';
    spacer.className = 'tag spacer';
    spacer.onfocus = () => addInputConfig(config.id);
    tagsHolder.appendChild(spacer);

    const tag = document.createElement('button');
    tag.dataset.kind = 'tag';
    tag.className = 'tag';
    tag.innerHTML = config.title;
    tag.id = config.id;
    tag.onfocus = () => onInputTagFocus(tag.id);
    tagsHolder.appendChild(tag);

    if (tag.id === getActiveInputConfig()?.id) {
      tag.focus();
    }
  });

  const addButton = document.createElement('button');
  addButton.dataset.kind = 'spacer';
  addButton.className = 'tag spacer plus';
  addButton.innerHTML = '+';
  addButton.onfocus = () => addInputConfig();
  tagsHolder.appendChild(addButton);

  updateTagElementsSelectedAppearance();
};

const updateTagElementsSelectedAppearance = () => {
  tagsHolder.childNodes.forEach((tag: HTMLElement, index: number) => {
    if (tag.dataset?.kind === 'tag') {
      const tagIsActive = tag.id === getActiveInputConfig().id;
      tag.className = tagIsActive ? "tag selected" : "tag";
    }
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
    const config = activeInputConfig as InputConfigString;
    casingDropdown.value = config.casing ?? Casing.Original;
    sortDropdown.value = config.sort ?? Sort.Random;
  } else if (selectedOptionType === ListType.Numbers) {
    const config = activeInputConfig as InputConfigNumber;
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
  return [...tagsHolder.childNodes].filter(o => o.id === getActiveInputConfig().id)[0];
};

const saveListDropdownOption = () => {
  const selectedOption = getSelectedListDropdownOption();
  const selectedOptionType = getSelectedListDropdownOptionType();

  if (!selectedOption) return;

  const configPrev = inputConfigs[inputConfigActiveIndex];

  if (selectedOptionType === ListType.Strings) {
    const config: InputConfigString = {
      type: "InputConfigString",
      id: configPrev.id,
      title: selectedOption.innerHTML,
      listId: selectedOption.id,
      sort: configPrev.sort,
      url: selectedOption.dataset.url,
      casing: configPrev.type === 'InputConfigString' ? configPrev.casing : Casing.Original,
      confirmed: true,
    }
    inputConfigs[inputConfigActiveIndex] = config;
  } else if (selectedOptionType === ListType.Numbers) {
    const config: InputConfigNumber = {
      type: "InputConfigNumber",
      id: configPrev.id,
      title: selectedOption.innerHTML,
      listId: selectedOption.id,
      sort: configPrev.sort,
      min: configPrev.type === 'InputConfigNumber' ? configPrev.min : 0,
      max: configPrev.type === 'InputConfigNumber' ? configPrev.max : 100,
      decimals: configPrev.type === 'InputConfigNumber' ? configPrev.decimals : 0,
      confirmed: true,
    }
    inputConfigs[inputConfigActiveIndex] = config;
  } else if (selectedOptionType === ListType.Dates) {
    // TODO
  }

  const focusedInputTag = getFocusedInputTag();
  focusedInputTag.innerHTML = selectedOption.innerHTML;

  refreshExampleOutputLabel();
};

const saveListPreferences = () => {
  const selectedOption = getSelectedListDropdownOption();
  const selectedOptionType = getSelectedListDropdownOptionType();

  if (!selectedOption) return;

  // @ts-ignore
  const sort = [...sortDropdown.children].filter(o => o.selected == true)[0].value as Sort;

  const inputConfigBase: InputConfigBase = {
    id: inputConfigs[inputConfigActiveIndex].id,
    title: selectedOption.innerHTML,
    listId: selectedOption.id,
    sort: Sort.Random,
    confirmed: true,
  };

  let inputConfig: InputConfig;

  if (selectedOptionType === ListType.Strings) {
    const casing = casingDropdown.value as Casing;
    const newConfig: InputConfigString = {
      type: 'InputConfigString',
      ...inputConfigBase,
      url: selectedOption.dataset.url,
      casing,
      sort,
    };
    inputConfig = newConfig;
  } else if (selectedOptionType === ListType.Numbers) {
    const newConfig: InputConfigNumber = {
      type: 'InputConfigNumber',
      ...inputConfigBase,
      min: parseFloat(minNumberInput.value),
      max: parseFloat(maxNumberInput.value),
      decimals: parseFloat(precisionNumberInput.value),
      sort,
    };
    inputConfig = newConfig;
  } else if (selectedOptionType === ListType.Dates) {
    // TODO
  }

  inputConfigs[inputConfigActiveIndex] = inputConfig;

  refreshExampleOutputLabel();
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
    const responseObj = JSON.parse(response.response) as ListResponse;
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

  updateConfirmButtonEnabled();
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

const refreshExampleOutputLabel = async () => {
  const itemsSequence = await getItemsSequence(inputConfigs);
  const text = itemsSequence.map(o => o[0]).join('');
  console.log('items:', itemsSequence.length);
  exampleOutputLabel.innerHTML = text.length > 0 ? text : 'No selection';
  exampleOutputLabel.className = text.length > 0 ? 'gray-box' : 'gray-box disabled'
};

const getItemsSequence = async (inputConfigs: InputConfig[]): Promise<string[][]> => {
  console.log('Getting items sequence:', inputConfigs);

  let itemsSequence: string[][] = [];
  for (let i = 0; i < inputConfigs.length; i++) {
    const inputConfig = inputConfigs[i];
    const items = await getItems(inputConfig);
    itemsSequence.push(items);
  }
  return itemsSequence;
};

const getItems = async (inputConfig: InputConfig): Promise<string[]> => {
  const selectedNodeDropdownOption = getSelectedNodeDropdownOption();
  const nodeCountOr1: number = parseInt(selectedNodeDropdownOption.dataset.nodeCount ?? '1');

  const sort = inputConfig.sort;

  let items: string[] = [];

  if (inputConfig.type === 'InputConfigString' && inputConfig.url.length > 0) {
    const casing = inputConfig.casing;
    const response = await fetchFromUrl(inputConfig.url);
    items = linesFromStr(response.response);
    items = sorted(items, sort);
    items = items.map(o => cased(o, casing));
  } else if (inputConfig.type === 'InputConfigNumber') {
    for (let i = 0; i < nodeCountOr1; i++) {
      const rand = randomNumberString(
        parseFloat(minNumberInput.value),
        parseFloat(maxNumberInput.value),
        parseFloat(precisionNumberInput.value),
      );
      items.push(rand);
    }
    items = sorted(items, sort);
  } else if (inputConfig.type === 'InputConfigDate') {
    const minDate = new Date(minDateInput.value).getTime();
    const maxDate = new Date(maxDateInput.value).getTime();
    const format = formatDateInput.value;
    for (let i = 0; i < nodeCountOr1; i++) {
      items.push(`${randomDateString(minDate, maxDate, format)}`);
    }
    // TODO: Order dates _before_ stringifying.
    items = sorted(items, sort);
  }

  return items;
};

const updateConfirmButtonEnabled = () => {
  const configsConfirmedStatuses = inputConfigs.map(o => o.confirmed);
  confirmButton.disabled =
    nodeGroupsAreEmpty
    || inputConfigs.length === 0
    || new Set(configsConfirmedStatuses).has(false);
};

confirmButton.onclick = async () => {
  const itemsSequence = await getItemsSequence(inputConfigs);

  const message: WindowMessageConfirm = {
    type: "CONFIRM",
    itemsSequence,
    groupingKey: getSelectedNodeDropdownOption().value,
  };

  sendMessage(message);
  confirmButton.disabled = true;
};

const sendMessage = (message: WindowMessage) => {
  parent.postMessage({ pluginMessage: message }, '*');
};

cancelButton.onclick = () => {
  const message: WindowMessageCancel = { type: "CANCEL" };
  sendMessage(message);
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

const message: WindowMessageInit = { type: 'INIT' };
parent.postMessage({ pluginMessage: message }, '*');