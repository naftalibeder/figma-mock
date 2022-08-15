<script lang="ts" type="module">
  import { SelectMenu, Input } from "figma-plugin-ds-svelte";
  import { onMount } from "svelte";
  import { TextBlock, List, Casing, SelectMenuOption, TextBlockString } from "types";
  import { listById, textBlockIsValid } from "utils";
  import { store } from "../store";
  import Label from "./Label.svelte";

  export let selectedBlock: TextBlock | undefined;
  export let onUpdateTextBlock: (textBlock: TextBlock) => void;

  $: listGroups = $store.listGroups;

  let lists: List[] = [];
  let selectedList: List | undefined = undefined;

  let listOptions: SelectMenuOption[] = [];

  let customTextInputValue: string | undefined;
  let numberMinInputValue: string | undefined;
  let numberMaxInputValue: string | undefined;
  let numberPrecisionInputValue: string | undefined;

  let casingOptions: SelectMenuOption<Casing>[] = [];
  let selectedCasingOption: SelectMenuOption<Casing>;
  $: {
    const selected = selectedCasingOption?.value ?? "original";
    casingOptions = [
      { value: "original", label: "Original", selected: "original" === selected },
      { value: "sentence", label: "Sentence", selected: "sentence" === selected },
      { value: "title", label: "Title", selected: "title" === selected },
      { value: "upper", label: "Upper", selected: "upper" === selected },
      { value: "lower", label: "Lower", selected: "lower" === selected },
    ];
  }

  onMount(() => {
    if (selectedBlock) {
      onUpdateSelectedBlock(selectedBlock);
    }
  });

  const listGroupsDidChange = () => {
    lists = [];
    listOptions = [];

    // Generate a flattened array of data lists, and an array of options for the dropdown.
    listGroups.forEach((listGroup, i) => {
      listGroup.lists.forEach((list) => {
        if (i === 0 && !selectedList) {
          selectedList = list;
        }

        lists.push(list);
        listOptions.push({
          value: list.id,
          label: list.name,
          group: listGroup.name,
          selected: false,
        });
      });
    });

    // For the active block, mark the block's list dropdown option as selected.
    if (selectedBlock) {
      selectedList = lists.find((o) => o.id === selectedBlock.listId);
      listOptions.forEach((listOption, i) => {
        if (listOption.value === selectedList.id) {
          listOption.selected = true;
        }
      });
    }
  };

  const onSelectListOption = (listOption: SelectMenuOption) => {
    selectedList = listById(listOption.value, listGroups);

    const block: TextBlock = { ...selectedBlock };
    // @ts-ignore
    block.type = selectedList.type;
    block.listId = selectedList.id;
    block.title = selectedList.name;
    onUpdateSelectedBlock(block);
  };

  const onSwitchSelectedBlock = () => {
    if (!selectedBlock) {
      return;
    }

    switch (selectedBlock.type) {
      case "TextBlockCustomString":
        customTextInputValue = selectedBlock.customText;
        break;
      case "TextBlockNumber":
        numberMinInputValue = selectedBlock.min?.toString();
        numberMaxInputValue = selectedBlock.max?.toString();
        numberPrecisionInputValue = selectedBlock.decimals?.toString();
        break;
      case "TextBlockString":
        selectedCasingOption = casingOptions.find(
          (o) => o.value === (selectedBlock as TextBlockString).casing
        );
        break;
    }
  };

  const onUpdateSelectedBlock = (textBlock: TextBlock) => {
    const block: TextBlock = { ...textBlock };
    block.isValid = textBlockIsValid(block);
    selectedBlock = block;
    onUpdateTextBlock(block);
  };

  $: {
    selectedBlock?.id;
    listGroups;

    listGroupsDidChange();
  }

  $: {
    selectedBlock?.id;

    onSwitchSelectedBlock();
  }
</script>

<div class="wrap">
  <div class="col">
    <Label>Data</Label>
    <SelectMenu
      bind:menuItems={listOptions}
      on:change={(e) => onSelectListOption(e.detail)}
      showGroupLabels={true}
    />
  </div>
  {#if selectedBlock?.type === "TextBlockCustomString"}
    <div class="col">
      <Label>Custom text</Label>
      <Input
        placeholder="Enter custom text"
        bind:value={customTextInputValue}
        on:input={(e) => {
          const value = e.target["value"];
          if (selectedBlock.type === "TextBlockCustomString") {
            const block = { ...selectedBlock };
            block.customText = value;
            onUpdateSelectedBlock(block);
          }
        }}
      />
    </div>
  {:else if selectedBlock?.type === "TextBlockNumber"}
    <div class="row">
      <div class="col">
        <Label>Min</Label>
        <Input
          type="number"
          placeholder={"10"}
          step={"1"}
          bind:value={numberMinInputValue}
          on:input={(e) => {
            const value = e.target["value"];
            if (selectedBlock.type === "TextBlockNumber") {
              const block = { ...selectedBlock };
              block.min = parseFloat(value);
              onUpdateSelectedBlock(block);
            }
          }}
        />
      </div>
      <div class="col">
        <Label>Max</Label>
        <Input
          type="number"
          placeholder={"1000"}
          step={"1"}
          bind:value={numberMaxInputValue}
          on:input={(e) => {
            const value = e.target["value"];
            if (selectedBlock.type === "TextBlockNumber") {
              const block = { ...selectedBlock };
              block.max = parseFloat(value);
              onUpdateSelectedBlock(block);
            }
          }}
        />
      </div>
      <div class="col">
        <Label>Decimals</Label>
        <Input
          type="number"
          placeholder={"2"}
          min={"0"}
          step={"1"}
          bind:value={numberPrecisionInputValue}
          on:input={(e) => {
            const value = e.target["value"];
            if (selectedBlock.type === "TextBlockNumber") {
              const block = { ...selectedBlock };
              block.decimals = parseFloat(value);
              onUpdateSelectedBlock(block);
            }
          }}
        />
      </div>
    </div>
  {:else if selectedBlock?.type === "TextBlockString"}
    <Label>Capitalization</Label>
    <SelectMenu
      bind:menuItems={casingOptions}
      on:change={(e) => {
        const value = e.detail.value;
        selectedCasingOption = value; // Set here imperatively because we don't `bind` the menu value.
        if (selectedBlock.type === "TextBlockString") {
          const block = { ...selectedBlock };
          block.casing = value;
          onUpdateSelectedBlock(block);
        }
      }}
    />
  {/if}
</div>

<style>
  .wrap {
    display: flex;
    flex-direction: column;
    padding: 8px;
    gap: 8px;
    font-size: smaller;
  }
  .row {
    display: flex;
    flex-direction: row;
    gap: 8px;
  }
  .col {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>
