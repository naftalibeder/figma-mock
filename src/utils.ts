import { Casing, ListGroup, ListGroupList, Sort, TextBlock } from "types";
import { defaultListOptions } from "./constants";

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

export const fetchListGroups = async (urls: string[]): Promise<ListGroup[]> => {
  console.log(`Fetching list groups from urls: [${urls}]`);

  let groups: ListGroup[] = [];

  const defaultResponse: ListGroup = {
    baseUrl: "",
    name: "Customizable",
    lists: defaultListOptions,
  };
  groups.push(defaultResponse);

  try {
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const group = await fetchListGroup(url, i);
      groups.push(group);
    }
  } catch (error) { }

  return groups;
};

const fetchListGroup = async (url: string, index: number): Promise<ListGroup> => {
  const baseUrl = url.replace("/index.json", "");

  if (!url || url.length === 0) {
    return { baseUrl };
  }

  try {
    const response = await fetchFromUrl(url);
    if (response.error) {
      throw response.error;
    }

    const listGroup = JSON.parse(response.response) as ListGroup;
    listGroup.baseUrl = url.replace("/index.json", "/");
    const lists: ListGroupList[] = listGroup.lists.map((list) => {
      return {
        ...list,
        id: `${slugify(listGroup.name)}-${slugify(list.name)}`,
        type: list.type ?? "TextBlockString",
        url: list.url ?? `${listGroup.baseUrl}${list.path}`,
      };
    });

    console.log(`Fetched ${lists.length} lists from ${url}`);
    return { ...listGroup, baseUrl, lists };
  } catch (error) {
    console.log(`Error: ${error}`);
    return { baseUrl, error };
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

export const listById = (id: string, listGroups: ListGroup[]): ListGroupList | undefined => {
  for (const listGroup of listGroups) {
    for (const list of listGroup.lists) {
      if (list.id === id) {
        return list;
      }
    }
  }

  return undefined;
};

export const getStringFromTextBlocks = async (textBlocks: TextBlock[], listGroups: ListGroup[]) => {
  let text = "";

  for (const textBlock of textBlocks) {
    switch (textBlock.type) {
      case "TextBlockCustomString":
        text += textBlock.customText;
        break;
      case "TextBlockDate":
        text += textBlock.earliest + "-" + textBlock.latest;
        break;
      case "TextBlockNumber":
        text += textBlock.min + "-" + textBlock.max;
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
