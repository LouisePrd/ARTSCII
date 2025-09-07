<template>
  <Header />
  <div class="ascii-container">
    <AsciiUploader @file="loadFile" />

    <AsciiControls
      :asciiWidth="asciiWidth"
      :charSet="charSet"
      :charSets="charSets"
      :imageLoaded="imageLoaded"
      :loading="loading"
      :isVideo="isVideo"
      :isPlaying="isPlaying"
      @update:asciiWidth="val => { asciiWidth = val; updateAscii(); }"
      @update:charSet="val => { charSet = val; updateAscii(); }"
      @togglePlay="togglePlay"
    />

    <AsciiOutput
      :asciiArt="asciiArt"
      :loading="loading"
      @reset="resetAscii"
    />

    <canvas ref="canvas" class="hidden"></canvas>

    <div v-if="loading" class="loader">
      <div class="spinner"></div>
      <p>Generating high-precision ASCII...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAscii } from "./composables/useAscii";
import Header from "./components/navbar/Header.vue";
import AsciiUploader from "./components/AsciiUploader.vue";
import AsciiControls from "./components/AsciiControls.vue";
import AsciiOutput from "./components/AsciiOutput.vue";

const canvas = ref(null);

const {
  asciiArt,
  asciiWidth,
  charSet,
  charSets,
  imageLoaded,
  isVideo,
  isPlaying,
  loading,
  setCanvas,
  loadFile,
  convertImage,
  renderVideo,
  togglePlay,
  resetAscii
} = useAscii();

onMounted(() => setCanvas(canvas.value));

const updateAscii = () => {
  if (isVideo.value && isPlaying.value) renderVideo();
  else if (imageLoaded.value) convertImage(canvas.value.width, canvas.value.height);
};
</script>
