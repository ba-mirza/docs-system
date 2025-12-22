<script setup lang="ts">
import { computed } from "vue";

interface Props {
    status: "equal" | "notEqual" | "new" | "unknown";
    editable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    editable: true,
});

const emit = defineEmits<{
    toggle: [];
}>();

const icon = computed(() => {
    switch (props.status) {
        case "equal":
            return "✅";
        case "notEqual":
            return "❌";
        case "new":
            return "🆕";
        default:
            return "⚪";
    }
});

const label = computed(() => {
    switch (props.status) {
        case "equal":
            return "Equal";
        case "notEqual":
            return "Not Equal";
        case "new":
            return "New Item";
        default:
            return "Unknown";
    }
});

const badgeClass = computed(() => {
    return `badge-${props.status}`;
});

const handleClick = () => {
    if (props.editable) {
        emit("toggle");
    }
};
</script>

<template>
    <button
        type="button"
        class="status-badge"
        :class="[badgeClass, { 'badge-editable': editable }]"
        @click="handleClick"
        :title="editable ? 'Click to toggle status' : label"
        :disabled="!editable"
    >
        <span class="badge-icon">{{ icon }}</span>
        <span class="badge-label">{{ label }}</span>
    </button>
</template>
