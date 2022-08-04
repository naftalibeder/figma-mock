<script lang="ts" type="module">
  import { Section, Checkbox } from "figma-plugin-ds-svelte";
  import { TextNodeGroup } from "types";
  import { store } from "../store";
  import Label from "../components/Label.svelte";
  import Divider from "../components/Divider.svelte";

  $: nodeGroups = $store.nodeGroups;

  let selectedMap: Record<number, boolean> = {}; // index, isSelected
  let selectedGroups: TextNodeGroup[] = [];
  $: {
    selectedGroups = [];
    nodeGroups.forEach((nodeGroup, index) => {
      if (selectedMap[index] === true) {
        selectedGroups.push(nodeGroup);
      }
    });
    selectedGroups = selectedGroups;
  }

  const onSelectNodeGroup = (index: number) => {
    selectedMap[index] = !selectedMap[index];
  };
</script>

<div class="section">
  <Section>Fields</Section>
  <div class="section-subtitle">
    <Label
      >{selectedGroups.length > 0
        ? `${selectedGroups.map((o) => o.count).reduce((a, c) => (a += c), 0)} items selected.`
        : "Select the text fields to fill."}</Label
    >
  </div>
  <div class="scroll-box rounded-box">
    {#if nodeGroups.length > 0}
      {#each nodeGroups as nodeGroup, index}
        {#if index > 0}
          <Divider />
        {/if}
        <div class="scroll-item" on:click={() => onSelectNodeGroup(index)}>
          <Checkbox
            value={nodeGroup.key}
            checked={selectedMap[index]}
            on:change={() => onSelectNodeGroup(index)}
          >
            {`${Object.values(nodeGroup.nodesMap)[0].characters} (${nodeGroup.count})`}
          </Checkbox>
        </div>
      {/each}
    {:else}
      <Label>Select at least one element.</Label>
    {/if}
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
  .scroll-item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .rounded-box {
    border-color: rgb(235, 235, 235);
    border-width: 1px;
    border-style: solid;
    border-radius: 4px;
  }
</style>
