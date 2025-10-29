<template>
    <div class="kpi-card" role="group">
        <div class="kpi-head">
            <div class="kpi-title">Estimated {{savingType}} savings</div>

            <div class="kpi-subtitle">
                <span>Sum of selected date range</span>
            </div>
        </div>

        <div class="kpi-body">
            <span class="kpi-value" :class="[`text-${config[savingType].color}`]">{{ formattedValue }}</span>
            <span class="kpi-unit" :class="[`text-${config[savingType].color}`]">{{ unit }}</span>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    savingType: { type: String, default: 'carbon' },  
    value: { type: [Number, String], default: 64.1 },
    unit: { type: String, default: 'Tonnes' },
    decimals: { type: Number, default: 1 },   // number of decimals for value
})

const config = {
    carbon: { 
        color: 'carbon' 
    },
    diesel: { color: 'diesel' }
}

const formattedValue = computed(() => {
    const num = Number(props.value)
    if (Number.isNaN(num)) return String(props.value ?? '')
    return num.toLocaleString(undefined, {
        minimumFractionDigits: props.decimals,
        maximumFractionDigits: props.decimals
    })
})
</script>

<style scoped>
/* Root card */
.kpi-card {
    --kpi-teal: #28c6b8; /* accent similar to screenshot */
    --kpi-text: #21242a;
    --kpi-muted: #828a94;
    --kpi-bg: #ffffff;

    align-items: center;
    margin-top: 12px;
}

/* Header */
.kpi-head {
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: center;
}

.kpi-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--kpi-text);
    line-height: 1.25;
}

.kpi-subtitle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--kpi-muted);
}

/* Info & Tooltip */
.kpi-info {
    position: relative;
    display: inline-flex;
    align-items: center;
    color: var(--kpi-muted);
    cursor: default;
    outline: none;
}

.kpi-info__icon {
    display: block;
}

.kpi-info:focus .kpi-tooltip,
.kpi-info:hover .kpi-tooltip {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
}

.kpi-tooltip {
    position: absolute;
    left: 50%;
    bottom: 150%;
    transform: translate(-50%, 4px);
    opacity: 0;
    pointer-events: none;
    transition: opacity 120ms ease, transform 120ms ease;
    background: #101828;
    color: #fff;
    font-size: 11px;
    line-height: 1.3;
    padding: 6px 8px;
    border-radius: 6px;
    white-space: nowrap;
    z-index: 10;
    box-shadow: 0 6px 18px rgba(16, 24, 40, 0.18);
}

.kpi-tooltip::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: #101828;
}

/* Body */
.kpi-body {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.kpi-value {
    font-size: 20px;
    line-height: 1.1;
    font-weight: 400;
    color: var(--kpi-teal);
    letter-spacing: -0.02em;
}

.kpi-unit {
    margin-top: 4px;
    font-size: 14px;
    color: var(--kpi-teal);
    font-weight: 500;
}

/* Small screens */
@media (max-width: 420px) {
    .kpi-card { width: 100%; }
    .kpi-value { font-size: 34px; }
}
</style>
