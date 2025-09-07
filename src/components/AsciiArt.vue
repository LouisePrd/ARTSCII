<template>
  <div class="ascii-container">

    <div
      class="drop-zone"
      @dragover.prevent
      @drop.prevent="handleDrop"
      @click="fileInput.click()"
    >
      <p>Upload your image, can't guarantee the quality of the result...</p>
      <input
        type="file"
        accept="image/*"
        ref="fileInput"
        @change="handleFile"
        class="hidden"
      />
    </div>

    <div v-if="imageLoaded" class="controls">
      <label>
        Width ASCII : {{ asciiWidth }}
        <input type="range" min="40" max="200" v-model="asciiWidth" @input="convertImage" />
      </label>

      <label>
        Character Set :
        <select v-model="charSet" @change="convertImage">
          <option value="@%#*+=-:. ">Dark to Light</option>
          <option value=" .:-=+*#%@">Light to Dark</option>
          <option value="01">Binary (0/1)</option>
            <option value=" .oO0@">Simple</option>
            <option value=" .,:;i1tfLCG08@">Detailed</option>
        </select>
      </label>
    </div>

    <div v-if="asciiArt" class="ascii-output">
      <pre>{{ asciiArt }}</pre>
    </div>

    <div v-if="asciiArt" class="actions">
      <button @click="copyAscii">Copy</button>
      <button @click="downloadAscii">Download</button>
      <button @click="asciiArt = ''; imageLoaded = false; fileInput.value = null;">Reset</button>
    </div>

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
let img = null;
const bgImage = ref("");

watch(bgImage, (newVal) => {
  if (newVal) {
    document.documentElement.style.backgroundImage = `url(${newVal})`;
    document.documentElement.style.backgroundSize = "auto";
    document.documentElement.style.backgroundPosition = "center";
    document.documentElement.style.backgroundRepeat = "repeat";
    document.documentElement.style.backgroundColor = "none";
  } else {
    document.documentElement.style.backgroundImage = "";
  }
});

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0];
  if (file) processFile(file);
};

const handleFile = (event) => {
  const file = event.target.files[0];
  if (file) processFile(file);
};

const processFile = (file) => {
  const reader = new FileReader();
  reader.onload = () => {
    img = new Image();
    img.src = reader.result;
    img.onload = () => {
      imageLoaded.value = true;
      bgImage.value = reader.result;
      convertImage();
    };
  };
  reader.readAsDataURL(file);
};

const convertImage = () => {
  if (!img) return;
  const ctx = canvas.value.getContext("2d");

  const charAspectRatio = 3;
  const newHeight = Math.floor((asciiWidth.value * img.height) / (img.width * charAspectRatio));

  canvas.value.width = asciiWidth.value;
  canvas.value.height = newHeight;

  ctx.drawImage(img, 0, 0, asciiWidth.value, newHeight);

  const imageData = ctx.getImageData(0, 0, asciiWidth.value, newHeight).data;

  let ascii = "";
  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < asciiWidth.value; x++) {
      const idx = (y * asciiWidth.value + x) * 4;
      const r = imageData[idx];
      const g = imageData[idx + 1];
      const b = imageData[idx + 2];

      const brightness = (r + g + b) / 3;
      const index = Math.floor((brightness / 255) * (charSet.value.length - 1));
      ascii += charSet.value[index];
    }
    ascii += "\n";
  }
  asciiArt.value = ascii;
};

const copyAscii = async () => {
  try {
    await navigator.clipboard.writeText(asciiArt.value);
    alert("ASCII copié !");
  } catch (err) {
    alert("Erreur lors de la copie !");
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

</script>
