<script lang="ts" type="module">
  import { Type } from "figma-plugin-ds-svelte";
  import { Page } from "types";

  export let currentPage: Page;

  const pages: Page[] = ["generate", "data", "about"];

  const pageStyle = "opacity-50 hover:opacity-80";
  const pageStyleActive = "opacity-100 hover:opacity-100";
</script>

<div class="flex">
  <div class="flex flex-1 flex-row justify-start items-center w-full h-10 px-4 gap-4">
    {#each pages as page}
      <div
        class="{currentPage === page ? pageStyleActive : pageStyle} cursor-pointer"
        on:click={() => (currentPage = page)}
      >
        <Type weight={"bold"}>{page[0].toUpperCase() + page.slice(1)}</Type>
      </div>
    {/each}
  </div>
</div>
