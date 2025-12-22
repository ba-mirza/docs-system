<script setup lang="ts">
import { computed } from "vue";

interface Props {
    params: Record<string, string>;
}

const props = defineProps<Props>();

const mainParams = computed(() => [
    { label: "Size", value: props.params.SIZE, icon: "📏" },
    { label: "ASME Class", value: props.params.ASME, icon: "⚙️" },
    { label: "Ends", value: props.params.ENDS, icon: "🔩" },
]);

const dimensions = computed(() =>
    [
        { label: "L", value: props.params.L },
        { label: "Ød", value: props.params.Ød || props.params["Ød"] },
        { label: "ØF", value: props.params.ØF || props.params["ØF"] },
        { label: "H", value: props.params.H },
        { label: "Weight", value: props.params.WEIGHT },
    ].filter((item) => item.value),
);

const technicalParams = computed(() =>
    [
        {
            label: "Design Temperature",
            value: props.params.DESIGN_TEMP,
            icon: "🌡️",
            color: "blue",
        },
        {
            label: "Design Pressure",
            value: props.params.DESIGN_PRESSURE,
            icon: "💨",
            color: "purple",
        },
        {
            label: "Pressure Test (Body)",
            value: props.params.PRESSURE_TEST_BODY,
            icon: "🔧",
            color: "green",
        },
        {
            label: "Pressure Test (Seat)",
            value: props.params.PRESSURE_TEST_SEAT,
            icon: "🔧",
            color: "green",
        },
    ].filter((item) => item.value),
);

const hasTechnicalParams = computed(() => technicalParams.value.length > 0);
</script>

<template>
    <div class="tech-params-container">
        <div class="card-header">
            <h2 class="card-title">📊 Technical Parameters</h2>
            <span class="card-badge">Drawing Specs</span>
        </div>

        <div class="params-section">
            <h3 class="section-title">Main Specifications</h3>
            <div class="params-grid main-grid">
                <div
                    v-for="param in mainParams"
                    :key="param.label"
                    class="param-card main-param"
                >
                    <div class="param-icon">{{ param.icon }}</div>
                    <div class="param-content">
                        <span class="param-label">{{ param.label }}</span>
                        <span class="param-value highlight">{{
                            param.value || "-"
                        }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="dimensions.length > 0" class="params-section">
            <h3 class="section-title">Dimensions</h3>
            <div class="params-grid dimensions-grid">
                <div
                    v-for="dim in dimensions"
                    :key="dim.label"
                    class="param-card dimension-param"
                >
                    <span class="param-label">{{ dim.label }}</span>
                    <span class="param-value">{{ dim.value }}</span>
                </div>
            </div>
        </div>

        <div v-if="hasTechnicalParams" class="params-section">
            <h3 class="section-title">
                🔬 Technical Specifications
                <span class="new-badge">NEW</span>
            </h3>
            <div class="tech-params-list">
                <div
                    v-for="param in technicalParams"
                    :key="param.label"
                    class="tech-param-item"
                    :class="`tech-param-${param.color}`"
                >
                    <div class="tech-param-header">
                        <span class="tech-param-icon">{{ param.icon }}</span>
                        <span class="tech-param-label">{{ param.label }}</span>
                    </div>
                    <div class="tech-param-value">
                        {{ param.value }}
                    </div>
                </div>
            </div>
        </div>

        <div v-if="Object.keys(params).length === 0" class="empty-state">
            <div class="empty-icon">📭</div>
            <p class="empty-text">No technical parameters available</p>
        </div>
    </div>
</template>
