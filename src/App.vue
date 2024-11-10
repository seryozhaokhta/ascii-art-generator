<!-- src/App.vue -->

<template>
  <div class="app">
    <HeaderBar />
    <div class="app__main-container">
      <section class="app__ascii-section">
        <AsciiCanvas :asciiData="asciiData" :columns="columns" :rows="rows" />
      </section>
      <aside class="app__sidebar">
        <ImageUploader @imageSelected="handleImageSelected" />
        <ControlsPanel @settingsChanged="handleSettingsChanged" :aspectRatio="aspectRatio" :maxColumns="maxColumns" />
        <div class="app__stats-panel" v-if="currentImage">
          <p>Колонки: {{ columns }}</p>
          <p>Строки: {{ rows }}</p>
          <p>Количество символов: {{ characterCount }}</p>
        </div>
        <AsciiExporter v-if="asciiData" :asciiData="asciiData" :columns="columns" :rows="rows" :fontSize="fontSize"
          :lineHeight="lineHeight" />
      </aside>
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
    const fontSize = ref(12);
    const lineHeight = ref(12);

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
      window.addEventListener('resize', updateSettingsOnResize);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', updateSettingsOnResize);
    });

    const updateSettingsOnResize = () => {
      if (currentImage.value) {
        // Пересчёт настроек при изменении размера окна
        settings.value.rows = Math.round(settings.value.columns * aspectRatio.value * 0.55);
        settings.value.rows = Math.max(1, Math.min(settings.value.rows, maxRows.value));
        asciiData.value = convertImageToAscii(currentImage.value, settings.value);
      }
    };

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
      fontSize,
      lineHeight,
    };
  },
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.app__main-container {
  display: flex;
  flex: 1;
  position: relative;
  overflow: hidden;
}

.app__ascii-section {
  flex: 1;
  background-color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.app__sidebar {
  position: absolute;
  top: 20px;
  right: 20px;
  width: auto;
  /* Установите фиксированную или гибкую ширину */
  max-height: calc(100vh - 40px);
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(6px);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.app__stats-panel {
  margin-top: 10px;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 4px;
  text-align: center;
  font-size: 0.9em;
  color: #333;
}
</style>
