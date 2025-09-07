<template>
    <div class="drop-zone" @dragover.prevent @drop.prevent="handleDrop" @click="fileInput.click()">
        <p>Upload your image or video</p>
        <input type="file" accept="image/*,video/*" ref="fileInput" @change="handleFile" class="hidden" />
    </div>
</template>

<script setup>
import { ref } from "vue";
const emit = defineEmits(["file"]);
const fileInput = ref(null);

const handleDrop = (e) => {
    const file = e.dataTransfer.files[0];
    if (file) emit("file", file);
};

const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) emit("file", file);
};
</script>
