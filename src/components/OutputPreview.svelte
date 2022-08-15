<script lang="ts" type="module">
  import { Section } from "figma-plugin-ds-svelte";
  import { buildStringFromTextBlocks } from "utils";
  import { store } from "../store";
  import Divider from "./Divider.svelte";
  import EmptyText from "./EmptyText.svelte";
  import Label from "./Label.svelte";

  $: textBlocks = $store.textBlocks;
  $: listGroups = $store.listGroups;

  let previewLines: string[] = [];

  const buildPreviewLines = async () => {
    const promises = Array(20)
      .fill(0)
      .map(() => buildStringFromTextBlocks(textBlocks, listGroups));
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
    {#if $store.nodeGroups.length > 0}
      {#each previewLines as previewLine, index}
        {#if index > 0}
          <Divider />
        {/if}
        <div class="preview-item">
          <Label>{previewLine}</Label>
        </div>
      {/each}
    {:else}
      <EmptyText />
    {/if}
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
  .scroll-box {
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    height: 120px;
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
    display: flex;
    flex: 1;
    align-items: center;
    min-height: 28px;
  }
</style>
