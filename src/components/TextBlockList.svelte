<script lang="ts" type="module">
  import { Button } from "figma-plugin-ds-svelte";
  import { TextBlock } from "types";
  import { defaultTextBlockCustomString } from "../constants";
  import TextBlockButton from "./TextBlockButton.svelte";

  export let textBlocks: TextBlock[];
  export let selectedBlock: TextBlock | undefined;
  export let onSelectTextBlock: (textBlock: TextBlock) => void;
  export let onUpdateTextBlock: (textBlock: TextBlock) => void;
  export let onPressAddTextBlock: (
    textBlock: TextBlock,
    placement: "before" | "after",
    index: number
  ) => void;
  export let onPressDeleteTextBlock: (textBlock: TextBlock) => void;

  const _onSelectTextBlock = (textBlock: TextBlock) => {
    selectedBlock = textBlock;
    onSelectTextBlock(textBlock);
  };

  const _onPressAddTextBlock = (placement: "before" | "after", index: number) => {
    const textBlock = defaultTextBlockCustomString();
    onPressAddTextBlock(textBlock, placement, index);
  };

  const _onPressAppendTextBlock = () => {
    const textBlock = defaultTextBlockCustomString();
    onPressAddTextBlock(textBlock, "after", textBlocks.length - 1);
  };

  const _onPressDeleteTextBlock = (textBlock: TextBlock) => {
    if (textBlocks.length === 1) {
      textBlock = {
        ...defaultTextBlockCustomString(),
        id: textBlock.id,
      };
      onUpdateTextBlock(textBlock);
    } else {
      onPressDeleteTextBlock(textBlock);
    }
  };
</script>

<div class="flex flex-row py-2 overflow-x-scroll overflow-y-hidden">
  {#each textBlocks as textBlock, index}
    <div
      class={"flex items-center content-center h-8 opacity-0 \
      transition-all duration-200 ease-out \
      hover:px-2 hover:opacity-100 first:hover:pr-2 first:hover:pl-2 \
      group"}
      on:click={() => _onPressAddTextBlock("before", index)}
    >
      <div class="flex h-8 w-2 m-0 rounded-md bg-white outline outline-gray-200 group-hover:w-4" />
    </div>
    <TextBlockButton
      {textBlock}
      isSelected={selectedBlock?.id === textBlock.id}
      on:click={() => _onSelectTextBlock(textBlock)}
      on:dblclick={() => _onPressDeleteTextBlock(textBlock)}
    />
  {/each}
  <div class="px-2 group">
    <Button variant={"secondary"} on:click={_onPressAppendTextBlock}
      ><div class="transition-all duration-200 ease-out group-hover:px-1">+</div></Button
    >
  </div>
</div>

<style>
  ::-webkit-scrollbar {
    display: none;
  }
</style>
