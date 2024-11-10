<!-- src/components/HeaderBar.vue -->

<template>
    <header class="header-bar">
        <img src="@/assets/ascii-logo.svg" alt="ASCII Logo" class="logo" />
        <h1>ASCII Art Generator</h1>
    </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'HeaderBar',
});
</script>

<style scoped>
.header-bar {
    display: flex;
    align-items: center;
    background-color: #333;
    padding: 10px 20px;
    color: white;
    width: 100%;
    height: 50px;
    /* Уменьшили высоту */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo {
    width: 30px;
    /* Уменьшили размер логотипа */
    height: 30px;
    margin-right: 10px;
}
</style>
