<script lang="ts" type="module">
  import { onMount } from "svelte";
  import { Section } from "figma-plugin-ds-svelte";
  import { TextBlock } from "types";
  import { store } from "../store";
  import Label from "./Label.svelte";
  import TextBlockList from "./TextBlockList.svelte";
  import TextBlockDetails from "./TextBlockDetails.svelte";

  let textBlocks = $store.textBlocks;
  let selectedBlock: TextBlock | undefined;

  onMount(() => {
    selectedBlock = textBlocks[0];
  });

  const onSelectTextBlock = (textBlock: TextBlock) => {
    selectedBlock = textBlock;

    console.log("Selected text block:", selectedBlock);
  };

  const onPressAddTextBlock = (textBlock: TextBlock) => {
    textBlocks = [...textBlocks, textBlock];
    selectedBlock = textBlock;

    console.log("Added text block:", selectedBlock);
  };

  const onUpdateSelectedBlock = (textBlock: TextBlock) => {
    const i = textBlocks.findIndex((o) => o.id === textBlock.id);
    textBlocks[i] = textBlock;
    selectedBlock = textBlock;

    console.log("Updated selected block:", textBlock);
  };

  const updateStore = () => {
    $store.textBlocks = textBlocks;
  };

  $: {
    textBlocks;
    updateStore();
  }
</script>

<div class="section">
  <Section>Output</Section>
  <div class="section-subtitle">
    <Label>Add one or more tags to create a text string. Click between tags to insert.</Label>
  </div>
  <div class="rounded-box" style="margin-top: 8px">
    <TextBlockList {textBlocks} {selectedBlock} {onSelectTextBlock} {onPressAddTextBlock} />
    <TextBlockDetails {selectedBlock} {onUpdateSelectedBlock} />
  </div>
</div>

<style>
  .section {
    display: flex;
    flex: 1;
    flex-direction: column;
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
</style>
