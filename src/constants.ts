import { ListGroupList, TextBlockCustomString } from "./types";

export const jsonExampleText = `{
  "name": "Coffee",
  "lists": [
    {
      "name": "Bean Types",
      "url": "https://public.coffee/bean-types.txt"
    },
    {
      "name": "Roasts",
      "path": "roasts.txt"
    }
  ]
}`;

export const defaultListOptions: ListGroupList[] = [
  {
    id: "custom-text",
    name: "Custom Text",
    type: "TextBlockCustomString",
  },
  {
    id: "numbers",
    name: "Numbers",
    type: "TextBlockNumber",
  },
  {
    id: "dates",
    name: "Dates",
    type: "TextBlockDate",
  },
];

export const defaultTextBlockCustomString = (): TextBlockCustomString => {
  const list = defaultListOptions[0];
  return {
    type: "TextBlockCustomString",
    id: `${Math.floor(Math.random() * 1000)}`,
    title: list.name,
    listId: list.id,
    sort: "original",
    confirmed: false,
    customText: "My Text",
  };
};
