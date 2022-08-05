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

<div class="scroll-box">
  {#each textBlocks as textBlock, index}
    <div
      class={"insert-button-wrap" + (index === 0 ? "" : "")}
      on:click={() => _onPressAddTextBlock("before", index)}
    >
      <div class="insert-button-box" />
    </div>
    <TextBlockButton
      {textBlock}
      isSelected={selectedBlock?.id === textBlock.id}
      on:click={() => _onSelectTextBlock(textBlock)}
      on:dblclick={() => _onPressDeleteTextBlock(textBlock)}
    />
  {/each}
  <div class="add-button">
    <Button variant={"secondary"} on:click={_onPressAppendTextBlock}>+</Button>
  </div>
</div>

<style>
  .scroll-box {
    display: flex;
    flex: 1;
    flex-direction: row;
    align-items: center;
    overflow-x: scroll;
    padding: 8px 0px;
    height: 100%;
    font-size: smaller;
  }
  .insert-button-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    height: var(--size-medium); /* Button height. */
    padding: 0px 0px;
    transition: all 0.2s ease-out;
  }
  .insert-button-wrap:hover {
    padding: 0px 8px;
  }
  .insert-button-wrap.first:hover {
    padding: 0px 8px 0px 16px;
  }
  .insert-button-box {
    display: flex;
    height: var(--size-medium); /* Button height. */
    width: 8px;
    margin: 0px;
    border-radius: var(--border-radius-large);
    background-color: white;
    border: 1px solid lightgray;
    opacity: 0;
    transition: all 0.2s ease-out;
  }
  .insert-button-wrap:hover .insert-button-box {
    width: 24px;
    opacity: 1;
  }
  .add-button {
    padding: 0px 8px;
    font-size: smaller;
  }
  .scroll-box::-webkit-scrollbar {
    display: none;
  }
</style>
