<script setup lang="ts">
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { useParserStore } from "../stores/parser.store";
import EditableRow from "./EditableRow.vue";

const store = useParserStore();
const { editableComponents, statistics } = storeToRefs(store);
const {
    updateComponent,
    deleteComponent,
    addNewComponent,
    deleteSelected,
    toggleSelection,
    selectAll,
} = store;

const filterType = ref<"all" | "equal" | "notEqual" | "new">("all");
const searchQuery = ref("");
const selectAllChecked = ref(false);

const filteredComponents = computed(() => {
    let filtered = editableComponents.value;

    if (filterType.value !== "all") {
        filtered = filtered.filter((comp) => {
            switch (filterType.value) {
                case "equal":
                    return comp.material.isEqual === true;
                case "notEqual":
                    return comp.material.isEqual === false;
                case "new":
                    return comp.material.new_item === true;
                default:
                    return true;
            }
        });
    }

    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter((comp) => {
            return (
                comp.description?.toLowerCase().includes(query) ||
                comp.material.value?.toLowerCase().includes(query) ||
                comp.material.from_manager_data
                    ?.toLowerCase()
                    .includes(query) ||
                comp.pos?.toLowerCase().includes(query)
            );
        });
    }

    return filtered;
});

const hasComponents = computed(() => editableComponents.value.length > 0);
const hasFiltered = computed(() => filteredComponents.value.length > 0);
const selectedCount = computed(
    () => editableComponents.value.filter((c) => c.isSelected).length,
);

const handleSelectAll = () => {
    selectAllChecked.value = !selectAllChecked.value;
    selectAll(selectAllChecked.value);
};

const handleAddRow = () => {
    addNewComponent();
};

const handleDeleteSelected = () => {
    if (selectedCount.value === 0) {
        alert("Please select components to delete");
        return;
    }

    if (confirm(`Delete ${selectedCount.value} selected component(s)?`)) {
        deleteSelected();
        selectAllChecked.value = false;
    }
};

const handleUpdate = (component: any) => {
    updateComponent(component.id, component);
};

const handleDelete = (id: string) => {
    deleteComponent(id);
};

const handleToggleSelect = (id: string) => {
    toggleSelection(id);
};
</script>

<template>
    <div class="results-table-container">
        <div class="table-header">
            <div class="header-content">
                <h2 class="table-title">
                    ✏️ Editable Results
                    <span class="component-count"
                        >({{ statistics.total }} components)</span
                    >
                </h2>

                <div class="stats-pills">
                    <div class="stat-pill stat-total">
                        Total: <strong>{{ statistics.total }}</strong>
                    </div>
                    <div class="stat-pill stat-equal">
                        ✅ Equal: <strong>{{ statistics.equal }}</strong>
                    </div>
                    <div class="stat-pill stat-not-equal">
                        ❌ Not Equal: <strong>{{ statistics.notEqual }}</strong>
                    </div>
                    <div class="stat-pill stat-new">
                        🆕 New: <strong>{{ statistics.newItems }}</strong>
                    </div>
                </div>
            </div>
        </div>

        <div class="toolbar">
            <div class="toolbar-left">
                <!-- Search -->
                <div class="search-box">
                    <span class="search-icon">🔍</span>
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Search components..."
                        class="search-input"
                    />
                </div>

                <select v-model="filterType" class="filter-select">
                    <option value="all">All Components</option>
                    <option value="equal">✅ Equal Only</option>
                    <option value="notEqual">❌ Not Equal Only</option>
                    <option value="new">🆕 New Items Only</option>
                </select>
            </div>

            <div class="toolbar-right">
                <button @click="handleAddRow" class="btn-add">
                    <span>➕</span>
                    <span>Add Row</span>
                </button>

                <button
                    @click="handleDeleteSelected"
                    class="btn-delete-selected"
                    :disabled="selectedCount === 0"
                >
                    <span>🗑️</span>
                    <span>Delete ({{ selectedCount }})</span>
                </button>
            </div>
        </div>

        <div v-if="hasComponents" class="table-wrapper">
            <table class="results-table">
                <thead class="table-head">
                    <tr>
                        <th class="th-checkbox">
                            <input
                                type="checkbox"
                                :checked="selectAllChecked"
                                @change="handleSelectAll"
                                class="checkbox-input"
                            />
                        </th>
                        <th class="th-status">Status</th>
                        <th class="th-pos">Pos</th>
                        <th class="th-description">Description</th>
                        <th class="th-material">Material (PDF)</th>
                        <th class="th-manager">Manager Data</th>
                        <th class="th-quantity">Qty</th>
                        <th class="th-note">Note</th>
                        <th class="th-actions">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <EditableRow
                        v-for="comp in filteredComponents"
                        :key="comp.id"
                        :component="comp"
                        @update="handleUpdate"
                        @delete="() => handleDelete(comp.id)"
                        @toggle-select="() => handleToggleSelect(comp.id)"
                    />
                </tbody>
            </table>

            <div v-if="!hasFiltered" class="no-results">
                <div class="no-results-icon">🔍</div>
                <p class="no-results-text">No components match your filters</p>
                <button
                    @click="
                        filterType = 'all';
                        searchQuery = '';
                    "
                    class="btn-clear-filters"
                >
                    Clear Filters
                </button>
            </div>
        </div>

        <div v-else class="empty-state">
            <div class="empty-icon">📋</div>
            <h3 class="empty-title">No Components Yet</h3>
            <p class="empty-text">Upload and parse files to see results here</p>
        </div>

        <div v-if="hasComponents" class="legend">
            <h4 class="legend-title">Legend:</h4>
            <div class="legend-items">
                <div class="legend-item">
                    <div class="legend-color legend-equal"></div>
                    <span
                        >✅ Equal - Materials match between PDF and
                        Manager</span
                    >
                </div>
                <div class="legend-item">
                    <div class="legend-color legend-not-equal"></div>
                    <span>❌ Not Equal - Materials do not match</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color legend-new"></div>
                    <span>🆕 New Item - Found only in Manager Excel</span>
                </div>
            </div>
        </div>
    </div>
</template>
