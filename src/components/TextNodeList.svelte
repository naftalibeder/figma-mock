<script lang="ts" type="module">
  import { Section, Type, SelectMenu } from "figma-plugin-ds-svelte";
  import { SelectMenuOption, TextNodeGroup, TextNodeGroupKind } from "types";
  import { store } from "../store";
  import Label from "../components/Label.svelte";
  import Divider from "../components/Divider.svelte";

  $: nodeGroups = $store.nodeGroups;

  export let selectedGroups: TextNodeGroup[] = [];
  export let groupKind: TextNodeGroupKind;
  export let onChangeGroupKind: (groupKind: TextNodeGroupKind) => void;

  let selectedMap: Record<number, boolean> = {}; // index, isSelected
  $: selectedMapCopy = { ...selectedMap };

  let subtitleText = "";
  $: {
    if (selectedGroups.length > 0) {
      const itemsCount = selectedGroups.map((o) => o.count).reduce((a, c) => (a += c), 0);
      subtitleText = `${itemsCount} items selected.`;
    } else {
      subtitleText = "Select the text fields to fill.";
    }
  }

  let groupKindOptions: SelectMenuOption<TextNodeGroupKind>[] = [];
  $: {
    groupKindOptions = [
      {
        value: "NAME",
        label: "Name",
      },
      {
        value: "TEXT",
        label: "Text",
      },
      {
        value: "LOCAL_XY",
        label: "X and Y",
      },
      {
        value: "LOCAL_X",
        label: "X",
      },
      {
        value: "LOCAL_Y",
        label: "Y",
      },
    ].map((o: SelectMenuOption<TextNodeGroupKind>) => {
      return {
        value: o.value,
        label: o.label,
        group: "Group by property",
        selected: o.value === groupKind,
      };
    });
  }

  const onSelectGroup = (index: number) => {
    if (selectedMap[index] === undefined) {
      selectedMap[index] = true;
    } else {
      selectedMap[index] = !selectedMap[index];
    }

    selectedGroups = [];
    nodeGroups.forEach((nodeGroup, index) => {
      if (selectedMap[index]) {
        selectedGroups.push(nodeGroup);
      }
    });
    selectedGroups = selectedGroups;

    console.log(`Selected node groups: ${selectedGroups.map((o) => o.key).join(", ")}`);
  };
</script>

<div class="section">
  <Section>Fields</Section>
  <div class="section-subtitle">
    <Label>{subtitleText}</Label>
  </div>
  <div class="group-by-options">
    <SelectMenu
      bind:menuItems={groupKindOptions}
      on:change={(e) => onChangeGroupKind(e.detail.value)}
      showGroupLabels={true}
    />
  </div>
  <div class="scroll-box rounded-box">
    {#if nodeGroups.length > 0}
      {#each nodeGroups as nodeGroup, index}
        {#if index > 0}
          <Divider />
        {/if}
        <div class="scroll-item" on:click={() => onSelectGroup(index)}>
          <input
            class="checkbox"
            type="checkbox"
            value={nodeGroup.key}
            checked={selectedMapCopy[index]}
          />
          <Type>
            {`${Object.values(nodeGroup.nodesMap)[0].characters} (${nodeGroup.count})`}
          </Type>
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
  .group-by-options {
    margin-top: 8px;
  }
  .scroll-box {
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    height: 110px;
    margin-top: 8px;
    padding: 4px 8px;
    font-size: smaller;
  }
  .scroll-item {
    display: flex;
    flex-direction: row;
    padding: 4px 0px;
    align-items: center;
  }
  .checkbox {
    margin-right: 8px;
  }
  .rounded-box {
    border-color: rgb(235, 235, 235);
    border-width: 1px;
    border-style: solid;
    border-radius: 4px;
  }
</style>
