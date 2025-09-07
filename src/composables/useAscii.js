import { ref, watch } from "vue";

export function useAscii() {
  const asciiArt = ref("");
  const asciiWidth = ref(100);

  const charSets = {
    Simple: "@%#*+=-:. ",
    Detailed: "@#W$9876543210?!abc;:+=-,._ ",
    SuperDetailed:
      ' .`^",:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
    Minimal: " .oO0@",
  };

  const charSet = ref(charSets.Simple);

  const imageLoaded = ref(false);
  const isVideo = ref(false);
  const isPlaying = ref(false);
  const loading = ref(false);

  let img = null;
  let video = null;
  let animationId = null;
  let canvas = null;

  const setCanvas = (el) => (canvas = el);

  const generateAscii = (ctx, width, height) => {
    const data = ctx.getImageData(0, 0, width, height).data;
    let result = "";
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const index = Math.floor(
          (brightness / 255) * (charSet.value.length - 1)
        );
        result += charSet.value[index];
      }
      result += "\n";
    }
    return result;
  };

  const convertImage = (width, height) => {
    if (!img || !canvas) return;
    loading.value = true;

    const ctx = canvas.getContext("2d");
    const charAspectRatio = 3;
    const newHeight = Math.floor(
      (asciiWidth.value * height) / (width * charAspectRatio)
    );
    canvas.width = asciiWidth.value;
    canvas.height = newHeight;
    ctx.drawImage(img, 0, 0, asciiWidth.value, newHeight);
    asciiArt.value = generateAscii(ctx, asciiWidth.value, newHeight);

    loading.value = false;
  };

  const renderVideo = () => {
    if (!video || !canvas || video.paused || video.ended) return;

    const ctx = canvas.getContext("2d");
    const charAspectRatio = 3;
    const newHeight = Math.floor(
      (asciiWidth.value * video.videoHeight) /
        (video.videoWidth * charAspectRatio)
    );
    canvas.width = asciiWidth.value;
    canvas.height = newHeight;
    ctx.drawImage(video, 0, 0, asciiWidth.value, newHeight);
    asciiArt.value = generateAscii(ctx, asciiWidth.value, newHeight);

    animationId = requestAnimationFrame(renderVideo);
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

  const loadFile = (file) => {
    resetAscii();

    const reader = new FileReader();
    reader.onload = () => {
      if (file.type.startsWith("video")) {
        isVideo.value = true;
        video = document.createElement("video");
        video.src = reader.result;
        video.muted = true;
        video.loop = true;
        video.autoplay = true;
        video.onloadeddata = () => {
          imageLoaded.value = true;
          isPlaying.value = true;
          renderVideo();
        };
      } else {
        isVideo.value = false;
        img = new Image();
        img.src = reader.result;
        img.onload = () => {
          imageLoaded.value = true;
          convertImage(img.width, img.height);
        };
      }
    };
    reader.readAsDataURL(file);
  };

  const resetAscii = () => {
    asciiArt.value = "";
    imageLoaded.value = false;
    cancelAnimationFrame(animationId);
    img = null;
    video = null;
  };

  watch([asciiWidth, charSet], () => {
    if (!imageLoaded.value) return;
    if (isVideo.value && video) renderVideo();
    else if (img) convertImage(img.width, img.height);
  });

  return {
    asciiArt,
    asciiWidth,
    charSet,
    charSets,
    imageLoaded,
    isVideo,
    isPlaying,
    loading,
    setCanvas,
    convertImage,
    renderVideo,
    togglePlay,
    loadFile,
    resetAscii,
  };
}
