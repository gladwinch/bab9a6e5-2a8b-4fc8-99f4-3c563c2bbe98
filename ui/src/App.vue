<template>
    <div class="app-container">
        <Popup>
            <template #default="{ show }">
                <button class="btn" @click="show">Open Estimated Savings</button>
            </template>
        </Popup>
    </div>
</template>

<script setup>
import Popup from './components/MainPopup.vue';
</script>

<style scoped>
    .app-container {
        height: 100dvh;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .btn {
        padding: 12px 24px;
        font-size: 16px;
        background-color: #0fa385;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }
</style>
