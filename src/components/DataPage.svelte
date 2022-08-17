<script lang="ts" type="module">
  import { Type, Section, Textarea, Icon, IconMinus, Button } from "figma-plugin-ds-svelte";
  import { ListGroup } from "types";
  import { fetchListGroups } from "utils";
  import { store } from "../store";
  import Divider from "./Divider.svelte";
  import EmptyText from "./EmptyText.svelte";

  let addGroupFieldValue = "";
  let addGroupUrl: URL | undefined = undefined;

  const onSelectDeleteListGroup = async (indexUrl: string) => {
    const groups = [...$store.listGroups];
    const index = groups.findIndex((o) => o.indexUrl === indexUrl);
    const group = groups[index];

    for (const textBlock of $store.textBlocks) {
      if (group.lists.findIndex((o) => o.id === textBlock.listId) > -1) {
        alert("This group is currently being used in the Generate tab.");
        return;
      }
    }

    groups.splice(index, 1);
    $store.listGroups = groups;
  };

  const onChangeNewGroupUrl = (url: string) => {
    addGroupFieldValue = url;

    try {
      addGroupUrl = new URL(url);
    } catch (e) {
      addGroupUrl = undefined;
    }
  };

  const onSubmitAddGroup = async () => {
    const [listGroup] = await fetchListGroups([addGroupFieldValue]);
    if (!listGroup) {
      alert("Unable to get lists from this url.");
      return;
    }

    const existingGroup = $store.listGroups.find((o) => o.indexUrl === listGroup.indexUrl);
    if (existingGroup) {
      alert("This group has already been added.");
      return;
    }

    console.log("Adding group:", listGroup);
    $store.listGroups = [...$store.listGroups, listGroup];
  };
</script>

<div>
  <div class="section">
    <Section>List groups</Section>
    <div class="section-subtitle">
      <Type
        >The lists contained in each group are available in the Output section of the Generate tab.</Type
      >
    </div>
    <div class="scroll-box rounded-box">
      {#if $store.listGroups.length > 0}
        {#each $store.listGroups.filter((o) => o.editable === true) as listGroup, index}
          {#if index > 0}
            <Divider />
          {/if}
          <div class="item">
            <div class="item-col">
              <Type weight="bold">{listGroup.name}</Type>
              <div class="item-row">
                {#each listGroup.lists as list}
                  <Type>{list.name}</Type>
                {/each}
              </div>
            </div>
            <div
              class="minus-button-wrap"
              on:click={() => onSelectDeleteListGroup(listGroup.indexUrl)}
            >
              <Icon iconName={IconMinus} />
            </div>
          </div>
        {/each}
      {:else}
        <EmptyText>No list groups added.</EmptyText>
      {/if}
    </div>
  </div>
  <div class="section">
    <Section>Add group</Section>
    <div class="section-subtitle">
      <Type
        >Enter any public url pointing to a file called <a
          href="https://raw.githubusercontent.com/naftalibeder/figma-mock-content/main/index.json"
          target="_blank">index.json</a
        >. To create a list with your own custom data, create a fork of
        <a href="https://github.com/naftalibeder/figma-mock-content" target="_blank">this repo</a
        >.</Type
      >
    </div>
    <div class="add-input-wrap">
      <Textarea
        on:input={(e) => {
          const value = e.target["value"];
          onChangeNewGroupUrl(value);
        }}
        placeholder="https://example.com/index.json"
      />
    </div>
    <div class="add-button-wrap">
      <Button variant="secondary" disabled={addGroupUrl === undefined} on:click={onSubmitAddGroup}
        >Add</Button
      >
    </div>
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
  }
  .scroll-box {
    display: flex;
    flex: 0;
    flex-direction: column;
    overflow-y: scroll;
    overflow-x: hidden;
    max-height: 240px;
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
    flex: 1;
    flex-direction: row;
    align-items: center;
    min-height: 48px;
    padding: 8px 0px;
    gap: 8px;
    cursor: pointer;
  }
  .item-col {
    display: flex;
    flex-direction: column;
    flex: 1;
    align-items: flex-start;
    justify-content: center;
    gap: 4px;
  }
  .item-row {
    display: flex;
    flex: 1;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .minus-button-wrap {
    border-radius: var(--border-radius-large);
  }
  .minus-button-wrap:hover {
    background-color: rgb(245, 245, 245);
  }
  .add-input-wrap {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding-top: 8px;
    gap: 8px;
  }
  .add-button-wrap {
    display: flex;
    flex: 0;
    padding-top: 8px;
  }
</style>
