<template>
  <div v-if="imageLoaded && !loading" class="controls">
    <label>
      Width ASCII: {{ asciiWidth }}
      <input
        type="range"
        min="40"
        max="200"
        :value="asciiWidth"
        @input="$emit('update:asciiWidth', Number($event.target.value))"
      />
    </label>

    <label>
      Character Set:
      <select
        :value="charSet"
        @change="$emit('update:charSet', $event.target.value)"
      >
        <option v-for="(set, key) in charSets" :key="key" :value="set">
          {{ key }}
        </option>
      </select>
    </label>

    <label>
      Custom Set:
      <input
        type="text"
        :value="charSet"
        placeholder="Enter your own characters"
        @input="$emit('update:charSet', $event.target.value)"
      />
    </label>

    <div v-if="isVideo" class="video-controls">
      <button @click="$emit('togglePlay')">
        {{ isPlaying ? "Pause" : "Play" }}
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  asciiWidth: Number,
  charSet: String,
  charSets: Object,
  imageLoaded: Boolean,
  loading: Boolean,
  isVideo: Boolean,
  isPlaying: Boolean,
});
</script>
