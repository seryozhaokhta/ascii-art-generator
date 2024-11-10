<!-- src/components/ControlsPanel.vue -->

<template>
    <div class="controls-panel">
        <div class="controls-panel__section">
            <label for="gridSize" class="controls-panel__label">Размер сетки (колонки):</label>
            <input type="range" id="gridSize" v-model.number="localSettings.columns" :min="minColumns" :max="maxColumns"
                @input="updateSettings" :title="gridSizeTitle" class="controls-panel__slider" />
            <div class="controls-panel__value">{{ localSettings.columns }}</div>
        </div>

        <div class="controls-panel__section">
            <label for="charset" class="controls-panel__label">Набор символов:</label>
            <div class="controls-panel__charset-container">
                <select v-model="selectedPreset" @change="applyPreset" class="controls-panel__select">
                    <option disabled value="">Выберите набор символов</option>
                    <option v-for="preset in presets" :key="preset.name" :value="preset.charset">
                        {{ preset.name }}
                    </option>
                </select>
                <button @click="resetCharset" class="controls-panel__button">Сбросить</button>
            </div>
            <textarea v-model="localSettings.charset" @input="updateSettings"
                placeholder="Введите свои символы здесь..." class="controls-panel__textarea"></textarea>
            <p class="controls-panel__preset-description">{{ currentPresetDescription }}</p>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, watch } from 'vue';
import { AsciiSettings } from '../utils/asciiConverter';

interface Preset {
    name: string;
    charset: string;
    description: string;
}

export default defineComponent({
    name: 'ControlsPanel',
    emits: ['settingsChanged'],
    props: {
        aspectRatio: {
            type: Number,
            required: true,
        },
        maxColumns: {
            type: Number,
            required: true,
        },
    },
    setup(props, { emit }) {
        const localSettings = reactive<AsciiSettings>({
            columns: 40,
            rows: 40,
            charset: '@%#*+=-:. ',
        });

        const presets: Preset[] = [
            { name: 'Стандартный', charset: '@%#*+=-:. ', description: 'Стандартный набор символов.' },
            { name: 'Детализированный', charset: '#@S%?*+;:,.', description: 'Улучшенная детализация.' },
            { name: 'Тёмный', charset: '█▓▒░', description: 'Для тёмных изображений.' },
            { name: 'Светлый', charset: ' .:-=+*#%@', description: 'Для светлых изображений.' },
        ];

        const selectedPreset = ref<string>('');
        const currentPresetDescription = ref<string>('');

        const applyPreset = () => {
            if (selectedPreset.value) {
                localSettings.charset = selectedPreset.value;
                const preset = presets.find(p => p.charset === selectedPreset.value);
                currentPresetDescription.value = preset ? preset.description : '';
                updateSettings();
            }
        };

        const resetCharset = () => {
            localSettings.charset = '@%#*+=-:. ';
            selectedPreset.value = '';
            currentPresetDescription.value = '';
            updateSettings();
        };

        const updateSettings = () => {
            const calculatedRows = Math.round(localSettings.columns * props.aspectRatio * 0.55);
            localSettings.rows = Math.max(1, Math.min(calculatedRows, 600));
            emit('settingsChanged', { ...localSettings });
        };

        const gridSizeTitle = ref<string>('Установите количество колонок для ASCII-арта (минимум 1).');
        const minColumns = 1;
        const maxColumns = props.maxColumns;

        watch(() => localSettings.columns, (newColumns: number) => updateSettings(), { immediate: true });

        return {
            localSettings,
            presets,
            selectedPreset,
            applyPreset,
            resetCharset,
            currentPresetDescription,
            updateSettings,
            gridSizeTitle,
            minColumns,
            maxColumns,
        };
    },
});
</script>

<style scoped>
.controls-panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
}

.controls-panel__section {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.controls-panel__label {
    font-size: 0.9em;
    color: #333;
    margin-bottom: 4px;
}

.controls-panel__slider {
    width: 100%;
}

.controls-panel__value {
    font-size: 0.85em;
    color: #555;
    text-align: right;
}

.controls-panel__charset-container {
    display: flex;
    gap: 10px;
    align-items: center;
    width: 100%;
}

.controls-panel__select {
    flex: 1;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #ccc;
    background-color: #f9f9f9;
    cursor: pointer;
}

.controls-panel__button {
    min-width: 80px;
    padding: 8px 12px;
    cursor: pointer;
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 4px;
    transition: background-color 0.3s;
    flex-shrink: 0;
}

.controls-panel__button:hover {
    background-color: #c0392b;
}

.controls-panel__textarea {
    width: 100%;
    height: 50px;
    /* Увеличили высоту для удобства ввода */
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: none;
    font-family: 'Courier New', Courier, monospace;
}

.controls-panel__preset-description {
    font-size: 0.85em;
    color: #666;
    margin-top: 4px;
}
</style>
