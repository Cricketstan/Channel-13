
if (window.top === window.self) {
  window.location.href = "https://t.me/+bBTRZuMcxZ0wNGM1"; 
}

const streamUrl = "https://allinonereborn.fun/opplextv-web1/live.php?id=167593";

jwplayer("my-jwplayer").setup({
  file: streamUrl,
  type: "hls",
  width: "100%",
  height: "100%",
  autostart: true,
  controls: true,
  stretching: "uniform"
});
