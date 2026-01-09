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

// ОБНОВЛЕНО: используем новое поле status
const rowClass = computed(() => {
    const classes = ["editable-row"];

    if (localComponent.value.isSelected) {
        classes.push("row-selected");
    }

    switch (localComponent.value.status) {
        case "equal":
            classes.push("row-equal");
            break;
        case "notEqual":
            classes.push("row-not-equal");
            break;
        case "new":
            classes.push("row-new");
            break;
    }

    return classes.join(" ");
});

// ОБНОВЛЕНО: просто возвращаем status
const status = computed(() => {
    return localComponent.value.status || "unknown";
});

const handleBlur = () => {
    emit("update", { ...localComponent.value });
};

// ОБНОВЛЕНО: переключаем статус циклически
const toggleStatus = () => {
    switch (localComponent.value.status) {
        case "equal":
            localComponent.value.status = "notEqual";
            break;
        case "notEqual":
            localComponent.value.status = "new";
            break;
        case "new":
            localComponent.value.status = "equal";
            break;
        default:
            localComponent.value.status = "equal";
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
        <!-- Checkbox -->
        <td class="cell-checkbox">
            <input
                type="checkbox"
                :checked="localComponent.isSelected"
                @change="handleCheckbox"
                class="checkbox-input"
            />
        </td>

        <!-- Status -->
        <td class="cell-status">
            <StatusBadge :status="status" @toggle="toggleStatus" />
        </td>

        <!-- Position -->
        <td class="cell-pos">
            <input
                v-model="localComponent.pos"
                @blur="handleBlur"
                class="input-field input-pos"
                placeholder="-"
            />
        </td>

        <!-- Description -->
        <td class="cell-description">
            <input
                v-model="localComponent.description"
                @blur="handleBlur"
                class="input-field input-description"
                placeholder="Component description"
            />
        </td>

        <!-- ОБНОВЛЕНО: Material (PDF) - редактируемая строка -->
        <td class="cell-material">
            <input
                v-model="localComponent.material"
                @blur="handleBlur"
                class="input-field input-material"
                placeholder="Material from PDF"
            />
        </td>

        <!-- НОВОЕ: BOM Material - только чтение -->
        <td class="cell-bom-material">
            <span class="read-only-field">
                {{ localComponent.bom_material || "-" }}
            </span>
        </td>

        <!-- НОВОЕ: Order Material - только чтение -->
        <td class="cell-order-material">
            <span class="read-only-field">
                {{ localComponent.order_material || "-" }}
            </span>
        </td>

        <!-- ОБНОВЛЕНО: Quantity (BOM) - редактируемое число -->
        <td class="cell-quantity">
            <input
                v-model.number="localComponent.quantity"
                type="number"
                @blur="handleBlur"
                class="input-field input-quantity"
                min="0"
                placeholder="0"
            />
        </td>

        <!-- НОВОЕ: Manager Quantity - только чтение -->
        <td class="cell-manager-qty">
            <span class="read-only-field">
                {{ localComponent.manager_quantity || "-" }}
            </span>
        </td>

        <!-- Note -->
        <td class="cell-note">
            <input
                v-model="localComponent.note"
                @blur="handleBlur"
                class="input-field input-note"
                placeholder="Note"
            />
        </td>

        <!-- Actions -->
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

<style scoped>
.read-only-field {
    display: block;
    padding: 0.5rem;
    color: #666;
    font-style: italic;
    background: #f5f5f5;
    border-radius: 0.25rem;
    text-align: center;
}

.cell-bom-material,
.cell-order-material,
.cell-manager-qty {
    background: #fafafa;
}
</style>
