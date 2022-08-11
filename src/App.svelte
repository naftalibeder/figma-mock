<script lang="ts" type="module">
  import { onMount } from "svelte";
  import { Button } from "figma-plugin-ds-svelte";
  import {
    CodeMessage,
    WindowMessage,
    TextNodeGroup,
    TextNodeGroupKind,
    WindowMessageGetSelected,
    WindowMessageGetSelectedAndStore,
  } from "types";
  import { fetchListGroups, getStringFromTextBlocks } from "utils";
  import { store } from "./store";
  import TextNodeList from "./components/TextNodeList.svelte";
  import TextBlocksBuilder from "./components/TextBlocksBuilder.svelte";
  import OutputPreview from "./components/OutputPreview.svelte";

  let selectedGroups: TextNodeGroup[] = [];
  let groupKind: TextNodeGroupKind = "NAME";

  onMount(async () => {
    const message: WindowMessageGetSelectedAndStore = {
      type: "GET_SELECTED_AND_STORE",
      groupKind,
    };
    parent.postMessage({ pluginMessage: message }, "*");
  });

  window.onmessage = async (event: MessageEvent) => {
    const message = event.data.pluginMessage as CodeMessage;
    console.log("Received message:", message);

    if (message.type === "SELECTED_AND_STORE") {
      $store.nodeGroups = message.nodeGroups;

      const urls = [...message.persistedStore.listUrls["current"]];
      $store.listGroups = await fetchListGroups(urls);
    } else if (message.type === "SELECTED") {
      $store.nodeGroups = message.nodeGroups;
    }
  };

  let onChangeGroupKind = (_groupKind: TextNodeGroupKind) => {
    groupKind = _groupKind;

    const message: WindowMessageGetSelected = {
      type: "GET_SELECTED",
      groupKind,
    };
    parent.postMessage({ pluginMessage: message }, "*");
  };

  const onConfirmPaste = async () => {
    let nodeIds: string[] = [];
    let textLinesMap: Record<string, string> = {};

    // For each group of text nodes...
    for (const selectedGroup of selectedGroups) {
      // Add that group's node ids to the list.
      const nodeInfos = Object.values(selectedGroup.nodesMap);
      nodeIds = [...nodeIds, ...nodeInfos.map((o) => o.id)];

      // Generate a string for each of its nodes.
      for (const nodeId of nodeIds) {
        const textLine = await getStringFromTextBlocks($store.textBlocks, $store.listGroups);
        textLinesMap[nodeId] = textLine;
      }
    }

    const message: WindowMessage = {
      type: "PASTE",
      textLinesMap,
      groupKind,
    };
    parent.postMessage({ pluginMessage: message }, "*");
  };
</script>

<div class="wrap">
  <TextNodeList bind:selectedGroups {groupKind} bind:onChangeGroupKind />
  <TextBlocksBuilder />
  <OutputPreview />
  <div class="button-holder">
    <Button
      on:click={onConfirmPaste}
      disabled={$store.nodeGroups.length === 0 || selectedGroups.length === 0}
    >
      Paste into selected fields
    </Button>
  </div>
</div>

<style>
  .wrap {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 8px;
    padding: 8px;
  }
  .button-holder {
    margin-top: 8px;
  }
</style>
