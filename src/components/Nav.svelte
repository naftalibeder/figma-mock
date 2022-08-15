<script lang="ts" type="module">
  import { Type } from "figma-plugin-ds-svelte";
  import { Page } from "types";

  export let currentPage: Page;

  const pages: Page[] = ["generate", "data", "about"];
</script>

<div class="nav">
  {#each pages as page}
    <div class="item {currentPage === page && 'selected'}" on:click={() => (currentPage = page)}>
      <Type weight={"bold"}>{page[0].toUpperCase() + page.slice(1)}</Type>
    </div>
  {/each}
</div>

<style>
  .nav {
    display: flex;
    flex: 1;
    flex-direction: row;
    align-items: center;
    min-height: 40px;
    padding: 0px 16px;
    gap: 16px;
  }
  .item {
    opacity: 0.5;
    cursor: pointer;
  }
  .item:hover {
    opacity: 0.8;
  }
  .selected {
    opacity: 1;
  }
  .selected:hover {
    opacity: 1;
  }
</style>
