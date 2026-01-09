<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useParserStore } from "./stores/parser.store";

import FileUploadForm from "./components/FileUploadForm.vue";
import ParsingProgress from "./components/ParsingProgress.vue";
import TechnicalParamsCard from "./components/TechnicalParamsCard.vue";
import ExportPanel from "./components/ExportPanel.vue";
import EditableResultTable from "./components/EditableResultTable.vue";

const store = useParserStore();
const { parseResult, isLoading, error, technicalParams } = storeToRefs(store);

const { reset } = store;

const hasResults = computed(() => parseResult.value !== null);

const handleReset = () => {
    if (
        confirm("Are you sure you want to start over? All edits will be lost.")
    ) {
        reset();
    }
};
</script>

<template>
    <div class="app-container">
        <header class="app-header">
            <div class="header-content">
                <div class="header-left">
                    <h1 class="app-title">ECV Analyzer</h1>
                    <p class="app-subtitle">Edit & Export</p>
                </div>

                <button
                    v-if="hasResults && !isLoading"
                    @click="handleReset"
                    class="btn-reset"
                >
                    Start Over
                </button>
            </div>
        </header>

        <main class="app-main">
            <div class="content-wrapper">
                <div v-if="error && !isLoading" class="error-banner">
                    <div class="error-icon">❌</div>
                    <div class="error-content">
                        <h3 class="error-title">Error Occurred</h3>
                        <p class="error-message">{{ error }}</p>
                    </div>
                    <button @click="error = null" class="error-close">✕</button>
                </div>

                <section
                    v-if="!hasResults && !isLoading"
                    class="upload-section"
                >
                    <FileUploadForm />
                </section>

                <ParsingProgress />

                <section
                    v-if="hasResults && !isLoading"
                    class="results-section"
                >
                    <div class="success-banner">
                        <div class="success-icon">✅</div>
                        <div class="success-content">
                            <h3 class="success-title">Parsing Complete!</h3>
                            <p class="success-message">
                                Review the results below, make any necessary
                                edits, and export to Excel when ready.
                            </p>
                        </div>
                    </div>

                    <TechnicalParamsCard :params="technicalParams" />
                    <EditableResultTable />
                    <ExportPanel />
                </section>
            </div>
        </main>

        <footer class="app-footer">
            <p class="footer-text">Made by today.development</p>
        </footer>
    </div>
</template>
