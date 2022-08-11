<script lang="ts" type="module">
  import { Type } from "figma-plugin-ds-svelte";
  import { TextNodeGroup, TextNodeGroupKind } from "types";

  export let nodeGroup: TextNodeGroup;
  export let groupKind: TextNodeGroupKind;
  export let checked: boolean;

  let title = "";
  let tag = "";
  let count = "";

  $: {
    const nodes = Object.values(nodeGroup.nodesMap);
    const firstNode = nodes[0];

    count = `${nodeGroup.count}`;

    switch (groupKind) {
      case "NAME":
        title = firstNode.name;
        tag = "";
        break;
      case "TEXT":
        title = firstNode.characters;
        tag = "";
        break;
      case "LOCAL_XY":
        title = firstNode.characters;
        tag = `x: ${firstNode.x}, y: ${firstNode.y}`;
        break;
      case "LOCAL_X":
        title = firstNode.characters;
        tag = `x: ${firstNode.x}`;
        break;
      case "LOCAL_Y":
        title = firstNode.characters;
        tag = `y: ${firstNode.y}`;
        break;
    }
  }
</script>

<div class="scroll-item" on:click>
  <input class="checkbox" type="checkbox" value={nodeGroup.key} {checked} />
  <div class="labels-wrap">
    <div class="labels-title-and-tag">
      <Type>{title}</Type>
      {#if tag.length > 0}
        <div class="tag"><Type size={""}>{tag}</Type></div>
      {/if}
    </div>
    <Type>{count}</Type>
  </div>
</div>

<style>
  .scroll-item {
    display: flex;
    flex: 0;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: 4px 0px;
    cursor: pointer;
  }
  .checkbox {
    margin-right: 8px;
  }
  .labels-wrap {
    display: flex;
    flex: 1;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .labels-title-and-tag {
    display: flex;
    flex: 1;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }
  .tag {
    padding: 2px 4px;
    border-radius: var(--border-radius-large);
    background-color: lightgray;
  }
</style>
