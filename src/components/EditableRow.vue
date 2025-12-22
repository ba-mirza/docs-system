<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { EditableComponent } from "../types/parser.types";
import StatusBadge from "./StatusBadge.vue";

interface Props {
    component: EditableComponent;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    update: [component: EditableComponent];
    delete: [];
    toggleSelect: [];
}>();

const localComponent = ref<EditableComponent>({ ...props.component });

const rowClass = computed(() => {
    const classes = ["editable-row"];

    if (localComponent.value.isSelected) {
        classes.push("row-selected");
    }

    if (localComponent.value.material.new_item) {
        classes.push("row-new");
    } else if (localComponent.value.material.isEqual === false) {
        classes.push("row-not-equal");
    } else if (localComponent.value.material.isEqual === true) {
        classes.push("row-equal");
    }

    return classes.join(" ");
});

const status = computed(() => {
    if (localComponent.value.material.new_item) return "new";
    if (localComponent.value.material.isEqual === false) return "notEqual";
    if (localComponent.value.material.isEqual === true) return "equal";
    return "unknown";
});

const handleBlur = () => {
    emit("update", { ...localComponent.value });
};

const toggleStatus = () => {
    if (localComponent.value.material.isEqual === null) {
        localComponent.value.material.isEqual = true;
    } else if (localComponent.value.material.isEqual === true) {
        localComponent.value.material.isEqual = false;
    } else {
        localComponent.value.material.isEqual = null;
    }

    handleBlur();
};

const handleCheckbox = () => {
    emit("toggleSelect");
};

const handleDelete = () => {
    if (confirm("Are you sure you want to delete this component?")) {
        emit("delete");
    }
};

watch(
    () => props.component,
    (newVal) => {
        localComponent.value = { ...newVal };
    },
    { deep: true },
);
</script>

<template>
    <tr :class="rowClass">
        <td class="cell-checkbox">
            <input
                type="checkbox"
                :checked="localComponent.isSelected"
                @change="handleCheckbox"
                class="checkbox-input"
            />
        </td>

        <td class="cell-status">
            <StatusBadge :status="status" @toggle="toggleStatus" />
        </td>

        <td class="cell-pos">
            <input
                v-model="localComponent.pos"
                @blur="handleBlur"
                class="input-field input-pos"
                placeholder="-"
            />
        </td>

        <td class="cell-description">
            <input
                v-model="localComponent.description"
                @blur="handleBlur"
                class="input-field input-description"
                placeholder="Component description"
            />
        </td>

        <td class="cell-material">
            <input
                v-model="localComponent.material.value"
                @blur="handleBlur"
                class="input-field input-material"
                placeholder="Material from PDF"
            />
        </td>

        <td class="cell-manager">
            <input
                v-model="localComponent.material.from_manager_data"
                @blur="handleBlur"
                class="input-field input-manager"
                placeholder="Manager data"
            />
        </td>

        <td class="cell-quantity">
            <input
                v-if="localComponent.quantity"
                v-model.number="localComponent.quantity.value"
                type="number"
                @blur="handleBlur"
                class="input-field input-quantity"
                min="0"
                placeholder="0"
            />
            <span v-else class="text-gray-400">-</span>
        </td>

        <td class="cell-note">
            <input
                v-model="localComponent.note"
                @blur="handleBlur"
                class="input-field input-note"
                placeholder="Note"
            />
        </td>

        <td class="cell-actions">
            <button
                @click="handleDelete"
                class="btn-delete"
                title="Delete component"
            >
                🗑️
            </button>
        </td>
    </tr>
</template>
