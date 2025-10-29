<template>
	<div class="sc-wrapper">
		<!-- Optional small titles to mirror the screenshot -->
		<div class="sc-axis-labels">
			<span class="sc-axis-left">tonnes</span>
			<span class="sc-axis-right">Litres</span>
		</div>

		<!-- Chart canvas -->
		<div ref="chartRef" class="sc-echart"></div>
	</div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
    gdata: {
        type: Object,
        required: true
    },
    categories: {
        type: Array,
        default: () => []
    },
	months: {
		type: Array,
		default: () => ['Sep 2023','Oct 2023','Nov 2023','Dec 2023','Jan 2024','Feb 2024','Mar 2024']
	},
	carbonTonnes: {
		type: Array,
		default: () => [4.0, 8.5, 9.1, 12.5, 12.6, 11.7, 5.0]
	},
	dieselLitres: {
		type: Array,
		default: () => [3200, 9000, 10500, 10000, 9800, 9400, 4200]
	},
	colorCarbon: { type: String, default: '#18c3a1' },
	colorDiesel: { type: String, default: '#4b61ff' },
	maxTonnes:   { type: Number, default: 15 },
	maxLitres:   { type: Number, default: 10000 }
})

const chartRef = ref(null)
let chart

// --- NEW: shared abbreviator for ticks & tooltip ---
function fmtAbbrev(v) {
	const abs = Math.abs(v)
	const trim = (n) => String(n).replace(/\.0$/, '')
	if (abs >= 1e9)  return trim((v / 1e9).toFixed(abs >= 1e10 ? 0 : 1)) + 'b'
	if (abs >= 1e6)  return trim((v / 1e6).toFixed(abs >= 1e7  ? 0 : 1)) + 'm'
	if (abs >= 1e3)  return trim((v / 1e3).toFixed(abs >= 1e4  ? 0 : 1)) + 'k'
	return String(v)
}

const render = () => {
	if (!chart) return
	const option = {
		grid: { left: 40, right: 44, top: 24, bottom: 60 },
		color: [props.colorCarbon, props.colorDiesel],
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'shadow' },
			borderWidth: 0,
			backgroundColor: 'rgba(33, 33, 33, 0.95)',
			textStyle: { color: '#fff' },
			padding: [8, 10],
			// --- NEW: format numeric values compactly in tooltip too ---
			formatter: (params) => {
				const lines = params.map(p => {
					const val = Array.isArray(p.value) ? p.value[1] : p.value
					return `${p.marker}${p.seriesName}: <b>${fmtAbbrev(val)}</b>`
				})
				return `${params[0]?.axisValueLabel || ''}<br/>` + lines.join('<br/>')
			}
		},
		legend: {
			bottom: 12,
			icon: 'roundRect',
			itemWidth: 22,
			itemHeight: 10,
			itemGap: 24,
			textStyle: { color: '#323232', fontSize: 12 },
			data: ['Carbon savings', 'Diesel savings']
		},
		xAxis: {
			type: 'category',
			data: props.gdata.months,
			axisLine: { lineStyle: { color: '#cfcfcf' } },
			axisTick: { show: false },
			axisLabel: { color: '#5a5a5a' }
		},
		yAxis: [
			{
				type: 'value',
				min: 0,
				max: props.gdata.carbonMax,
				axisLine: { show: false },
				axisTick: { show: false },
				axisLabel: {
					color: '#5a5a5a',
					// --- NEW: compact ticks on the left axis ---
					formatter: (val) => fmtAbbrev(val)
				},
				splitLine: { lineStyle: { color: '#eee' } }
			},
			{
				type: 'value',
				min: 0,
				max: props.gdata.dieselMax,
				position: 'right',
				axisLine: { show: false },
				axisTick: { show: false },
				axisLabel: {
					color: '#5a5a5a',
					// --- NEW: compact ticks on the right axis ---
					formatter: (val) => fmtAbbrev(val)
				},
				splitLine: { show: false }
			}
		],
        series: props.categories.map((cat, idx) => ({
            name: cat,
            type: 'bar',
            barWidth: props.gdata.barWidth,
            itemStyle: { borderRadius: [3, 3, 0, 0] },
            emphasis: { focus: 'series' },
            data: idx === 0 ? props.gdata.carbonTonnes : props.gdata.dieselLitres,
            yAxisIndex: idx
        }))
	}
	chart.setOption(option)
}

const initChart = () => {
	if (!chartRef.value) return
	chart = echarts.init(chartRef.value, null, { renderer: 'canvas' })
	render()
}

let ro
onMounted(() => {
	initChart()
	ro = new ResizeObserver(() => chart && chart.resize())
	ro.observe(chartRef.value)
	window.addEventListener('resize', handleWindowResize, { passive: true })
})

function handleWindowResize() {
	if (chart) chart.resize()
}

onBeforeUnmount(() => {
	window.removeEventListener('resize', handleWindowResize)
	if (ro && chartRef.value) ro.unobserve(chartRef.value)
	if (chart) {
		chart.dispose()
		chart = null
	}
})

watch(
	() => [props.gdata.months, props.gdata.carbonTonnes, props.gdata.dieselLitres, props.maxTonnes, props.maxLitres, props.colorCarbon, props.colorDiesel],
	() => render(),
	{ deep: true }
)
</script>

<style scoped>
.sc-wrapper {
	width: 100%;
	max-width: 1120px;
	margin: 0 auto;
}

.sc-axis-labels {
	position: relative;
	height: 0;
}

.sc-axis-left,
.sc-axis-right {
	position: absolute;
	top: -2px;
	font-size: 14px;
	font-weight: 600;
	color: #11a0ff;
	opacity: 0.9;
}

.sc-axis-left {
	left: 8px;
	color: #10b89d;
}

.sc-axis-right {
	right: 8px;
	color: #5a6bff;
}

.sc-echart {
	width: 100%;
	height: 320px;
}

@media (max-width: 640px) {
	.sc-echart {
		height: 260px;
	}
}
</style>
