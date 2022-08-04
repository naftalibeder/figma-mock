<script lang="ts" type="module">
  import { Button } from "figma-plugin-ds-svelte";
  import { TextBlock } from "types";
  import { defaultTextBlockCustomString } from "../constants";
  import TextBlockButton from "./TextBlockButton.svelte";

  export let textBlocks: TextBlock[];
  export let selectedBlock: TextBlock | undefined;
  export let onSelectTextBlock: (textBlock: TextBlock) => void;
  export let onPressAddTextBlock: (textBlock: TextBlock) => void;

  const _onSelectTextBlock = (textBlock: TextBlock) => {
    selectedBlock = textBlock;
    onSelectTextBlock(textBlock);
  };

  const _onPressAddTextBlock = () => {
    const textBlock = defaultTextBlockCustomString();
    onPressAddTextBlock(textBlock);
  };
</script>

<div class="scroll-box">
  {#each textBlocks as textBlock}
    <TextBlockButton
      {textBlock}
      isSelected={selectedBlock?.id === textBlock.id}
      on:click={() => _onSelectTextBlock(textBlock)}
      on:delete={() => console.log("TODO", textBlock.id)}
    />
  {/each}
  <div class="scroll-box-add-button">
    <Button variant={"secondary"} on:click={_onPressAddTextBlock}>+</Button>
  </div>
</div>

<style>
  .scroll-box {
    display: flex;
    flex-direction: row;
    align-items: center;
    overflow-x: scroll;
    gap: 8px;
    padding: 8px;
    height: 100%;
    font-size: smaller;
  }
  .scroll-box-add-button {
    font-size: smaller;
  }
  .scroll-box::-webkit-scrollbar {
    display: none;
  }
</style>
