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
  import { store } from "../store";
  import { defaultListGroup } from "../constants";
  import TextNodeList from "../components/TextNodeList.svelte";
  import TextBlocksBuilder from "../components/TextBlocksBuilder.svelte";
  import OutputPreview from "../components/OutputPreview.svelte";
  import Divider from "../components/Divider.svelte";

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
      const listGroups = await fetchListGroups(message.persistedStore.listGroupUrls);
      $store.listGroups = [defaultListGroup, ...listGroups];
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

  const onSelectPaste = async () => {
    if (!canPaste) {
      return;
    }

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

<div>
  <div class="section">
    <TextNodeList
      bind:selectedGroups
      nodeGroups={$store.nodeGroups}
      groupKind={$store.nodeGroupKind}
      bind:onChangeGroupKind
    />
  </div>
  <Divider />
  <div class="section">
    <TextBlocksBuilder />
  </div>
  <Divider />
  <div class="section">
    <OutputPreview />
  </div>
  <Divider />
  <div
    class={"flex flex-1 flex-row items-center justify-between px-4 pt-3 cursor-pointer " +
      (canPaste ? "opacity-80 hover:opacity-100" : "opacity-50 hover:opacity-60")}
    disabled={!canPaste}
    on:click={onSelectPaste}
  >
    <Type weight="bold">Paste into selected text fields</Type>
    <Icon iconName={IconForward} />
  </div>
</div>
