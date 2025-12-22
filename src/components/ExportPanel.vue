<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useParserStore } from "../stores/parser.store";

const store = useParserStore();
const { statistics, isLoading, editableComponents } = storeToRefs(store);
const { exportToExcel, saveDraft, loadDraft } = store;

const canExport = computed(
    () => editableComponents.value.length > 0 && !isLoading.value,
);

const handleExport = async () => {
    if (!canExport.value) return;
    await exportToExcel();
};

const handleSaveDraft = () => {
    saveDraft();
    alert("✅ Draft saved successfully!");
};

const handleLoadDraft = () => {
    const loaded = loadDraft();
    if (loaded) {
        alert("✅ Draft loaded successfully!");
    } else {
        alert("⚠️ No saved draft found");
    }
};
</script>

<template>
    <div class="export-panel">
        <div class="stats-dashboard">
            <h3 class="dashboard-title">📊 Summary Statistics</h3>

            <div class="stats-grid">
                <div class="stat-card stat-total">
                    <div class="stat-icon">📦</div>
                    <div class="stat-content">
                        <span class="stat-label">Total Components</span>
                        <span class="stat-value">{{ statistics.total }}</span>
                    </div>
                </div>

                <div class="stat-card stat-equal">
                    <div class="stat-icon">✅</div>
                    <div class="stat-content">
                        <span class="stat-label">Equal</span>
                        <span class="stat-value">{{ statistics.equal }}</span>
                    </div>
                    <div class="stat-percentage">
                        {{
                            statistics.total > 0
                                ? Math.round(
                                      (statistics.equal / statistics.total) *
                                          100,
                                  )
                                : 0
                        }}%
                    </div>
                </div>

                <div class="stat-card stat-not-equal">
                    <div class="stat-icon">❌</div>
                    <div class="stat-content">
                        <span class="stat-label">Not Equal</span>
                        <span class="stat-value">{{
                            statistics.notEqual
                        }}</span>
                    </div>
                    <div class="stat-percentage">
                        {{
                            statistics.total > 0
                                ? Math.round(
                                      (statistics.notEqual / statistics.total) *
                                          100,
                                  )
                                : 0
                        }}%
                    </div>
                </div>

                <div class="stat-card stat-new">
                    <div class="stat-icon">🆕</div>
                    <div class="stat-content">
                        <span class="stat-label">New Items</span>
                        <span class="stat-value">{{
                            statistics.newItems
                        }}</span>
                    </div>
                    <div class="stat-percentage">
                        {{
                            statistics.total > 0
                                ? Math.round(
                                      (statistics.newItems / statistics.total) *
                                          100,
                                  )
                                : 0
                        }}%
                    </div>
                </div>
            </div>
        </div>

        <div class="actions-section">
            <h3 class="actions-title">💾 Export & Save</h3>

            <div class="actions-grid">
                <button
                    @click="handleSaveDraft"
                    class="action-button action-save"
                    :disabled="!canExport"
                >
                    <span class="action-icon">💾</span>
                    <div class="action-content">
                        <span class="action-label">Save Draft</span>
                        <span class="action-description"
                            >Save current state to browser</span
                        >
                    </div>
                </button>

                <button
                    @click="handleLoadDraft"
                    class="action-button action-load"
                >
                    <span class="action-icon">📂</span>
                    <div class="action-content">
                        <span class="action-label">Load Draft</span>
                        <span class="action-description"
                            >Restore saved state</span
                        >
                    </div>
                </button>

                <button
                    @click="handleExport"
                    class="action-button action-export"
                    :disabled="!canExport"
                >
                    <span class="action-icon">📥</span>
                    <div class="action-content">
                        <span class="action-label">Export to Excel</span>
                        <span class="action-description"
                            >Download XLSX with your edits</span
                        >
                    </div>
                </button>
            </div>

            <div v-if="isLoading" class="loading-indicator">
                <div class="spinner"></div>
                <span>Processing export...</span>
            </div>
        </div>

        <div class="info-box">
            <div class="info-icon">💡</div>
            <div class="info-content">
                <p class="info-title">Export Information</p>
                <p class="info-text">Your Excel file will include:</p>
                <ul class="info-list">
                    <li>✅ All your edits and changes</li>
                    <li>✅ Color-coded status indicators</li>
                    <li>✅ Technical parameters section</li>
                    <li>✅ Statistics summary</li>
                    <li>✅ Legend with status meanings</li>
                </ul>
            </div>
        </div>
    </div>
</template>
