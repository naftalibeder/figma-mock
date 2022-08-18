<script lang="ts" type="module">
  import { Section, Type } from "figma-plugin-ds-svelte";
  import { buildStringFromTextBlocks } from "utils";
  import { store } from "../store";
  import Divider from "./Divider.svelte";
  import EmptyText from "./EmptyText.svelte";

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

<div>
  <Section>Preview</Section>
  <div class="section-subtitle">
    <Type>Examples of output text will appear below.</Type>
  </div>
  <div class="scroll-box rounded-box h-[120]">
    {#if previewLines.length > 0}
      {#each previewLines as previewLine, index}
        {#if index > 0}
          <Divider />
        {/if}
        <div class="flex">
          <div class="flex flex-1 items-center h-7">
            <Type>{previewLine}</Type>
          </div>
        </div>
      {/each}
    {:else}
      <EmptyText>No text blocks configured.</EmptyText>
    {/if}
  </div>
</div>
