<script lang="ts" type="module">
  import { onMount } from "svelte";
  import { Button } from "figma-plugin-ds-svelte";
  import { CodeMessage, WindowMessage } from "types";
  import { fetchListGroups } from "utils";
  import { store } from "./store";
  import TextNodeList from "./components/TextNodeList.svelte";
  import TextBlocksBuilder from "./components/TextBlocksBuilder.svelte";
  import OutputPreview from "./components/OutputPreview.svelte";

  onMount(async () => {
    const message: WindowMessage = {
      type: "GET_SELECTED_AND_STORE",
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

  const onConfirmPaste = () => {
    const message: WindowMessage = {
      type: "PASTE",
      groupingKey: "",
      itemsSequence: [[]],
    };
    parent.postMessage({ pluginMessage: message }, "*");
  };
</script>

<div class="wrap">
  <TextNodeList />
  <TextBlocksBuilder />
  <OutputPreview />
  <div class="button-holder">
    <Button on:click={onConfirmPaste} disabled={false}>Paste into selected fields</Button>
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
