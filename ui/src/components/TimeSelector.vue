<template>
	<div class="dtp" ref="root">
		<!-- Trigger / Display -->
		<div
			class="dtp-input"
			:class="{ 'dtp-input--open': open }"
			role="button"
			tabindex="0"
			aria-haspopup="dialog"
			@click="toggle(true)"
			@keydown.enter.prevent="toggle(true)"
			@keydown.space.prevent="toggle(true)"
		>
			<span class="dtp-input__icon" aria-hidden="true">
				<!-- Clock icon to match the screenshot -->
				<svg viewBox="0 0 24 24" width="18" height="18" class="dtp-icon">
					<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/>
					<path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</span>
			<span class="dtp-input__text">{{ displayValue || placeholder }}</span>
			<button
				v-if="modelValue"
				class="dtp-clear"
				title="Clear"
				@click.stop="clearSelection"
			>×</button>
		</div>

		<!-- Popover -->
		<div v-if="open" class="dtp-pop" role="dialog" aria-label="Choose date and time">
			<!-- Header: month/year switcher -->
			<div class="dtp-head">
				<div class="dtp-head__left">
					<button class="dtp-nav" @click="shiftMonth(-1)" aria-label="Previous month">‹</button>
				</div>

				<div class="dtp-head__center">
					<select class="dtp-select" :aria-label="'Month'" v-model.number="viewMonth" @change="onMonthChange">
						<option v-for="(m,i) in monthNames" :key="m" :value="i">{{ m }}</option>
					</select>
					<select class="dtp-select dtp-select--year" :aria-label="'Year'" v-model.number="viewYear" @change="onYearChange">
						<option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
					</select>
				</div>

				<div class="dtp-head__right">
					<button class="dtp-nav" @click="shiftMonth(1)" aria-label="Next month">›</button>
				</div>
			</div>

			<!-- Calendar -->
			<div class="dtp-cal">
				<div class="dtp-cal__row dtp-cal__dow">
					<span v-for="d in ['Su','Mo','Tu','We','Th','Fr','Sa']" :key="d">{{ d }}</span>
				</div>
				<div class="dtp-cal__grid">
					<button
						v-for="cell in calendarCells"
						:key="cell.key"
						class="dtp-cal__cell"
						:class="{
							'is-out': cell.outside,
							'is-today': isSameDate(cell.date, today),
							'is-selected': isSameDate(cell.date, pickedDateOnly)
						}"
						@click="pickDate(cell.date)"
					>
						{{ cell.date.getDate() }}
					</button>
				</div>
			</div>

			<!-- Time -->
			<div class="dtp-time">
				<label class="dtp-time__group">
					<span>HH</span>
					<input class="dtp-time__inp" type="number" min="0" max="23" v-model="hh" @input="normalizeTime('h')">
				</label>
				<span class="dtp-time__sep">:</span>
				<label class="dtp-time__group">
					<span>MM</span>
					<input class="dtp-time__inp" type="number" min="0" max="59" v-model="mm" @input="normalizeTime('m')">
				</label>
				<span class="dtp-time__sep">:</span>
				<label class="dtp-time__group">
					<span>SS</span>
					<input class="dtp-time__inp" type="number" min="0" max="59" v-model="ss" @input="normalizeTime('s')">
				</label>
			</div>

            <div class="dtp-time__actions">
                <button class="dtp-btn dtp-btn--ghost" @click="setNow">Now</button>
                <button class="dtp-btn" @click="apply">Apply</button>
            </div>
		</div>
	</div>
</template>

<script setup>
	import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';

	const props = defineProps({
		modelValue: { type: String, default: '' }, // expects "YYYY-MM-DD HH:mm:ss"
		placeholder: { type: String, default: 'YYYY-MM-DD 00:00:00' },
		startWeekOnMonday: { type: Boolean, default: false },
		position: { type: String, required: true }
	});
	const emit = defineEmits(['update:modelValue']);

	const open = ref(false);
	const root = ref(null);

	// Internal state derived from modelValue
	const parsed = computed(() => parseInput(props.modelValue));
	const picked = ref(parsed.value || new Date());
	const today = new Date();

	// Calendar view state
	const viewYear = ref((parsed.value || today).getFullYear());
	const viewMonth = ref((parsed.value || today).getMonth());

	// Time fields
	const hh = ref(pad((parsed.value || today).getHours()));
	const mm = ref(pad((parsed.value || today).getMinutes()));
	const ss = ref(pad((parsed.value || today).getSeconds()));

	const pickedDateOnly = computed(() => new Date(picked.value.getFullYear(), picked.value.getMonth(), picked.value.getDate()));

	const displayValue = computed(() => props.modelValue);

	// Year options (centered around current/picked year)
	const yearOptions = computed(() => {
		const base = viewYear.value || today.getFullYear();
		const start = base - 70; // broader range for convenience
		const end = base + 70;
		const arr = [];
		for (let y = start; y <= end; y++) arr.push(y);
		return arr;
	});

	watch(() => props.modelValue, (v) => {
		const d = parseInput(v);
		if (d) {
			picked.value = new Date(d);
			viewYear.value = d.getFullYear();
			viewMonth.value = d.getMonth();
			hh.value = pad(d.getHours());
			mm.value = pad(d.getMinutes());
			ss.value = pad(d.getSeconds());
		}
	});

	function toggle(state) {
		open.value = typeof state === 'boolean' ? state : !open.value;
	}

	function outsideClick(e) {
		if (!root.value) return;
		if (!root.value.contains(e.target)) open.value = false;
	}

	function onEsc(e) {
		if (e.key === 'Escape') open.value = false;
	}

	onMounted(() => {
		document.addEventListener('click', outsideClick);
		document.addEventListener('keydown', onEsc);
	});

	onBeforeUnmount(() => {
		document.removeEventListener('click', outsideClick);
		document.removeEventListener('keydown', onEsc);
	});

	function clearSelection() {
		emit('update:modelValue', '');
	}

	function setNow() {
		const n = new Date();
		picked.value = n;
		viewYear.value = n.getFullYear();
		viewMonth.value = n.getMonth();
		hh.value = pad(n.getHours());
		mm.value = pad(n.getMinutes());
		ss.value = pad(n.getSeconds());
	}

	function apply() {
		const out = new Date(
			picked.value.getFullYear(),
			picked.value.getMonth(),
			picked.value.getDate(),
			Number(hh.value), Number(mm.value), Number(ss.value), 0
		);
		emit('update:modelValue', fmt(out));
		open.value = false;
	}

	function pickDate(d) {
		// Keep time; update Y/M/D from clicked date
		const newD = new Date(
			d.getFullYear(),
			d.getMonth(),
			d.getDate(),
			Number(hh.value), Number(mm.value), Number(ss.value), 0
		);
		picked.value = newD;
	}

	function shiftMonth(delta) {
		const base = new Date(viewYear.value, viewMonth.value, 1);
		base.setMonth(base.getMonth() + delta);
		viewYear.value = base.getFullYear();
		viewMonth.value = base.getMonth();
	}

	function onMonthChange() {
		// Keep the selected day within new month bounds
		const day = Math.min(picked.value.getDate(), daysInMonth(viewYear.value, viewMonth.value));
		picked.value = new Date(viewYear.value, viewMonth.value, day, Number(hh.value), Number(mm.value), Number(ss.value), 0);
	}

	function onYearChange() {
		const day = Math.min(picked.value.getDate(), daysInMonth(viewYear.value, viewMonth.value));
		picked.value = new Date(viewYear.value, viewMonth.value, day, Number(hh.value), Number(mm.value), Number(ss.value), 0);
	}

	const calendarCells = computed(() => {
		const first = new Date(viewYear.value, viewMonth.value, 1);
		const startIdx = (first.getDay() + (props.startWeekOnMonday ? 6 : 0)) % 7;
		const start = new Date(first);
		start.setDate(1 - startIdx);

		const cells = [];
		for (let i = 0; i < 42; i++) {
			const d = new Date(start);
			d.setDate(start.getDate() + i);
			cells.push({
				key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
				date: d,
				outside: d.getMonth() !== viewMonth.value
			});
		}
		return cells;
	});

	function normalizeTime(kind) {
		// keep fields in 0..23/59/59 and 2-digit padded
		const clamp = (v, min, max) => Math.min(max, Math.max(min, Number(String(v).replace(/\D/g, '') || 0)));
		if (kind === 'h') hh.value = pad(clamp(hh.value, 0, 23));
		if (kind === 'm') mm.value = pad(clamp(mm.value, 0, 59));
		if (kind === 's') ss.value = pad(clamp(ss.value, 0, 59));
	}

	// Utils
	function parseInput(str) {
		if (!str) return null;
		// Expect "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DDTHH:mm:ss"
		const m = str.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);
		if (!m) return null;
		const [ , Y, M, D, h, mi, s ] = m.map(Number);
		return new Date(Y, M - 1, D, h, mi, s);
	}
	function fmt(d) {
		const y = d.getFullYear();
		const m = pad(d.getMonth() + 1);
		const da = pad(d.getDate());
		return `${y}-${m}-${da} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
	}
	function pad(n) { return String(n).padStart(2, '0'); }
	function isSameDate(a, b) {
		return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
	}
	function daysInMonth(y, m) {
		return new Date(y, m + 1, 0).getDate();
	}

	const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
</script>

<style scoped>
	/* Root */
	.dtp { position: relative; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Apple Color Emoji", "Segoe UI Emoji"; color: #222; }

	/* Input pill */
	.dtp-input {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		min-width: 280px;
		max-width: 100%;
		padding: 10px 12px;
		border: 1px solid #e2e2e2;
		border-radius: 8px;
		background: #fff;
		cursor: pointer;
		outline: none;
		box-shadow: 0 0 0 0 rgba(56,132,255,0);
		transition: box-shadow .15s ease, border-color .15s ease, background .15s ease;
	}
	.dtp-input:focus-visible,
	.dtp-input--open {
		border-color: #cfd8e3;
		box-shadow: 0 0 0 3px rgba(56,132,255,0.12);
	}
	.dtp-input__icon { display: inline-flex; align-items: center; color: #7a8797; }
	.dtp-icon { display: block; }
	.dtp-input__text { font-size: 14px; font-weight: 500; line-height: 20px; color: #2b3340; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.dtp-clear {
		margin-left: auto;
		border: 0;
		background: transparent;
		color: #9aa3af;
		font-size: 18px;
		line-height: 1;
		cursor: pointer;
		padding: 0 2px;
	}
	.dtp-clear:hover { color: #6b7280; }

	/* Popover */
	.dtp-pop {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 30;
		width: 320px;
		background: #fff;
		border: 1px solid #e5e7eb;
		border-radius: 10px;
		box-shadow: 0 10px 26px rgba(16,24,40,0.12);
		padding: 10px 10px 12px;
	}

	/* Header */
	.dtp-head {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		padding: 6px 4px 8px;
		column-gap: 8px;
	}
	.dtp-head__left { display: flex; justify-content: flex-start; }
	.dtp-head__right { display: flex; justify-content: flex-end; }
	.dtp-head__center { display: flex; align-items: center; gap: 6px; justify-content: center; }
	.dtp-head__label { font-weight: 600; font-size: 14px; color: #1f2937; }
	.dtp-nav {
		border: 0;
		width: 28px;
		height: 28px;
		border-radius: 6px;
		background: #f3f4f6;
		color: #374151;
		cursor: pointer;
		font-size: 18px;
		line-height: 28px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}
	.dtp-nav:hover { background: #e9eef5; }

	/* Month/Year selects */
	.dtp-select {
		height: 28px;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		background: #fff;
		font-size: 13px;
		padding: 0 6px;
		outline: none;
	}
	.dtp-select:focus { border-color: #cfd8e3; box-shadow: 0 0 0 3px rgba(56,132,255,0.12); }
	.dtp-select--year { width: 84px; }

	/* Calendar */
	.dtp-cal { padding: 4px; }
	.dtp-cal__dow {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 4px;
		margin-bottom: 4px;
		color: #6b7280;
		font-size: 12px;
		text-align: center;
	}
	.dtp-cal__grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 4px;
	}
	.dtp-cal__cell {
		height: 34px;
		border: 1px solid transparent;
		border-radius: 8px;
		background: #ffffff;
		font-size: 13px;
		color: #1f2937;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}
	.dtp-cal__cell:hover { background: #f6f8fb; border-color: #eef2f7; }
	.dtp-cal__cell.is-out { color: #b6b9c2; }
	.dtp-cal__cell.is-today { box-shadow: inset 0 0 0 1px #a5b4fc; }
	.dtp-cal__cell.is-selected { background: #3b82f6; color: #fff; }

	/* Time row */
	.dtp-time {
		margin-top: 8px;
		padding: 8px 4px 0;
		border-top: 1px solid #f0f2f5;
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.dtp-time__group { display: flex; flex-direction: column; align-items: center; gap: 4px; }
	.dtp-time__group > span { font-size: 10px; color: #6b7280; letter-spacing: .04em; }
	.dtp-time__inp {
		width: 60px;
		height: 34px;
		text-align: center;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		font-size: 14px;
		outline: none;
	}
	.dtp-time__inp:focus { border-color: #cfd8e3; box-shadow: 0 0 0 3px rgba(56,132,255,0.12); }
	.dtp-time__sep { padding: 0 2px; color: #6b7280; margin-top: 9px; }

	.dtp-time__actions { 
        margin-left: auto; display: flex; gap: 8px; margin-top: 12px; justify-content: space-between; 
    }
	.dtp-btn {
		height: 34px;
		padding: 0 12px;
		border: 1px solid #2563eb;
		background: #2563eb;
		color: #fff;
		border-radius: 8px;
		cursor: pointer;
		font-size: 13px;
		font-weight: 600;
	}
	.dtp-btn:hover { filter: brightness(0.96); }
	.dtp-btn--ghost {
		background: #f3f4f6;
		color: #111827;
		border-color: #e5e7eb;
	}
	.dtp-btn--ghost:hover { background: #e9eef5; }
</style>
