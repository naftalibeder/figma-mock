<script lang="ts" type="module">
  import { SelectMenu, Input, Type } from "figma-plugin-ds-svelte";
  import { TextBlock, List, Casing, SelectMenuOption } from "types";
  import { listById } from "utils";
  import { store } from "../store";
  import Label from "./Label.svelte";

  export let selectedBlock: TextBlock | undefined;
  export let onUpdateTextBlock: (textBlock: TextBlock) => void;

  $: listGroups = $store.listGroups;

  let lists: List[] = [];
  let selectedList: List | undefined = undefined;

  let listOptions: SelectMenuOption[] = [];

  let customTextInputValue = "";

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

  const _listGroupsDidChange = () => {
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

  $: {
    selectedBlock?.id;
    listGroups;
    _listGroupsDidChange();
  }

  const _onSwitchSelectedBlock = () => {
    if (!selectedBlock) {
      return;
    }

    if (selectedBlock.type === "TextBlockCustomString") {
      customTextInputValue = selectedBlock.customText;
    } else if (selectedBlock.type === "TextBlockString") {
      // @ts-ignore
      selectedCasingOption = casingOptions.find((o) => o.value === selectedBlock.casing);
    }
  };

  $: {
    selectedBlock?.id;
    _onSwitchSelectedBlock();
  }

  const _onSelectListOption = (listOption: SelectMenuOption) => {
    selectedList = listById(listOption.value, listGroups);

    const block: TextBlock = { ...selectedBlock };
    // @ts-ignore
    block.type = selectedList.type;
    block.listId = selectedList.id;
    block.title = selectedList.name;
    selectedBlock = block;

    onUpdateTextBlock(selectedBlock);
  };

  const _onSelectCasingOption = (casingOption: SelectMenuOption<Casing>) => {
    selectedCasingOption = casingOption;

    if (selectedBlock.type === "TextBlockString") {
      const block: TextBlock = { ...selectedBlock };
      block.casing = casingOption.value;
      selectedBlock = block;
    }

    onUpdateTextBlock(selectedBlock);
  };

  const _onEditCustomText = (customText: string) => {
    if (!selectedBlock) {
      return;
    }

    if (selectedBlock.type === "TextBlockCustomString") {
      const block: TextBlock = { ...selectedBlock };
      block.customText = customText;
      selectedBlock = block;
    }

    onUpdateTextBlock(selectedBlock);
  };
</script>

<div class="wrap">
  <Label>Data</Label>
  <SelectMenu
    bind:menuItems={listOptions}
    on:change={(e) => _onSelectListOption(e.detail)}
    showGroupLabels={true}
  />
  {#if selectedBlock?.type === "TextBlockCustomString"}
    <Label>Custom text</Label>
    <Input
      placeholder="Enter custom text"
      bind:value={customTextInputValue}
      on:input={(e) => _onEditCustomText(e.target["value"])}
    />
  {:else if selectedBlock?.type === "TextBlockString"}
    <Label>Capitalization</Label>
    <SelectMenu bind:menuItems={casingOptions} on:change={(e) => _onSelectCasingOption(e.detail)} />
  {/if}
</div>

<style>
  .wrap {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px;
    font-size: smaller;
  }
</style>
