<script lang="ts" type="module">
  import { Type, Section } from "figma-plugin-ds-svelte";
  import { store } from "../store";
  import Divider from "./Divider.svelte";
  import Label from "./Label.svelte";
</script>

<div class="section">
  <Section>List groups [IN PROGRESS]</Section>
  <div class="section-subtitle">
    <Label
      >The lists contained in a list group are available in the Generate tab. Create a new list
      group by forking and modifying <a href="https://github.com/naftalibeder/figma-mock-content"
        >this repo</a
      >.</Label
    >
  </div>
  <div class="scroll-box rounded-box">
    {#each $store.listGroups as listGroup, index}
      {#if index > 0}
        <Divider />
      {/if}
      <div class="item">
        <Type weight="bold">{listGroup.name}</Type>
        <div class="item-list-row">
          {#each listGroup.lists as list}
            <Type>{list.name}</Type>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .section {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 8px;
  }
  .section-subtitle {
    padding: 0px 8px;
    font-size: smaller;
  }
  .scroll-box {
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    overflow-x: hidden;
    height: 240px;
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
  .item {
    display: flex;
    flex-direction: column;
    flex: 0;
    align-items: flex-start;
    padding: 8px 0px;
    gap: 8px;
  }
  .item-list-row {
    display: flex;
    flex: 0;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    /* overflow-x: hidden; */
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
