<template>
    <!-- Single (default) slot: parent provides the activator button -->
    <slot :show="show" :hide="hide" :toggle="toggle" />

    <Teleport to="body">
        <!-- Backdrop -->
        <div
            v-if="open"
            class="popup-overlay"
            @click.self="hide"
            @keydown.esc.prevent.stop="hide"
        ></div>

        <!-- Dialog -->
        <div v-if="open" class="popup-wrapper" role="dialog">
            <div class="popup-card" ref="cardRef" tabindex="-1">
                <!-- <button class="popup-close" aria-label="Close" @click="hide">×</button> -->
                <div class="header-wrapper">
                    <div class="header-title">Estimated carbon savings and diesel savings</div>
                    <button class="close-btn" aria-label="Close" @click="hide">×</button>
                </div>
                <div class="popup-body">
                    <p class="sub-text">Download general guidelines on the estimated carbon & diesel savings calculations</p>
                
                    <Divider />
                    <EstimatedSavings
                        v-if="estimatedData"
                        savingType="carbon"
                        unit="Tonnes"
                        :subtitle="'1 Tonne = 1,000 kg'"
                        :total="estimatedData.carbon_saved"
                        :monthly="estimatedData.avg_monthly_carbon_saved"
                    />

                    <Divider />

                    <EstimatedSavings
                        v-if="estimatedData"
                        savingType="diesel"
                        unit="Litres"
                        :subtitle="''"
                        :total="estimatedData.fueld_saved"
                        :monthly="estimatedData.avg_monthly_fueld_saved"
                    />

                    <Divider />
                    <GraphInput @update="inputUpdate" />

                    <div class="kpi-wrapper">
                        <KpiMetric
                            savingType="carbon"
                            :value="graphData.totalCarbon"
                            unit="Tonnes"
                            :decimals="1"
                        />

                        <KpiMetric
                            savingType="diesel"
                            :value="graphData.totalDiesel"
                            unit="Litres"
                            :decimals="1"
                        />
                    </div>

                    <SavingsDualBar 
                        :gdata="graphData"
                        :categories="['Carbon savings', 'Diesel savings']"
                    />
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref, nextTick, onBeforeUnmount, computed, onMounted } from 'vue';
import EstimatedSavings from './EstimatedSavings.vue';
import GraphInput from './GraphInput.vue';
import Divider from './Divider.vue';
import KpiMetric from './KpiMetric.vue';
import SavingsDualBar from './SavingsDualBar.vue';

import useAxios from '../composables/useAxios.js';

const props = defineProps({
    lockScroll: { type: Boolean, default: true }
});

const open = ref(true);
const cardRef = ref(null);
let lastActive = null;

// graph data
const monthlyData = ref([]);
const totalData = ref({})
const estimatedData = ref(null)

const fetchEstimatedSavings = async () => {
    const { data, error } = await useAxios('/api/estimate/total-savings')

    if (error) {
        console.error('Error fetching estimated savings:', error);
        return;
    }

    console.log('Estimated savings data-----:', data);
    estimatedData.value = data
}

function show() {
    if (open.value) return;
    open.value = true;
    lastActive = document.activeElement;
    document.body.style.overflow = 'hidden';
    nextTick(() => cardRef.value?.focus?.());
}
function hide() {
    if (!open.value) return;
    open.value = false;
    document.body.style.overflow = '';
    lastActive?.focus?.();
}
function toggle() { open.value ? hide() : show(); }

onBeforeUnmount(() => {
    document.body.style.overflow = '';
})

defineExpose({ show, hide, toggle, open });

const inputUpdate = async (payload) => {
    const { start, end } = normalizeRangeToIsoZ(payload);
    const { data, error } = await useAxios('/api/estimate/savings', {
        method: 'GET',
        params: { start, end }
    })

    if (error) {
        console.error('Error fetching estimated savings:', error);
        return;
    }

    monthlyData.value = data.monthly || [];
    totalData.value = data.overall || {};
}

function normalizeRangeToIsoZ({ start, end }) {
	// Parse "YYYY-MM-DD HH:mm:ss" or ISO; return ISO Z or throw on bad input
	const toIsoZ = (s) => {
		if (!s) throw new Error("Missing date value");
		// If already ISO-ish (has 'T'), trust Date parser and convert to ISO
		if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
			const d = new Date(s);
			if (isNaN(d)) throw new Error(`Invalid ISO date: ${s}`);
			return d.toISOString();
		}
		// Expected "YYYY-MM-DD HH:mm:ss" (space or 'T' allowed as separator)
		const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/.exec(s);
		if (!m) throw new Error(`Unsupported date format: ${s}`);
		const [_, yy, mm, dd, HH, MM, SS] = m.map(Number);
		// Construct as LOCAL time so timezone is applied when converting to UTC
		const d = new Date(yy, mm - 1, dd, HH, MM, SS, 0);
		if (isNaN(d)) throw new Error(`Invalid date components: ${s}`);
		return d.toISOString();
	};

	return {
		start: toIsoZ(start),
		end: toIsoZ(end),
	};
}

const graphData = computed(() => {
    const mdata = monthlyData.value

    return {
        months: mdata.map(d => d.month),
        carbonTonnes: mdata.map(d => d.carbon_saved),
        dieselLitres: mdata.map(d => d.fueld_saved),
        carbonMax: Math.ceil(Math.max(...mdata.map(d => d.carbon_saved)) * 1.2),
        dieselMax: Math.ceil(Math.max(...mdata.map(d => d.fueld_saved)) * 1.2),
        totalCarbon: mdata.reduce((acc, d) => acc + d.carbon_saved, 0),
        totalDiesel: mdata.reduce((acc, d) => acc + d.fueld_saved, 0),
        // base on number of items in months
        barWidth: Math.ceil(280 / mdata.length)
    }
})

onMounted(() => {
    fetchEstimatedSavings();
})
</script>

<style scoped>
/* Backdrop */
.popup-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 1000;
}

/* Center wrapper */
.popup-wrapper {
    position: fixed; inset: 0;
    display: flex; align-items: center; justify-content: center;
    padding: 2rem;
    z-index: 1001;
}

/* Card */
.popup-card {
    background: #fff;
    border-radius: 12px;
    width: min(1000px, 92vw);
    box-shadow: 0 16px 40px rgba(0,0,0,.18);
    position: relative;
    outline: none;
}

/* Header + Body */
.header-wrapper {
    padding: 16px 20px 12px;
    background-color: #E9FBF7;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
}

.header-title {
    font-size: 20px;
    color: #0DCFA7;
    font-weight: 500;
}

.close-btn {
    border: none;
    background: transparent;
    font-size: 1.8rem;
    line-height: 1;
    color: #878d99;
    cursor: pointer;
    font-weight: 300;
    transform: translateY(-4px) translateX(4px);
}

.popup-body {
    padding: 16px 20px 20px;
    color: #374151;
    max-height: 80dvh;
    overflow-y: scroll;
}

.popup-body::-webkit-scrollbar {
    width: 6px;
    transform: translateX(4px);
}

.popup-body::-webkit-scrollbar-track {
    background: transparent;
    transform: translateX(4px);
}

.popup-body::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
}

.popup-body::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.3);
}


.sub-text {
    font-size: 14px;
    color: #6b7280;
    margin: 2px 0;
    color: #0DCFA7;
}

/* Close button */
.popup-close {
    position: absolute; top: 8px; right: 10px;
    border: none; background: transparent; cursor: pointer;
    font-size: 1.4rem; line-height: 1; color: #6b7280;
}
.popup-close:hover { color: #111827; }

.kpi-wrapper {
    display: flex;
    justify-content: space-around;
    margin-top: 5px;
}
</style>
