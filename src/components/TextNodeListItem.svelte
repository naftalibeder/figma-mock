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

    const joinedNames = [...new Set(nodes.map((o) => o.name))].join(", ");
    const joinedText = [...new Set(nodes.map((o) => o.characters))].join(", ");

    switch (groupKind) {
      case "NAME":
        title = joinedNames;
        tag = joinedText;
        break;
      case "TEXT":
        title = joinedText;
        tag = "";
        break;
      case "LOCAL_XY":
        title = joinedText;
        tag = `x: ${firstNode.x}, y: ${firstNode.y}`;
        break;
      case "LOCAL_X":
        title = joinedText;
        tag = `x: ${firstNode.x}`;
        break;
      case "LOCAL_Y":
        title = joinedText;
        tag = `y: ${firstNode.y}`;
        break;
      case "SIZE":
        title = joinedText;
        tag = `${firstNode.width} x ${firstNode.height}`;
        break;
    }
  }
</script>

<div class="flex">
  <div class="flex flex-row h-7 w-full gap-2 items-center content-between cursor-pointer" on:click>
    <div class="flex">
      <input type="checkbox" value={nodeGroup.key} {checked} />
    </div>
    <div class="flex flex-1 flex-grow whitespace-nowrap overflow-ellipsis">
      <Type>{title}</Type>
    </div>
    {#if tag}
      <div class="flex flex-shrink items-center overflow-hidden overflow-ellipsis">
        <div class="flex py-0.5 px-1 rounded-lg whitespace-nowrap bg-gray-100">
          <Type>{tag}</Type>
        </div>
      </div>
    {/if}
    <div class="flex text-right">
      <Type>{count}</Type>
    </div>
  </div>
</div>
