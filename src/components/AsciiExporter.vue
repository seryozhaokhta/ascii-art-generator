<!-- src/components/AsciiExporter.vue -->

<template>
    <button @click="exportAsciiArt" class="export-button">Экспортировать в PNG</button>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
    name: 'AsciiExporter',
    props: {
        asciiData: {
            type: String,
            required: true,
        },
        columns: {
            type: Number,
            required: true,
        },
        rows: {
            type: Number,
            required: true,
        },
        fontSize: {
            type: Number,
            default: 12,
        },
        lineHeight: {
            type: Number,
            default: 12,
        },
    },
    setup(props) {
        const canvas = ref<HTMLCanvasElement | null>(null);

        const exportAsciiArt = () => {
            if (!canvas.value) {
                canvas.value = document.createElement('canvas');
            }

            const ctx = canvas.value.getContext('2d');
            if (!ctx) return;

            // Изначально устанавливаем размеры canvas по данным props
            canvas.value.width = props.columns * props.fontSize;
            canvas.value.height = props.rows * props.lineHeight;

            // Очищаем canvas и устанавливаем белый цвет текста на прозрачном фоне
            ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
            ctx.font = `${props.fontSize}px 'Courier New', Courier, monospace`;
            ctx.fillStyle = 'white';
            ctx.textBaseline = 'top';

            // Отрисовываем ASCII-арт на canvas
            const lines = props.asciiData.split('\n');
            lines.forEach((line, i) => {
                ctx.fillText(line, 0, i * props.lineHeight);
            });

            // Получаем границы реального текста
            const boundingBox = getBoundingBox(ctx, lines, props.fontSize, props.lineHeight);

            // Создаем временный canvas для обрезки
            const trimmedCanvas = document.createElement('canvas');
            trimmedCanvas.width = boundingBox.width;
            trimmedCanvas.height = boundingBox.height;
            const trimmedCtx = trimmedCanvas.getContext('2d');

            if (trimmedCtx) {
                // Копируем содержимое с учетом границ
                trimmedCtx.drawImage(
                    canvas.value,
                    boundingBox.left,
                    boundingBox.top,
                    boundingBox.width,
                    boundingBox.height,
                    0,
                    0,
                    boundingBox.width,
                    boundingBox.height
                );

                // Экспортируем изображение
                const link = document.createElement('a');
                link.href = trimmedCanvas.toDataURL('image/png');
                link.download = 'ascii-art.png';
                link.click();
            }
        };

        // Функция для расчета реальных границ текста
        const getBoundingBox = (ctx: CanvasRenderingContext2D, lines: string[], fontSize: number, lineHeight: number) => {
            let left = fontSize * props.columns;
            let right = 0;
            let top = fontSize * props.rows;
            let bottom = 0;

            lines.forEach((line, rowIndex) => {
                const trimmedLine = line.trimEnd();
                if (trimmedLine.length > 0) {
                    const lineWidth = ctx.measureText(trimmedLine).width;
                    left = Math.min(left, 0);
                    right = Math.max(right, lineWidth);
                    top = Math.min(top, rowIndex * lineHeight);
                    bottom = Math.max(bottom, (rowIndex + 1) * lineHeight);
                }
            });

            return {
                left: Math.floor(left),
                top: Math.floor(top),
                width: Math.ceil(right - left),
                height: Math.ceil(bottom - top),
            };
        };

        return {
            exportAsciiArt,
            canvas,
        };
    },
});
</script>

<style scoped>
.export-button {
    padding: 10px 20px;
    margin-top: 20px;
    cursor: pointer;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.export-button:hover {
    background-color: #388e3c;
}
</style>
