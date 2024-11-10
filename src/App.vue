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
        <AsciiExporter v-if="asciiData" :asciiData="asciiData" :columns="columns" :rows="rows" :fontSize="fontSize"
          :lineHeight="lineHeight" />
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
import AsciiExporter from './components/AsciiExporter.vue';
import { convertImageToAscii, AsciiSettings } from './utils/asciiConverter';

export default defineComponent({
  name: 'App',
  components: {
    HeaderBar,
    ImageUploader,
    ControlsPanel,
    AsciiCanvas,
    AsciiExporter,
  },
  setup() {
    const asciiData = ref<string>('');
    const settings = ref<AsciiSettings>({
      columns: 40,
      rows: 40,
      charset: '@%#*+=-:. ',
    });

    const currentImage = ref<HTMLImageElement | null>(null);
    const aspectRatio = computed(() => {
      if (currentImage.value) {
        return currentImage.value.height / currentImage.value.width;
      }
      return 1;
    });

    const characterCount = computed(() => {
      return settings.value.columns * settings.value.rows;
    });

    const columns = computed(() => settings.value.columns);
    const rows = computed(() => settings.value.rows);
    const maxColumns = ref<number>(600);
    const maxRows = ref<number>(800);
    const minFontSize = 1;
    const fontSize = ref(12);
    const lineHeight = ref(12);
    const asciiCanvasContainer = ref<HTMLElement | null>(null);

    const updateMaxColumns = () => {
      if (!asciiCanvasContainer.value) return;
      const containerWidth = asciiCanvasContainer.value.clientWidth;
      const calculatedMax = calculateMaxColumns(containerWidth, minFontSize);
      maxColumns.value = Math.min(calculatedMax, 600);
      if (settings.value.columns > maxColumns.value) {
        settings.value.columns = maxColumns.value;
        handleSettingsChanged(settings.value);
      }
    };

    const calculateMaxColumns = (containerWidth: number, minFontSize: number): number => {
      const padding = 40;
      const availableWidth = containerWidth - padding;
      return Math.floor(availableWidth / minFontSize);
    };

    const handleImageSelected = async (file: File) => {
      const image = await loadImage(file);
      currentImage.value = image;
      settings.value.rows = Math.round(settings.value.columns * aspectRatio.value * 0.55);
      settings.value.rows = Math.max(1, Math.min(settings.value.rows, maxRows.value));
      asciiData.value = convertImageToAscii(image, settings.value);
    };

    const handleSettingsChanged = (newSettings: Partial<AsciiSettings>) => {
      settings.value = { ...settings.value, ...newSettings };
      if (currentImage.value) {
        settings.value.rows = Math.round(settings.value.columns * aspectRatio.value * 0.55);
        settings.value.rows = Math.max(1, Math.min(settings.value.rows, maxRows.value));
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
      fontSize,
      lineHeight,
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
