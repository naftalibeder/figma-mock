import {
  Casing,
  ListGroup,
  List,
  Sort,
  TextBlock,
  TextNodeGroup,
  TextNodeGroupKind,
  TextNodeInfo,
} from "types";

export const randomNumberString = (min: number, max: number, precision: number): string => {
  const randNum = min + Math.random() * (max - min);
  return randNum.toFixed(precision);
};

export const randomDateString = (min: Date, max: Date, format: string): string => {
  const minUnix = min.getTime();
  const maxUnix = max.getTime();
  const randDate = new Date(minUnix + Math.random() * (maxUnix - minUnix));
  return format
    .replace("DD", `${randDate.getDate()}`)
    .replace("dddd", randDate.toLocaleString("default", { weekday: "long" }))
    .replace("ddd", randDate.toLocaleString("default", { weekday: "short" }))
    .replace("mmmm", randDate.toLocaleString("default", { month: "long" }))
    .replace("mmm", randDate.toLocaleString("default", { month: "short" }))
    .replace("MM", `${randDate.getMonth() + 1}`)
    .replace("YYYY", `${randDate.getFullYear()}`);
};

export const sorted = (items: string[], sort: Sort): string[] => {
  console.log(`Sorting ${items.length} items with ${sort} sort`);

  if (sort === "random") {
    const maxOptimizedLength = 100;
    const unrandomized = [];
    for (let i = 0; i < items.length; i += Math.ceil(items.length / maxOptimizedLength)) {
      const item = items[i];
      if (item) {
        unrandomized.push(item);
      }
    }
    const randomized = [];
    while (unrandomized.length > 0) {
      const item = unrandomized.splice(Math.floor(Math.random() * unrandomized.length), 1)[0];
      randomized.push(item);
    }
    return randomized;
  } else if (sort === "ascending") {
    return items.sort((a: string, b: string) => (a > b ? 1 : -1));
  } else if (sort === "descending") {
    return items.sort((a: string, b: string) => (a < b ? 1 : -1));
  } else {
    return items;
  }
};

export const cased = (text: string, casing: Casing) => {
  if (casing === "sentence") {
    return sentenceCase(text);
  } else if (casing === "title") {
    return titleCase(text);
  } else if (casing === "upper") {
    return text.toUpperCase();
  } else if (casing === "lower") {
    return text.toLowerCase();
  } else {
    return text;
  }
};

const sentenceCase = (text: string) => {
  return text.slice(0, 1).toUpperCase() + text.slice(1).toLowerCase();
};

const titleCase = (text: string) => {
  return text
    .split(" ")
    .map((word) => sentenceCase(word))
    .join(" ");
};

export const slugify = (text: string): string => {
  return text.replaceAll(" ", "-").toLowerCase();
};

interface FetchResponse {
  response?: string;
  error?: any;
}

const fetchFromUrl = async (url: string): Promise<FetchResponse> => {
  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();
    try {
      request.open("GET", url);
      request.responseType = "text";
      request.onload = () => resolve({ response: request.response });
      request.onerror = (error) => reject({ error });
      request.send();
    } catch (error) {
      return reject({ error });
    }
  });
};

export const fetchListGroups = async (indexUrls: string[]): Promise<ListGroup[]> => {
  console.log(`Fetching list groups from index urls: [${indexUrls}]`);

  let groups: ListGroup[] = [];

  for (let i = 0; i < indexUrls.length; i++) {
    const indexUrl = indexUrls[i];
    try {
      const group = await fetchListGroup(indexUrl, i);
      if (group) {
        groups.push(group);
      }
    } catch (error) {}
  }

  return groups;
};

const fetchListGroup = async (indexUrl: string, index: number): Promise<ListGroup | undefined> => {
  if (!indexUrl || indexUrl.length === 0) {
    return undefined;
  }

  try {
    const response = await fetchFromUrl(indexUrl);
    if (response.error) {
      throw response.error;
    }

    const listGroup: ListGroup = JSON.parse(response.response);
    listGroup.indexUrl = indexUrl;
    listGroup.editable = true;

    const rootUrl = indexUrl.replace("/index.json", "");
    const lists: List[] = listGroup.lists.map((list) => {
      return {
        ...list,
        id: `${slugify(listGroup.name)}-${slugify(list.name)}`,
        type: list.type ?? "TextBlockString",
        url: list.url ?? `${rootUrl}/${list.path}`,
      };
    });

    console.log(`Fetched ${lists.length} lists from ${indexUrl}`);
    return { ...listGroup, lists };
  } catch (error) {
    console.log(`Error: ${error}`);
    return undefined;
  }
};

export const fetchListContent = async (url: string): Promise<string[]> => {
  try {
    const response = await fetchFromUrl(url);
    if (response.error) {
      throw response.error;
    }

    return response.response
      .split("\n")
      .filter((line) => line.length > 0)
      .map((o) => o.trim());
  } catch (error) {
    return [];
  }
};

export const listById = (id: string, listGroups: ListGroup[]): List | undefined => {
  for (const listGroup of listGroups) {
    for (const list of listGroup.lists) {
      if (list.id === id) {
        return list;
      }
    }
  }

  return undefined;
};

export const buildTextNodeGroups = (
  nodes: TextNodeInfo[],
  groupKind: TextNodeGroupKind
): TextNodeGroup[] => {
  const groupsMap: { [key: string]: TextNodeGroup } = {};

  nodes.forEach((node) => {
    let groupKey = "";
    switch (groupKind) {
      case "NAME":
        groupKey = `${node.name}`;
        break;
      case "TEXT":
        groupKey = `${node.characters}`;
        break;
      case "LOCAL_XY":
        groupKey = `${node.x}-${node.y}`;
        break;
      case "LOCAL_X":
        groupKey = `${node.x}`;
        break;
      case "LOCAL_Y":
        groupKey = `${node.y}`;
        break;
      case "SIZE":
        groupKey = `${node.width}-${node.height}`;
        break;
    }

    if (!groupsMap[groupKey]) {
      groupsMap[groupKey] = new TextNodeGroup(groupKey);
    }

    const existingGroup = groupsMap[groupKey];
    existingGroup.nodesMap[node.id] = { ...node };
    existingGroup.count += 1;
  });

  const nodeGroups = Object.keys(groupsMap)
    .map((key) => groupsMap[key])
    .sort((a, b) => b.count - a.count);
  return nodeGroups;
};

export const textBlockIsValid = (textBlock: TextBlock) => {
  switch (textBlock.type) {
    case "TextBlockCustomString":
      return textBlock.customText?.length > 0;
    case "TextBlockNumber":
      return !isNaN(textBlock.min) && !isNaN(textBlock.max) && !isNaN(textBlock.decimals);
    case "TextBlockString":
      return textBlock.listId.length > 0;
  }
};

export const buildStringFromTextBlocks = async (
  textBlocks: TextBlock[],
  listGroups: ListGroup[]
) => {
  let text = "";

  for (const textBlock of textBlocks) {
    switch (textBlock.type) {
      case "TextBlockCustomString":
        text += textBlock.customText;
        break;
        break;
      case "TextBlockNumber":
        text += randomNumberString(textBlock.min, textBlock.max, textBlock.decimals);
        break;
      case "TextBlockString":
        const list = listById(textBlock.listId, listGroups);
        const lines = await fetchListContent(list.url);
        const randLine = lines[Math.floor(Math.random() * lines.length)];
        text += cased(randLine, textBlock.casing);
        break;
    }
  }

  return text;
};
