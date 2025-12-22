<script setup lang="ts">
import { ref, onMounted } from "vue";

const apiKey = ref("");
const isSaved = ref(false);
const isLoading = ref(true);

onMounted(async () => {
    const saved = localStorage.getItem("claude_api_key");
    if (saved) {
        apiKey.value = saved;
        isSaved.value = true;
    }
    isLoading.value = false;
});

const saveApiKey = () => {
    if (!apiKey.value.trim()) {
        alert("Please enter an API key");
        return;
    }

    localStorage.setItem("claude_api_key", apiKey.value.trim());
    isSaved.value = true;
};

const resetApiKey = () => {
    if (confirm("Are you sure you want to reset the API key?")) {
        localStorage.removeItem("claude_api_key");
        apiKey.value = "";
        isSaved.value = false;
    }
};

defineExpose({ isSaved });
</script>

<template>
    <div v-if="!isLoading && !isSaved" class="api-key-setup">
        <div class="setup-card">
            <h2>🔑 API Key Required</h2>
            <p>Please enter your Claude API key to continue:</p>

            <input
                v-model="apiKey"
                type="password"
                placeholder="sk-ant-..."
                class="api-key-input"
                @keyup.enter="saveApiKey"
            />

            <button @click="saveApiKey" class="save-button">
                Save & Continue
            </button>

            <p class="help-text">
                Get your API key from:
                <a href="https://console.anthropic.com/" target="_blank">
                    console.anthropic.com
                </a>
            </p>
        </div>
    </div>

    <div v-else-if="isSaved" class="api-key-status">
        <span>✅ API Key configured</span>
        <button @click="resetApiKey" class="reset-button">Reset</button>
    </div>
</template>

<style scoped>
.api-key-setup {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.setup-card {
    background: white;
    padding: 2rem;
    border-radius: 0.25rem;
    border: 2px solid #999;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.setup-card h2 {
    margin: 0 0 1rem 0;
    color: #333;
    font-family: Tahoma, Arial, sans-serif;
}

.setup-card p {
    color: #555;
    margin-bottom: 1rem;
}

.api-key-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #999;
    border-radius: 0.25rem;
    font-family: monospace;
    font-size: 0.9rem;
    margin-bottom: 1rem;
}

.api-key-input:focus {
    outline: none;
    border-color: #5b84b1;
    box-shadow: 0 0 0 2px rgba(91, 132, 177, 0.2);
}

.save-button {
    width: 100%;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(to bottom, #5b84b1, #4a6fa5);
    color: white;
    border: 1px solid #3a5a85;
    border-radius: 0.25rem;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.save-button:hover {
    background: linear-gradient(to bottom, #6a94c1, #5b84b1);
}

.help-text {
    margin-top: 1rem;
    font-size: 0.85rem;
    text-align: center;
}

.help-text a {
    color: #5b84b1;
    text-decoration: none;
}

.api-key-status {
    position: fixed;
    top: 1rem;
    right: 1rem;
    background: #e8f8e8;
    padding: 0.5rem 1rem;
    border: 1px solid #8b8;
    border-radius: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    z-index: 1000;
}

.reset-button {
    padding: 0.25rem 0.5rem;
    background: #ffe0e0;
    border: 1px solid #c88;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    cursor: pointer;
}
</style>
