<!-- src/App.vue -->

<template>
  <div id="app">
    <HeaderBar />
    <div class="main-container">
      <aside class="sidebar">
        <ImageUploader @imageSelected="handleImageSelected" />
        <ControlsPanel @settingsChanged="handleSettingsChanged" :aspectRatio="aspectRatio" :maxColumns="maxColumns" />
        <div class="stats-panel" v-if="currentImage">
          <p>Колонки: {{ columns }}</p>
          <p>Строки: {{ rows }}</p>
          <p>Количество символов: {{ characterCount }}</p>
        </div>
      </aside>
      <section class="ascii-section">
        <AsciiCanvas :asciiData="asciiData" :columns="columns" :rows="rows" />
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import HeaderBar from './components/HeaderBar.vue';
import ImageUploader from './components/ImageUploader.vue';
import ControlsPanel from './components/ControlsPanel.vue';
import AsciiCanvas from './components/AsciiCanvas.vue';
import { convertImageToAscii, AsciiSettings } from './utils/asciiConverter';

export default defineComponent({
  name: 'App',
  components: {
    HeaderBar,
    ImageUploader,
    ControlsPanel,
    AsciiCanvas,
  },
  setup() {
    const asciiData = ref<string>('');
    const settings = ref<AsciiSettings>({
      columns: 40, // Начальное количество колонок
      rows: 40,    // Начальное количество строк (будет пересчитано)
      charset: '@%#*+=-:. ',
    });

    const currentImage = ref<HTMLImageElement | null>(null);

    // Вычисляемое свойство для соотношения сторон
    const aspectRatio = computed(() => {
      if (currentImage.value) {
        return currentImage.value.height / currentImage.value.width;
      }
      return 1;
    });

    // Вычисляемое свойство для количества символов
    const characterCount = computed(() => {
      return settings.value.columns * settings.value.rows;
    });

    // Вычисляемые свойства для колонок и строк с учётом сохранения пропорций
    const columns = computed(() => settings.value.columns);

    const rows = computed(() => settings.value.rows);

    // Максимальные ограничения
    const maxColumns = ref<number>(600);
    const maxRows = ref<number>(800);

    const minFontSize = 1; // Минимальный размер шрифта в px

    // Ссылка на контейнер AsciiCanvas для расчёта ширины
    const asciiCanvasContainer = ref<HTMLElement | null>(null);

    const updateMaxColumns = () => {
      if (!asciiCanvasContainer.value) return;

      const containerWidth = asciiCanvasContainer.value.clientWidth;
      const calculatedMax = calculateMaxColumns(containerWidth, minFontSize);
      maxColumns.value = Math.min(calculatedMax, 600); // Установите максимально допустимое значение

      // Обновляем количество колонок, если оно превышает новое maxColumns
      if (settings.value.columns > maxColumns.value) {
        settings.value.columns = maxColumns.value;
        handleSettingsChanged(settings.value);
      }
    };

    // Функция расчёта максимальных колонок
    const calculateMaxColumns = (containerWidth: number, minFontSize: number): number => {
      const padding = 40; // Общий отступ (может быть скорректирован)
      const availableWidth = containerWidth - padding;
      return Math.floor(availableWidth / minFontSize);
    };

    const handleImageSelected = async (file: File) => {
      const image = await loadImage(file);
      currentImage.value = image;
      // Пересчитываем количество строк на основе новых колонок и соотношения сторон
      settings.value.rows = Math.round(settings.value.columns * aspectRatio.value * 0.55);
      settings.value.rows = Math.max(1, Math.min(settings.value.rows, maxRows.value)); // Ограничение строк
      asciiData.value = convertImageToAscii(image, settings.value);
    };

    const handleSettingsChanged = (newSettings: Partial<AsciiSettings>) => {
      settings.value = { ...settings.value, ...newSettings };
      if (currentImage.value) {
        // Пересчитываем количество строк на основе новых колонок и соотношения сторон
        settings.value.rows = Math.round(settings.value.columns * aspectRatio.value * 0.55);
        settings.value.rows = Math.max(1, Math.min(settings.value.rows, maxRows.value)); // Ограничение строк
        asciiData.value = convertImageToAscii(currentImage.value, settings.value);
      }
    };

    const loadImage = (file: File): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.src = reader.result as string;
          img.onload = () => {
            resolve(img);
          };
          img.onerror = reject;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    onMounted(() => {
      updateMaxColumns();
      window.addEventListener('resize', updateMaxColumns);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', updateMaxColumns);
    });

    return {
      asciiData,
      handleImageSelected,
      handleSettingsChanged,
      settings,
      aspectRatio,
      columns,
      rows,
      characterCount,
      currentImage,
      maxColumns,
      asciiCanvasContainer,
    };
  },
});
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 373px;
  padding: 20px;
  background-color: #f0f2f5;
  border-right: 1px solid #ddd;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  justify-content: flex-start;
}

.stats-panel {
  margin-top: 20px;
  padding: 10px;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
  text-align: center;
}

.ascii-section {
  flex: 1;
  padding: 20px;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  box-sizing: border-box;
}
</style>
