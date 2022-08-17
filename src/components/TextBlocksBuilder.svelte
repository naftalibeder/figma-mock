<script lang="ts" type="module">
  import { Section, Type } from "figma-plugin-ds-svelte";
  import { TextBlock } from "types";
  import { store } from "../store";
  import TextBlockList from "./TextBlockList.svelte";
  import TextBlockDetails from "./TextBlockDetails.svelte";

  let selectedBlock: TextBlock | undefined;

  $: {
    selectedBlock;
    $store.textBlocks;

    if (!selectedBlock) {
      selectedBlock = $store.textBlocks[0];
    }
  }

  const onSelectTextBlock = (textBlock: TextBlock) => {
    selectedBlock = textBlock;

    console.log("Selected text block:", selectedBlock);
  };

  const onPressAddTextBlock = (
    textBlock: TextBlock,
    placement: "before" | "after",
    index: number
  ) => {
    const blocks = [...$store.textBlocks];
    blocks.splice(placement === "before" ? index : index + 1, 0, textBlock);
    $store.textBlocks = [...blocks];

    console.log(`Added text block ${placement} index ${index}:`, selectedBlock);

    selectedBlock = textBlock;
  };

  const onUpdateTextBlock = (textBlock: TextBlock) => {
    const blocks = [...$store.textBlocks];
    const i = blocks.findIndex((o) => o.id === textBlock.id);
    blocks[i] = textBlock;
    $store.textBlocks = [...blocks];

    console.log("Updated selected block:", textBlock);

    selectedBlock = textBlock;
  };

  const onPressDeleteTextBlock = (textBlock: TextBlock) => {
    const blocks = [...$store.textBlocks];
    const i = blocks.findIndex((o) => o.id === textBlock.id);
    blocks.splice(i, 1);
    $store.textBlocks = [...blocks];

    console.log("Deleted selected block:", textBlock);

    selectedBlock = $store.textBlocks[i < $store.textBlocks.length ? i : i - 1];
  };
</script>

<div class="section">
  <Section>Output</Section>
  <div class="section-subtitle">
    <Type>
      Add one or more tags to create a text string. Click between tags to insert; double-click a tag
      to delete.
    </Type>
  </div>
  <div class="rounded-box {selectedBlock?.isValid === false && 'error'}" style="margin-top: 8px">
    <TextBlockList
      textBlocks={$store.textBlocks}
      {selectedBlock}
      {onSelectTextBlock}
      {onUpdateTextBlock}
      {onPressAddTextBlock}
      {onPressDeleteTextBlock}
    />
    <TextBlockDetails {selectedBlock} {onUpdateTextBlock} />
  </div>
</div>

<style>
  .section {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 0px 8px;
  }
  .section-subtitle {
    padding: 0px 8px;
    font-size: smaller;
  }
  .rounded-box {
    border-color: rgb(235, 235, 235);
    border-width: 1px;
    border-style: solid;
    border-radius: 4px;
  }
  .rounded-box.error {
    border-color: rgb(255, 53, 53);
  }
</style>
