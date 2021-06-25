import { Casing, Sort } from "./enums";

export const randomNumberString = (min: number, max: number, precision: number): string => {
  min = min;
  max = max;
  precision = precision;
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

  if (sort === Sort.Random) {
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
  } else if (sort === Sort.Ascending) {
    return items.sort((a: string, b: string) => a > b ? 1 : -1);
  } else if (sort === Sort.Descending) {
    return items.sort((a: string, b: string) => a < b ? 1 : -1);
  } else {
    return items;
  }
};

export const cased = (text: string, casing: Casing) => {
  if (casing === Casing.Sentence) {
    return sentenceCase(text);
  } else if (casing === Casing.Title) {
    return titleCase(text);
  } else if (casing === Casing.Upper) {
    return text.toUpperCase();
  } else if (casing === Casing.Lower) {
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

export const linesFromStr = (str: string): string[] => {
  return str
    .split("\n")
    .filter((line) => line.length > 0)
    .map((o) => o.trim());
};

interface FetchResponse {
  response?: string;
  error?: any;
}

export const fetchFromUrl = async (url: string): Promise<FetchResponse> => {
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
