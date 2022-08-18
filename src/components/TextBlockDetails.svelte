<script lang="ts" type="module">
  import { SelectMenu, Input, Type } from "figma-plugin-ds-svelte";
  import { onMount } from "svelte";
  import { TextBlock, List, Casing, SelectMenuOption, TextBlockString } from "types";
  import { listById, textBlockIsValid } from "utils";
  import { store } from "../store";

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

<div class="flex flex-col p-2 gap-2">
  <div class="flex flex-col gap-2">
    <Type>Data</Type>
    <SelectMenu
      bind:menuItems={listOptions}
      on:change={(e) => onSelectListOption(e.detail)}
      showGroupLabels={true}
    />
  </div>
  {#if selectedBlock?.type === "TextBlockCustomString"}
    <div class="flex flex-col gap-2">
      <Type>Custom text</Type>
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
    <div class="flex flex-row gap-2">
      <div class="flex flex-col gap-2">
        <Type>Min</Type>
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
      <div class="flex flex-col gap-2">
        <Type>Max</Type>
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
      <div class="flex flex-col gap-2">
        <Type>Decimals</Type>
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
    <Type>Capitalization</Type>
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
