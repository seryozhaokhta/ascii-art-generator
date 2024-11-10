// src/utils/asciiConverter.ts

export interface AsciiSettings {
    columns: number; // Количество символов по горизонтали
    rows: number;    // Количество символов по вертикали
    charset: string;
}

export function convertImageToAscii(
    image: HTMLImageElement,
    settings: AsciiSettings
): string {
    const { columns, rows, charset } = settings;

    // Создаём временный канвас для обработки изображения
    const canvas = document.createElement('canvas');
    canvas.width = columns;
    canvas.height = rows;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Не удалось получить контекст канваса');
    }

    // Рисуем изображение на канвасе с указанными размерами
    ctx.drawImage(image, 0, 0, columns, rows);
    const imageData = ctx.getImageData(0, 0, columns, rows);
    const data = imageData.data;

    let ascii = '';
    for (let y = 0; y < rows; y++) {
        let row = '';
        for (let x = 0; x < columns; x++) {
            const index = (y * columns + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const a = data[index + 3];

            if (a < 128) {
                row += ' '; // Пропустить прозрачные пиксели
                continue;
            }

            const brightness = getBrightness(r, g, b);
            const char = mapBrightnessToChar(brightness, charset);
            row += char;
        }
        ascii += row + '\n';
    }

    return ascii;
}

function getBrightness(r: number, g: number, b: number): number {
    // Восприятие человеческим глазом для расчёта яркости
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

function mapBrightnessToChar(brightness: number, charset: string): string {
    const index = Math.floor((brightness / 255) * (charset.length - 1));
    return charset[index];
}
