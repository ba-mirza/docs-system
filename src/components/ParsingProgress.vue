<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useParserStore } from "../stores/parser.store";

const store = useParserStore();
const { isLoading, error } = storeToRefs(store);

const progress = ref(0);
const currentStep = ref(0);

const steps = [
    { id: 1, label: "Uploading files...", progress: 10 },
    { id: 2, label: "Converting PDF to image...", progress: 25 },
    { id: 3, label: "Parsing drawing with AI...", progress: 45 },
    { id: 4, label: "Validating BOM data...", progress: 65 },
    { id: 5, label: "Parsing Manager Excel...", progress: 80 },
    { id: 6, label: "Comparing materials...", progress: 95 },
    { id: 7, label: "Finalizing results...", progress: 100 },
];

const statusMessage = computed(() => {
    if (error.value) return "❌ Error occurred";
    if (currentStep.value < steps.length) {
        return steps[currentStep.value]?.label;
    }
    return "✅ Parsing complete!";
});

watch(isLoading, (newVal) => {
    if (newVal) {
        progress.value = 0;
        currentStep.value = 0;
        simulateProgress();
    }
});

const closeErrorModal = () => {
    error.value = null;
};

const simulateProgress = () => {
    const interval = setInterval(() => {
        if (!isLoading.value) {
            clearInterval(interval);
            progress.value = 100;
            currentStep.value = steps.length - 1;
            return;
        }

        if (currentStep.value < steps.length - 1) {
            currentStep.value++;
            progress.value = steps[currentStep.value]?.progress || 0;
        }
    }, 800);
};
</script>

<template>
    <div v-if="isLoading || error" class="progress-container">
        <div class="progress-card">
            <div class="progress-header">
                <div class="spinner-container">
                    <div v-if="!error" class="spinner"></div>
                    <button
                        v-else
                        @click="closeErrorModal"
                        class="error-icon cursor-pointer"
                    >
                        ❌
                    </button>
                </div>
                <h3 class="progress-title">
                    {{ error ? "Parsing Failed" : "Parsing in Progress" }}
                </h3>
            </div>

            <div v-if="!error" class="progress-bar-container">
                <div class="progress-bar-bg">
                    <div
                        class="progress-bar-fill"
                        :style="{ width: `${progress}%` }"
                    >
                        <span class="progress-percentage">{{ progress }}%</span>
                    </div>
                </div>
            </div>

            <div class="status-message" :class="{ 'status-error': error }">
                <p>{{ error || statusMessage }}</p>
            </div>

            <div v-if="!error" class="steps-indicator">
                <div
                    v-for="(step, index) in steps"
                    :key="step.id"
                    class="step-item"
                    :class="{
                        'step-active': index === currentStep,
                        'step-completed': index < currentStep,
                    }"
                >
                    <div class="step-circle">
                        <span v-if="index < currentStep">✓</span>
                        <span v-else>{{ step.id }}</span>
                    </div>
                    <span class="step-label">{{ step.label }}</span>
                </div>
            </div>

            <div v-if="!error" class="estimated-time">
                <span class="text-gray-600">
                    ⏱️ Estimated time: ~10-15 seconds
                </span>
            </div>
        </div>
    </div>
</template>
