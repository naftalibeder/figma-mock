<script lang="ts" type="module">
  import "../styles/main.css";
  import { Page } from "types";
  import Nav from "./components/Nav.svelte";
  import GeneratePage from "./components/GeneratePage.svelte";
  import DataPage from "./components/DataPage.svelte";
  import AboutPage from "./components/AboutPage.svelte";
  import Divider from "./components/Divider.svelte";

  let currentPage: Page = "generate";
</script>

<div class="flex flex-1 flex-col">
  <Nav bind:currentPage />
  <Divider />
  {#if currentPage === "generate"}
    <GeneratePage />
  {:else if currentPage === "data"}
    <DataPage />
  {:else if currentPage === "about"}
    <AboutPage />
  {/if}
</div>
