<!-- src/components/ImageUploader.vue -->

<template>
    <div class="image-uploader">
        <input type="file" accept="image/*" @change="onFileChange" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'ImageUploader',
    emits: ['imageSelected'],
    setup(_props, { emit }) {
        const onFileChange = (event: Event) => {
            const target = event.target as HTMLInputElement;
            if (target.files && target.files[0]) {
                emit('imageSelected', target.files[0]);
            }
        };

        return {
            onFileChange,
        };
    },
});
</script>

<style scoped>
.image-uploader {
    margin: 20px 0;
}

input[type='file'] {
    padding: 10px;
    cursor: pointer;
    border: 1px solid #ccc;
    border-radius: 4px;
}
</style>
