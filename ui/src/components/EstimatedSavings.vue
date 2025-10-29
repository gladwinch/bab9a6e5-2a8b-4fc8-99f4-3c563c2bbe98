<!-- CarbonSavings.vue -->
<template>
	<section class="cs-card" role="region" aria-labelledby="cs-title">
		<h2 id="cs-title" class="cs-title"> Estimated {{ savingType }} savings</h2>
		<p class="cs-subtitle" v-if="subtitle">{{ subtitle }}</p>
        <div class="ghost-subtitle" v-else></div>

		<div class="cs-grid">
			<!-- Total -->
			<div class="cs-block" aria-live="polite">
				<div class="cs-block-head">
					<span class="cs-block-label">Total</span>
					<button
						class="cs-info"
						type="button"
						aria-label="More info about total savings"
						@mouseenter="show.total = true"
						@mouseleave="show.total = false"
						@focus="show.total = true"
						@blur="show.total = false"
					>
						<svg viewBox="0 0 24 24" class="cs-info-icon" aria-hidden="true">
							<circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" stroke-width="1.5"/>
							<circle cx="12" cy="8" r="1.25" fill="currentColor"/>
							<path d="M12 11.25v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
						</svg>
					</button>
				</div>

				<div class="cs-value" :class="[`text-${config[savingType].color}`]">{{ formatedTotal }}</div>
				<div class="cs-unit" :class="[`text-${config[savingType].color}`]">{{ unit }}</div>
			</div>

			<!-- Monthly -->
			<div class="cs-block" aria-live="polite">
				<div class="cs-block-head">
					<span class="cs-block-label">Monthly</span>
					<button
						class="cs-info"
						type="button"
						aria-label="More info about monthly savings"
						@mouseenter="show.monthly = true"
						@mouseleave="show.monthly = false"
						@focus="show.monthly = true"
						@blur="show.monthly = false"
					>
						<svg viewBox="0 0 24 24" class="cs-info-icon" aria-hidden="true">
							<circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" stroke-width="1.5"/>
							<circle cx="12" cy="8" r="1.25" fill="currentColor"/>
							<path d="M12 11.25v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
						</svg>
					</button>
				</div>

				<div class="cs-value" :class="[`text-${config[savingType].color}`]">{{ formatedMonthly }}</div>
				<div class="cs-unit" :class="[`text-${config[savingType].color}`]">{{ unit }}</div>
			</div>
		</div>
	</section>
</template>

<script setup>
import { computed, reactive } from 'vue'

const props = defineProps({
    savingType: { type: String, required: true },
	subtitle: { type: String },
	total: { type: Number },
	monthly: { type: Number },
	unit: { type: String }
})

const show = reactive({ total: false, monthly: false })
const config = {
    carbon: {
        color: 'carbon',
    },
    diesel: {
        color: 'diesel',
    }
}

const formatedMonthly = computed(() => {
    return props.monthly.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
})

const formatedTotal = computed(() => {
    return props.total.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
})

</script>

<style scoped>
/* Wrapper */
.cs-card {
	padding: 0px 16px 0px;
	/* border-bottom: 1px solid #8d8d8d; */
	/* border-radius: 12px; */
	background: #fff;
}

/* Title + subtitle */
.cs-title {
	margin: 0 0 2px 0;
	font-size: 18px;
	line-height: 1.2;
	font-weight: 500;
	color: #1f2937; /* near-black */
}
.cs-subtitle {
	margin: 0 0 6px 0;
	font-size: 13px;
	color: #6b7280; /* gray */
}

.ghost-subtitle {
    height: 15px;
    width: 40px;
}

/* Grid for the two blocks */
.cs-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 24px;
	align-items: start;
}

/* Each block */
.cs-block {
	text-align: center;
}
.cs-block-head {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	margin-bottom: 6px;
}
.cs-block-label {
	font-size: 14px;
	color: #6b7280;
}

/* Info icon + tooltip */
.cs-info {
	position: relative;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	border: 0;
	background: transparent;
	color: #9ca3af;
	cursor: default;
	padding: 0;
}
.cs-info:focus-visible { outline: 2px solid #22c55e; border-radius: 50%; }
.cs-info-icon {
	width: 16px;
	height: 16px;
}
.cs-tooltip {
	position: absolute;
	top: calc(100% + 8px);
	left: 50%;
	transform: translateX(-50%);
	white-space: nowrap;
	background: #111827;
	color: #fff;
	font-size: 12px;
	line-height: 1;
	padding: 8px 10px;
	border-radius: 6px;
	box-shadow: 0 6px 18px rgba(0,0,0,0.15);
	z-index: 10;
}

/* Values */
.cs-value {
	font-size: 22px;
	line-height: 1.05;
	font-weight: 400;
	margin-bottom: 2px;
}
.cs-unit {
	font-size: 15px;
}

/* Responsive */
@media (max-width: 640px) {
	.cs-grid { grid-template-columns: 1fr; gap: 18px; }
	.cs-value { font-size: 38px; }
}
</style>
