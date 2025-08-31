// Canvas + optional tab audio recording using MediaRecorder
let recorder: MediaRecorder | null = null;
let chunks: Blob[] = [];

export function setupRecorderControls() {
  // Keyboard shortcuts for demo
  window.addEventListener('keydown', (e) => {
    if (e.key === 'r') startRecording().catch(console.error);
    if (e.key === 's') stopRecording();
  });
  console.info('Recording: press "r" to start, "s" to stop.');
}

export async function startRecording() {
  if (recorder && recorder.state === 'recording') return;

  const canvas = document.getElementById('vis-canvas') as HTMLCanvasElement | null;
  if (!canvas) throw new Error('Canvas not found');

  const videoStream = (canvas as any).captureStream(60) as MediaStream;

  // Try to capture tab audio (requires user prompt)
  let audioTrack: MediaStreamTrack | null = null;
  try {
    const display = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    audioTrack = display.getAudioTracks()[0] || null;
  } catch (e) {
    console.warn('Tab audio capture not granted. Recording video only.');
  }

  if (audioTrack) videoStream.addTrack(audioTrack);

  chunks = [];
  recorder = new MediaRecorder(videoStream, { mimeType: 'video/webm;codecs=vp9,opus', videoBitsPerSecond: 6_000_000 });
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: `try240-${Date.now()}.webm` });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  recorder.start();
  console.info('Recording started.');
}

export function stopRecording() {
  if (recorder && recorder.state !== 'inactive') {
    recorder.stop();
    console.info('Recording stopped.');
  }
}