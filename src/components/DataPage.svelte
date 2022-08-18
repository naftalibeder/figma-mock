<script lang="ts" type="module">
  import { Type, Section, Textarea, Icon, IconMinus, Button } from "figma-plugin-ds-svelte";
  import { fetchListGroups } from "utils";
  import { store } from "../store";
  import Divider from "./Divider.svelte";
  import EmptyText from "./EmptyText.svelte";

  $: editableGroups = $store.listGroups.filter((o) => o.editable);

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
      {#if editableGroups.length > 0}
        {#each editableGroups as listGroup, index}
          {#if index > 0}
            <Divider />
          {/if}
          <div class="flex">
            <div class="flex flex-1 flex-row items-center h-12 py-2 gap-2 cursor-pointer">
              <div class="flex flex-1 flex-col items-start justify-center gap-1">
                <Type weight="bold">{listGroup.name}</Type>
                <div
                  class="flex flex-1 flex-row items-center gap-2 overflow-ellipsis whitespace-nowrap"
                >
                  {#each listGroup.lists as list}
                    <Type>{list.name}</Type>
                  {/each}
                </div>
              </div>
              <div
                class="rounded-md hover:bg-gray-100"
                on:click={() => onSelectDeleteListGroup(listGroup.indexUrl)}
              >
                <Icon iconName={IconMinus} />
              </div>
            </div>
          </div>
        {/each}
      {:else}
        <div class="flex">
          <EmptyText>No list groups added.</EmptyText>
        </div>
      {/if}
    </div>
  </div>
  <Divider />
  <div class="section">
    <Section>Add list group</Section>
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
    <div class="flex flex-1 flex-col pt-2 gap-2">
      <Textarea
        on:input={(e) => {
          const value = e.target["value"];
          onChangeNewGroupUrl(value);
        }}
        placeholder="https://example.com/index.json"
      />
    </div>
    <div class="flex pt-2">
      <Button variant="secondary" disabled={addGroupUrl === undefined} on:click={onSubmitAddGroup}
        >Add</Button
      >
    </div>
  </div>
</div>
