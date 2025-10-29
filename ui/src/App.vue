<template>
    <Popup>
        <template #default="{ show }">
            <button class="btn" @click="show">Open Estimated Savings</button>
        </template>
    </Popup>
</template>

<script setup>
import Popup from './components/MainPopup.vue';
</script>

<style scoped>

</style>
