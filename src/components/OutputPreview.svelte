<script lang="ts" type="module">
  import { Section } from "figma-plugin-ds-svelte";
  import { cased, fetchListContent, listById } from "utils";
  import { store } from "../store";
  import Divider from "./Divider.svelte";
  import Label from "./Label.svelte";

  $: textBlocks = $store.textBlocks;
  $: listGroups = $store.listGroups;

  let previewLines: string[] = [];

  const buildPreviewLine = async () => {
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

  const buildPreviewLines = async () => {
    const promises = Array(20)
      .fill(0)
      .map(() => buildPreviewLine());
    previewLines = await Promise.all(promises);
    previewLines = previewLines.filter((o) => o.length > 0);
  };

  $: {
    textBlocks;
    listGroups;

    buildPreviewLines();
  }
</script>

<div class="section">
  <Section>Preview</Section>
  <div class="section-subtitle">
    <Label>Examples of output text will appear below.</Label>
  </div>
  <div class="scroll-box rounded-box">
    {#each previewLines as previewLine, index}
      {#if index > 0}
        <Divider />
      {/if}
      <div class="preview-item">
        <Label>{previewLine}</Label>
      </div>
    {/each}
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
  .scroll-box {
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    height: 134px;
    margin-top: 8px;
    padding: 4px 8px;
    font-size: smaller;
  }
  .rounded-box {
    border-color: rgb(235, 235, 235);
    border-width: 1px;
    border-style: solid;
    border-radius: 4px;
  }
  .preview-item {
    padding: 8px 0px;
  }
</style>
