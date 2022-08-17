<script lang="ts" type="module">
  import { Section, Type, SelectMenu } from "figma-plugin-ds-svelte";
  import { SelectMenuOption, TextNodeGroup, TextNodeGroupKind } from "types";
  import Divider from "../components/Divider.svelte";
  import TextNodeListItem from "./TextNodeListItem.svelte";
  import EmptyText from "./EmptyText.svelte";

  export let selectedGroups: TextNodeGroup[] = [];
  export let nodeGroups: TextNodeGroup[];
  export let groupKind: TextNodeGroupKind | undefined;
  export let onChangeGroupKind: (groupKind: TextNodeGroupKind) => void;

  let selectedMap: Record<number, boolean> = {}; // index, isSelected
  $: selectedMapCopy = { ...selectedMap };

  let subtitleText = "";

  const updateSubtitleText = () => {
    if (selectedGroups.length > 0) {
      const selectedCount = selectedGroups.map((o) => o.count).reduce((a, c) => (a += c), 0);
      const allCount = nodeGroups.map((o) => o.count).reduce((a, c) => (a += c), 0);
      subtitleText = `${selectedCount} of ${allCount} text fields selected.`;
    } else {
      subtitleText = "Select a grouping attribute and text fields to paste into.";
    }
  };

  $: {
    nodeGroups;
    selectedGroups;

    if (nodeGroups.length === 0) {
      selectedGroups = [];
      selectedMap = {};
    }

    updateSubtitleText();
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
      {
        value: "SIZE",
        label: "Size",
      },
    ].map((o: SelectMenuOption<TextNodeGroupKind>) => {
      return {
        value: o.value,
        label: o.label,
        group: "Group by attribute",
        selected: o.value === groupKind,
      };
    });
  }

  const _onChangeGroupKind = (groupKind: TextNodeGroupKind) => {
    selectedGroups = [];
    selectedMap = {};

    onChangeGroupKind(groupKind);
  };

  const onChangeSelectedGroup = (index: number) => {
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
    <Type>{subtitleText}</Type>
  </div>
  <div class="group-by-options">
    <SelectMenu
      bind:menuItems={groupKindOptions}
      on:change={(e) => _onChangeGroupKind(e.detail.value)}
      showGroupLabels={true}
    />
  </div>
  <div class="scroll-box rounded-box">
    {#if nodeGroups.length > 0}
      {#each nodeGroups as nodeGroup, index}
        {#if index > 0}
          <Divider />
        {/if}
        <TextNodeListItem
          {nodeGroup}
          {groupKind}
          checked={selectedMapCopy[index]}
          on:click={() => onChangeSelectedGroup(index)}
        />
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
  .group-by-options {
    margin-top: 8px;
  }
  .scroll-box {
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    overflow-x: hidden;
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
</style>
