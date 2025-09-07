<template>
    <div class="ascii-container">
        <div class="drop-zone" @dragover.prevent @drop.prevent="handleDrop" @click="fileInput.click()">
            <p>Upload your image or video, can't guarantee the quality of the result...</p>
            <input type="file" accept="image/*,video/*" ref="fileInput" @change="handleFile" class="hidden" />
        </div>

        <div v-if="loading" class="loader">
            <div class="spinner"></div>
            <p>Generating high-precision ASCII...</p>
        </div>

        <div v-if="imageLoaded && !loading" class="controls">
            <label>
                Width ASCII : {{ asciiWidth }}
                <input type="range" min="40" max="200" v-model="asciiWidth" @input="updateAscii" />
            </label>

            <label>
                Character Set :
                <select v-model="charSet" @change="updateAscii">
                    <option value="@%#*+=-:. ">Dark to Light</option>
                    <option value=" .:-=+*#%@">Light to Dark</option>
                    <option value="01">Binary (0/1)</option>
                    <option value=" .oO0@">Simple</option>
                    <option value=" .,:;i1tfLCG08@">Detailed</option>
                </select>
            </label>

            <div v-if="isVideo" class="video-controls">
                <button @click="togglePlay">{{ isPlaying ? "Pause" : "Play" }}</button>
            </div>
        </div>

        <!-- Résultat ASCII -->
        <div v-if="asciiArt && !loading" class="ascii-output">
            <pre>{{ asciiArt }}</pre>
        </div>

        <!-- Actions -->
        <div v-if="asciiArt && !loading" class="actions">
            <button @click="copyAscii">Copy</button>
            <button @click="downloadAscii">Download</button>
            <button @click="resetAscii">Reset</button>
        </div>

        <!-- Canvas caché -->
        <canvas ref="canvas" class="hidden"></canvas>
    </div>
</template>

<script setup>
import { ref, watch } from "vue";
import "../assets/main.css";

const asciiArt = ref("");
const asciiWidth = ref(100);
const charSet = ref("@%#*+=-:. ");
const fileInput = ref(null);
const canvas = ref(null);
const imageLoaded = ref(false);
const isVideo = ref(false);
const isPlaying = ref(false);
const loading = ref(false);

let img = null;
let video = null;
let animationId = null;

const handleDrop = (event) => {
    const file = event.dataTransfer.files[0];
    if (file) processFile(file);
};

const handleFile = (event) => {
    const file = event.target.files[0];
    if (file) processFile(file);
};

const processFile = (file) => {
    resetAscii();
    const reader = new FileReader();
    reader.onload = () => {
        if (file.type.startsWith("video")) {
            isVideo.value = true;
            loadVideo(reader.result);
        } else {
            isVideo.value = false;
            loadImage(reader.result);
        }
    };
    reader.readAsDataURL(file);
};

const loadImage = (src) => {
    img = new Image();
    img.src = src;
    img.onload = () => {
        imageLoaded.value = true;
        convertImage(img.width, img.height);
    };
};

const loadVideo = (src) => {
    video = document.createElement("video");
    video.src = src;
    video.muted = true;
    video.loop = true;
    video.autoplay = true;

    video.onloadeddata = () => {
        imageLoaded.value = true;
        isPlaying.value = true;
        renderVideo();
    };
};

const convertImage = (width, height) => {
    loading.value = true;
    setTimeout(() => {
        const ctx = canvas.value.getContext("2d");
        const charAspectRatio = 3;
        const newHeight = Math.floor((asciiWidth.value * height) / (width * charAspectRatio));

        canvas.value.width = asciiWidth.value;
        canvas.value.height = newHeight;

        ctx.drawImage(img, 0, 0, asciiWidth.value, newHeight);
        asciiArt.value = generateAscii(ctx, asciiWidth.value, newHeight);

        loading.value = false;
    }, 50);
};

const renderVideo = () => {
    if (!video || video.paused || video.ended) return;

    const ctx = canvas.value.getContext("2d");
    const charAspectRatio = 3;
    const newHeight = Math.floor(
        (asciiWidth.value * video.videoHeight) /
        (video.videoWidth * charAspectRatio)
    );

    canvas.value.width = asciiWidth.value;
    canvas.value.height = newHeight;

    ctx.drawImage(video, 0, 0, asciiWidth.value, newHeight);
    asciiArt.value = generateAscii(ctx, asciiWidth.value, newHeight);

    animationId = requestAnimationFrame(renderVideo);
};

const generateAscii = (ctx, width, height) => {
    const imageData = ctx.getImageData(0, 0, width, height).data;
    let ascii = "";

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = imageData[idx];
            const g = imageData[idx + 1];
            const b = imageData[idx + 2];

            const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

            const index = Math.floor((brightness / 255) * (charSet.value.length - 1));
            ascii += charSet.value[index];
        }
        ascii += "\n";
    }
    return ascii;
};

const togglePlay = () => {
    if (!video) return;
    if (isPlaying.value) {
        video.pause();
        cancelAnimationFrame(animationId);
    } else {
        video.play();
        renderVideo();
    }
    isPlaying.value = !isPlaying.value;
};

const updateAscii = () => {
    if (isVideo.value && video) {
        cancelAnimationFrame(animationId);
        renderVideo();
    } else if (img) {
        convertImage(img.width, img.height);
    }
};

const copyAscii = async () => {
    try {
        await navigator.clipboard.writeText(asciiArt.value);
        alert("ASCII copied!");
    } catch (err) {
        alert("Copy failed!");
    }
};

const downloadAscii = () => {
    const blob = new Blob([asciiArt.value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ascii-art.txt";
    a.click();
    URL.revokeObjectURL(url);
};

const resetAscii = () => {
    asciiArt.value = "";
    imageLoaded.value = false;
    fileInput.value.value = null;
    cancelAnimationFrame(animationId);
    video = null;
    img = null;
};
</script>
