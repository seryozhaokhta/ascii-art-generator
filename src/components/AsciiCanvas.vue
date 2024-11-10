<!-- src/components/AsciiCanvas.vue -->

<template>
    <div ref="asciiContainer" class="ascii-canvas">
        <pre :style="{ fontSize: fontSize + 'px', lineHeight: lineHeight + 'px' }">{{ asciiData }}</pre>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch, PropType } from 'vue';
import gsap from 'gsap';

export default defineComponent({
    name: 'AsciiCanvas',
    props: {
        asciiData: {
            type: String as PropType<string>,
            required: true,
        },
        columns: {
            type: Number as PropType<number>,
            required: true,
        },
        rows: {
            type: Number as PropType<number>,
            required: true,
        },
    },
    setup(props) {
        const asciiContainer = ref<HTMLElement | null>(null);
        const containerWidth = ref<number>(0);
        const containerHeight = ref<number>(0);
        const fontSize = ref<number>(12); // Минимальный размер шрифта
        const lineHeight = ref<number>(12); // Высота строки

        // Функция для обновления размеров контейнера
        const updateContainerSize = () => {
            if (asciiContainer.value) {
                const rect = asciiContainer.value.getBoundingClientRect();
                containerWidth.value = rect.width;
                containerHeight.value = rect.height;
            }
        };

        // Функция для вычисления размера шрифта
        const calculateFontSize = () => {
            const scaledColumns = props.columns;
            const scaledRows = props.rows;

            // Вычисляем размер шрифта так, чтобы ASCII-арт помещался в контейнер
            const padding = 40; // Общий отступ (можно скорректировать)
            const availableWidth = containerWidth.value - padding;
            const availableHeight = containerHeight.value - padding;

            const fontSizeWidth = availableWidth / scaledColumns;
            const fontSizeHeight = availableHeight / scaledRows;

            // Выбираем минимальный размер шрифта для обеспечения помещаемости
            const newFontSize = Math.min(fontSizeWidth, fontSizeHeight);

            // Устанавливаем минимальный и максимальный размер шрифта
            fontSize.value = Math.max(1, Math.min(newFontSize, 600));
            lineHeight.value = fontSize.value;
        };

        onMounted(() => {
            updateContainerSize();
            calculateFontSize();

            if (asciiContainer.value) {
                // Плавная анимация при загрузке
                gsap.from(asciiContainer.value, { opacity: 0, duration: 1 });
            }

            // Установка ResizeObserver для отслеживания изменений размеров контейнера
            const resizeObserver = new ResizeObserver(() => {
                updateContainerSize();
                calculateFontSize();
            });

            if (asciiContainer.value) {
                resizeObserver.observe(asciiContainer.value);
            }

            // Очистка наблюдателя при уничтожении компонента
            return () => {
                if (asciiContainer.value) {
                    resizeObserver.unobserve(asciiContainer.value);
                }
            };
        });

        watch(
            () => props.asciiData,
            () => {
                if (asciiContainer.value) {
                    // Плавная анимация при обновлении ASCII-арта
                    gsap.fromTo(
                        asciiContainer.value,
                        { opacity: 0 },
                        { opacity: 1, duration: 0.5 }
                    );
                }
            }
        );

        watch([() => props.columns, () => props.rows], () => {
            calculateFontSize();
        });

        return {
            asciiContainer,
            fontSize,
            lineHeight,
        };
    },
});
</script>

<style scoped>
.ascii-canvas {
    background-color: #000000;
    color: white;
    font-family: 'Courier New', Courier, monospace;
    white-space: pre;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;
}

pre {
    margin: 0;
}
</style>
