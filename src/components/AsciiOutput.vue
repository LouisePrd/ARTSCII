<template>
    <div v-if="asciiArt && !loading" class="ascii-output">
        <pre>{{ asciiArt }}</pre>
        <div class="actions">
            <button @click="copyAscii">Copy</button>
            <button @click="downloadAscii">Download</button>
            <button @click="$emit('reset')">Reset</button>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    asciiArt: String,
    loading: Boolean
});

const emit = defineEmits(["reset"]);

const copyAscii = async () => {
    try {
        await navigator.clipboard.writeText(props.asciiArt);
        alert("ASCII copied!");
    } catch {
        alert("Copy failed!");
    }
};

const downloadAscii = () => {
    const blob = new Blob([props.asciiArt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ascii-art.txt";
    a.click();
    URL.revokeObjectURL(url);
};
</script>
