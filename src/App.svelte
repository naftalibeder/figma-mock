<script lang="ts" type="module">
  import { onMount } from "svelte";
  import { Button } from "figma-plugin-ds-svelte";
  import { TextNodeGroup, CodeMessage, ListGroup, TextBlock } from "types";
  import { fetchListGroups } from "utils";
  import { store } from "./store";
  import TextNodeList from "./components/TextNodeList.svelte";
  import TextBlocksBuilder from "./components/TextBlocksBuilder.svelte";
  import OutputPreview from "./components/OutputPreview.svelte";

  onMount(() => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "INIT",
        },
      },
      "*"
    );
  });

  window.onmessage = async (event: MessageEvent) => {
    const message = event.data.pluginMessage as CodeMessage;

    if (message.type === "INIT") {
      let urls = [
        "https://raw.githubusercontent.com/naftalibeder/figma-mock-content/main/index.json",
      ];
      if (message.url) urls.push(message.url);
      $store.listGroups = await fetchListGroups(urls);

      $store.nodeGroups = message.nodeGroups;
    } else if (message.type === "NODES") {
      $store.nodeGroups = message.nodeGroups;
    }
  };

  const onConfirmPaste = () => {};
</script>

<div class="wrap">
  <TextNodeList />
  <TextBlocksBuilder />
  <OutputPreview />
  <div class="button-holder">
    <Button on:click={onConfirmPaste} disabled={false}>Paste into selected text fields</Button>
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
