<template>
    <div class="time-wrapper">
        <TimeSelector v-model="start" :position="'start'" />
        <div class="time-divider"></div>
        <TimeSelector v-model="end" :position="'end'" />
    </div>

    <div class="auto-range">
        <div 
            v-for="option in autoRangeOptions" :key="option.value"
            :class="{
                // 'option-active': selectedAutoRange === option.value
            }"
            class="option"
            @click="selectedAutoRange = option.value"
        >
            {{ option.label }}
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import TimeSelector from './TimeSelector.vue';

const emit = defineEmits(['update']);

const now = new Date();
now.setFullYear(now.getFullYear() - 100);

const start = ref(null)
const end = ref(null)
const selectedAutoRange = ref(null)

const autoRangeOptions = ref([
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last 60 Days', value: '60d' },
    { label: 'Last Year', value: '1y' }
])

watch([start, end], _ => {
    emit('update', { start: start.value, end: end.value })
});

watch(selectedAutoRange, (newValue) => {
    const now = new Date();
    let pastDate;

    if (newValue === '30d') {
        pastDate = new Date();
        pastDate.setDate(now.getDate() - 30);
    } else if (newValue === '60d') {
        pastDate = new Date();
        pastDate.setDate(now.getDate() - 60);
    } else if (newValue === '1y') {
        pastDate = new Date();
        pastDate.setFullYear(now.getFullYear() - 1);
    }

    if (!pastDate) return;

    start.value = formatLocal(pastDate);
    end.value = formatLocal(now);
})

function pad2(n) {
    return n < 10 ? '0' + n : n;
}
function formatLocal(d) {
    const y = d.getFullYear();
    const m = pad2(d.getMonth() + 1);
    const day = pad2(d.getDate());
    const hh = pad2(d.getHours());
    const mm = pad2(d.getMinutes());
    const ss = pad2(d.getSeconds());
    return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
}

onMounted(() => {

    // Initialize to last 20 years
    const now = new Date();
    now.setFullYear(now.getFullYear() - 20);
    start.value = formatLocal(now);
    end.value = formatLocal(new Date());
});

</script>

<style scoped>
.time-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.time-divider {
    height: 1px;
    background-color: black;
    width: 14px
}

.auto-range {
    display: flex;
    justify-content: flex-start;
    gap: 12px;
    align-items: center;
    margin-top: 12px;
}

.option {
    padding: 6px 12px;
    border: solid 1px #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    user-select: none;
    font-weight: 500;
}

.option-active {
    background-color: rgb(33, 33, 33);
    color: white;
    border: solid 1px #d1d5db;
}
</style>