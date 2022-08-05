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
  <div class={isSelected ? "wrap hoverable" : "wrap"}>
    <Button variant={isSelected ? "primary" : "secondary"} on:click>
      <div class="wrap-inner">
        {textBlock.title}
      </div>
    </Button>
  </div>
</div>

<style>
  .wrap {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .wrap.hoverable {
    display: flex;
  }
  .wrap-inner {
    display: flex;
    flex-direction: row;
    align-items: center;
    white-space: nowrap;
  }
</style>
