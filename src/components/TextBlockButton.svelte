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

<Button variant={isSelected ? "primary" : "secondary"} on:click>
  {textBlock.title}
</Button>
