import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.4.0';
env.allowLocalModels = false;
env.useBrowserCache = true;

let sint = null;
async function carregar() {
  if (!sint) {
    sint = await pipeline('text-to-speech', 'Xenova/mms-tts-por', {
      device: 'wasm',
      progress_callback: i => postMessage({ t: 'prog', i })
    });
  }
}

self.onmessage = async e => {
  const m = e.data;
  try {
    if (m.t === 'load') { await carregar(); postMessage({ t: 'loaded', id: m.id }); }
    if (m.t === 'gen') {
      await carregar();
      const s = await sint(m.text);
      postMessage({ t: 'audio', id: m.id, audio: s.audio, sr: s.sampling_rate }, [s.audio.buffer]);
    }
  } catch (err) {
    postMessage({ t: 'err', id: m.id, msg: err?.message || String(err) });
  }
};
