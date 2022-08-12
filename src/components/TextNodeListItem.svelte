<script lang="ts" type="module">
  import { Type } from "figma-plugin-ds-svelte";
  import { TextNodeGroup, TextNodeGroupKind } from "types";

  export let nodeGroup: TextNodeGroup;
  export let groupKind: TextNodeGroupKind;
  export let checked: boolean;

  let title = "";
  let tag: string | undefined = undefined;
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

<div class={`container ${tag ? "four" : "three"}`} on:click>
  <div class="checkbox-wrap">
    <input class="checkbox" type="checkbox" value={nodeGroup.key} {checked} />
  </div>
  <div class="title-wrap">
    <Type>{title}</Type>
  </div>
  {#if tag}
    <div class="tag-wrap">
      <div class="tag"><Type>{tag}</Type></div>
    </div>
  {/if}
  <div class="count-wrap">
    <Type>{count}</Type>
  </div>
</div>

<style>
  .container {
    display: grid;
    align-items: center;
    min-height: 28px;
    width: 100%;
    gap: 4px;
    cursor: pointer;
  }
  .container.four {
    grid-template-columns: min-content 1fr 64px min-content;
  }
  .container.three {
    grid-template-columns: min-content 1fr 0px min-content;
  }
  .checkbox-wrap {
    grid-column: 1;
  }
  .title-wrap {
    grid-column: 2;
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
  }
  .tag-wrap {
    grid-column: 3;
    place-self: center start;
  }
  .tag {
    padding: 2px 4px;
    border-radius: var(--border-radius-large);
    white-space: nowrap;
    background-color: lightgray;
  }
  .count-wrap {
    grid-column: 4;
    padding-left: 8px;
  }
</style>
