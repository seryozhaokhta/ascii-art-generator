<!-- src/components/ControlsPanel.vue -->

<template>
    <div class="controls-panel">
        <!-- Настройка размера сетки (колонки) через слайдер -->
        <div class="control">
            <label for="gridSize">Размер сетки (колонки): {{ localSettings.columns }}</label>
            <input type="range" id="gridSize" v-model.number="localSettings.columns" :min="minColumns" :max="maxColumns"
                @input="updateSettings" :title="gridSizeTitle" />
        </div>

        <!-- Настройки набора символов -->
        <div class="control">
            <label for="charset">Набор символов:</label>
            <div class="charset-input">
                <select v-model="selectedPreset" @change="applyPreset">
                    <option disabled value="">Выберите набор символов</option>
                    <option v-for="preset in presets" :key="preset.name" :value="preset.charset">
                        {{ preset.name }}
                    </option>
                </select>
                <button @click="resetCharset">Сбросить</button>
            </div>
            <textarea v-model="localSettings.charset" @input="updateSettings"
                placeholder="Введите свои символы здесь..." rows="3"></textarea>
            <p class="preset-description">{{ currentPresetDescription }}</p>
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
            required: true, // Обязательный пропс, так как пропорции всегда сохраняются
        },
        maxColumns: {
            type: Number,
            required: true, // Максимальное количество колонок
        },
    },
    setup(props, { emit }) {
        const localSettings = reactive<AsciiSettings>({
            columns: 40, // Начальное количество колонок
            rows: 40,    // Начальное количество строк (будет пересчитано)
            charset: '@%#*+=-:. ',
        });

        const presets: Preset[] = [
            {
                name: 'Стандартный',
                charset: '@%#*+=-:. ',
                description: 'Стандартный набор символов для базовой детализации.',
            },
            {
                name: 'Детализированный',
                charset: '#@S%?*+;:,.',
                description: 'Более детализированный набор символов для улучшенной детализации.',
            },
            {
                name: 'Тёмный',
                charset: '█▓▒░',
                description: 'Набор символов для тёмных изображений.',
            },
            {
                name: 'Светлый',
                charset: ' .:-=+*#%@',
                description: 'Набор символов для светлых изображений.',
            },
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
            // Пересчитываем количество строк на основе новых колонок и соотношения сторон
            const calculatedRows = Math.round(localSettings.columns * props.aspectRatio * 0.55);
            localSettings.rows = Math.max(1, Math.min(calculatedRows, 600)); // Ограничение строк

            emit('settingsChanged', { ...localSettings });
        };

        const gridSizeTitle = ref<string>('Установите количество колонок для ASCII-арта (минимум 1).');

        const minColumns = 1;
        const maxColumns = props.maxColumns;

        // Инициализируем количество строк при монтировании компонента
        watch(
            () => localSettings.columns,
            (newColumns: number) => {
                updateSettings();
            },
            { immediate: true }
        );

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
    padding: 20px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    width: 100%;
}

.control {
    display: flex;
    flex-direction: column;
}

.charset-input {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 10px;
}

.charset-input select {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #f9f9f9;
    cursor: pointer;
}

.charset-input button {
    padding: 8px 12px;
    cursor: pointer;
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.charset-input button:hover {
    background-color: #c0392b;
}

textarea {
    width: 100%;
    padding: 8px;
    resize: vertical;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: 'Courier New', Courier, monospace;
}

.preset-description {
    margin-top: 5px;
    font-size: 0.9em;
    color: #666666;
}

input[type='range'] {
    width: 100%;
}
</style>
