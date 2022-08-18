<script lang="ts" type="module">
  import { Button } from "figma-plugin-ds-svelte";
  import { TextBlock } from "types";

  export let textBlock: TextBlock;
  export let isSelected: boolean;

  $: {
    if (textBlock?.type === "TextBlockCustomString") {
      textBlock.title = `"${textBlock.customText}"`;
    }
  }
</script>

<div>
  <div class={"flex flex-row items-center"} on:click on:dblclick>
    <Button variant={isSelected ? "primary" : "secondary"}>
      <div class="flex flex-row items-center whitespace-nowrap">
        {textBlock.title}
      </div>
    </Button>
  </div>
</div>
