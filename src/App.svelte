<script lang="ts" type="module">
  import { onMount } from "svelte";
  import { Type, Icon, IconForward } from "figma-plugin-ds-svelte";
  import {
    CodeMessage,
    WindowMessage,
    TextNodeGroup,
    TextNodeGroupKind,
    WindowMessageGetSelected,
    WindowMessageGetSelectedAndStore,
  } from "types";
  import { buildTextNodeGroups, fetchListGroups, buildStringFromTextBlocks } from "utils";
  import { store } from "./store";
  import TextNodeList from "./components/TextNodeList.svelte";
  import TextBlocksBuilder from "./components/TextBlocksBuilder.svelte";
  import OutputPreview from "./components/OutputPreview.svelte";
  import Divider from "./components/Divider.svelte";

  let selectedGroups: TextNodeGroup[] = [];

  $: canPaste = $store.nodeGroups.length > 0 && selectedGroups.length > 0;

  onMount(async () => {
    const message: WindowMessageGetSelectedAndStore = {
      type: "GET_SELECTED_AND_STORE",
    };
    parent.postMessage({ pluginMessage: message }, "*");
  });

  window.onmessage = async (event: MessageEvent) => {
    const message = event.data.pluginMessage as CodeMessage;
    console.log("Received message:", message);

    if (message.type === "SELECTED_AND_STORE") {
      $store.nodeGroupKind = message.persistedStore.nodeGroupKind;
      $store.nodeGroups = buildTextNodeGroups(message.nodeInfos, $store.nodeGroupKind);
      $store.listGroups = await fetchListGroups(message.persistedStore.listGroupUrls);
      $store.textBlocks = message.persistedStore.textBlocks;
      $store.loaded = true;
    } else if (message.type === "SELECTED") {
      $store.nodeGroups = buildTextNodeGroups(message.nodeInfos, $store.nodeGroupKind);
    }

    console.log("Selected groups:", $store.nodeGroups);
  };

  let onChangeGroupKind = (groupKind: TextNodeGroupKind) => {
    $store.nodeGroupKind = groupKind;

    const message: WindowMessageGetSelected = {
      type: "GET_SELECTED",
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
        const textLine = await buildStringFromTextBlocks($store.textBlocks, $store.listGroups);
        textLinesMap[nodeId] = textLine;
      }
    }

    const message: WindowMessage = {
      type: "PASTE",
      textLinesMap,
    };
    parent.postMessage({ pluginMessage: message }, "*");
  };
</script>

<div class="wrap">
  <TextNodeList
    bind:selectedGroups
    nodeGroups={$store.nodeGroups}
    groupKind={$store.nodeGroupKind}
    bind:onChangeGroupKind
  />
  <div class="divider"><Divider /></div>
  <TextBlocksBuilder />
  <div class="divider"><Divider /></div>
  <OutputPreview />
  <div class="divider"><Divider /></div>
  <div
    class={`button ${canPaste ? "" : "disabled"}`}
    on:click={canPaste ? onConfirmPaste : undefined}
  >
    <Type weight="bold">Paste into selected text fields</Type>
    <Icon iconName={IconForward} />
  </div>
</div>

<style>
  .wrap {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 8px 0px;
  }
  .divider {
    margin-top: 16px;
    margin-bottom: 8px;
  }
  .button {
    display: flex;
    flex: 1;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0px 16px;
    padding-top: 12px;
    cursor: pointer;
    opacity: 0.8;
  }
  .button.disabled {
    opacity: 0.5;
  }
  .button:hover {
    opacity: 1;
  }
  .button.disabled:hover {
    opacity: 0.6;
  }
</style>
