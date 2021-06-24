import { ListResponseList } from "./types";
import { ListType } from "./enums";

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

export const generatedLists: ListResponseList[] = [
  {
    name: "Numbers",
    type: ListType.Numbers
  },
  {
    name: "Dates",
    type: ListType.Dates
  },
  {
    name: "Custom Text",
    type: ListType.CustomString
  },
];