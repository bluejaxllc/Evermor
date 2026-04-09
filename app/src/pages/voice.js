import { renderSidebar } from '../components/sidebar.js';
import { renderHeader } from '../components/header.js';
import { getUser } from '../auth.js';
import { fetchRows, insertRow, deleteRow, uploadFile, getPublicUrl } from '../supabase.js';
import { toast } from '../components/toast.js';

const CATEGORIES = [
  { value: 'story', label: 'Story', icon: '📖' },
  { value: 'message', label: 'Message', icon: '💌' },
  { value: 'advice', label: 'Advice', icon: '💡' },
  { value: 'memory', label: 'Memory', icon: '💭' },
];

export default async function voicePage(app) {
  const user = getUser();

  app.innerHTML = `<div class="app-layout"></div>`;
  const layout = app.querySelector('.app-layout');
  renderSidebar(layout);

  const main = document.createElement('main');
  main.className = 'main-content';
  layout.appendChild(main);
  renderHeader(main, 'Voice Recordings');

  main.innerHTML += `
    <div class="page-content voice-content">
      <!-- Recorder Card -->
      <div class="recorder-card card-glass">
        <div class="recorder-visual">
          <div class="waveform-container" id="waveform">
            ${Array.from({ length: 40 }, (_, i) => `<div class="wave-bar" style="animation-delay: ${i * 0.05}s"></div>`).join('')}
          </div>
          <div class="recorder-timer" id="recorder-timer">00:00</div>
        </div>

        <div class="recorder-controls">
          <button class="rec-btn rec-secondary" id="rec-discard" style="display:none;" aria-label="Discard">
            <span class="material-symbols-rounded">delete</span>
          </button>
          <button class="rec-btn rec-primary" id="rec-toggle" aria-label="Record">
            <span class="material-symbols-rounded" id="rec-icon">mic</span>
          </button>
          <button class="rec-btn rec-secondary" id="rec-pause" style="display:none;" aria-label="Pause">
            <span class="material-symbols-rounded">pause</span>
          </button>
        </div>

        <p class="recorder-hint" id="recorder-hint">Tap the microphone to start recording</p>

        <!-- Save form (shown after recording) -->
        <div class="recorder-save-form" id="save-form" style="display:none;">
          <input type="text" id="rec-title" class="input-glass" placeholder="Give this recording a title...">
          <textarea id="rec-description" class="input-glass" rows="2" placeholder="What is this recording about?"></textarea>
          <div class="rec-save-row">
            <select id="rec-category" class="input-glass">
              ${CATEGORIES.map(c => `<option value="${c.value}">${c.icon} ${c.label}</option>`).join('')}
            </select>
            <button class="btn-accent" id="rec-save">
              <span class="material-symbols-rounded">save</span>
              Save to Archive
            </button>
          </div>
        </div>
      </div>

      <!-- Recordings List -->
      <div class="recordings-section">
        <h3 class="section-title">Your Recordings</h3>
        <div class="recordings-list" id="recordings-list">
          <div class="loading-state">
            <span class="spinner-lg"></span>
            <p>Loading recordings...</p>
          </div>
        </div>
      </div>
    </div>
  `;

  let mediaRecorder = null;
  let audioChunks = [];
  let audioBlob = null;
  let isRecording = false;
  let isPaused = false;
  let timerInterval = null;
  let seconds = 0;

  const toggleBtn = app.querySelector('#rec-toggle');
  const pauseBtn = app.querySelector('#rec-pause');
  const discardBtn = app.querySelector('#rec-discard');
  const recIcon = app.querySelector('#rec-icon');
  const timerEl = app.querySelector('#recorder-timer');
  const hintEl = app.querySelector('#recorder-hint');
  const waveform = app.querySelector('#waveform');
  const saveForm = app.querySelector('#save-form');
  const recordingsList = app.querySelector('#recordings-list');

  // Toggle recording
  toggleBtn.addEventListener('click', async () => {
    if (!isRecording) {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
        mediaRecorder.onstop = () => {
          audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          stream.getTracks().forEach(t => t.stop());
          showSaveForm();
        };

        mediaRecorder.start();
        isRecording = true;
        recIcon.textContent = 'stop';
        toggleBtn.classList.add('recording');
        pauseBtn.style.display = '';
        discardBtn.style.display = '';
        hintEl.textContent = 'Recording... Speak clearly.';
        waveform.classList.add('active');
        startTimer();
      } catch (err) {
        toast('Microphone access denied. Please allow microphone access.', 'error');
      }
    } else {
      // Stop recording
      mediaRecorder.stop();
      isRecording = false;
      isPaused = false;
      stopTimer();
      recIcon.textContent = 'mic';
      toggleBtn.classList.remove('recording');
      pauseBtn.style.display = 'none';
      discardBtn.style.display = 'none';
      waveform.classList.remove('active');
    }
  });

  // Pause
  pauseBtn.addEventListener('click', () => {
    if (isPaused) {
      mediaRecorder.resume();
      isPaused = false;
      pauseBtn.querySelector('.material-symbols-rounded').textContent = 'pause';
      waveform.classList.add('active');
      startTimer();
    } else {
      mediaRecorder.pause();
      isPaused = true;
      pauseBtn.querySelector('.material-symbols-rounded').textContent = 'play_arrow';
      waveform.classList.remove('active');
      stopTimer();
    }
  });

  // Discard
  discardBtn.addEventListener('click', () => {
    if (confirm('Discard this recording?')) {
      mediaRecorder.stop();
      isRecording = false;
      isPaused = false;
      audioBlob = null;
      stopTimer();
      seconds = 0;
      timerEl.textContent = '00:00';
      recIcon.textContent = 'mic';
      toggleBtn.classList.remove('recording');
      pauseBtn.style.display = 'none';
      discardBtn.style.display = 'none';
      hintEl.textContent = 'Tap the microphone to start recording';
      waveform.classList.remove('active');
      saveForm.style.display = 'none';
    }
  });

  function startTimer() {
    timerInterval = setInterval(() => {
      seconds++;
      const m = String(Math.floor(seconds / 60)).padStart(2, '0');
      const s = String(seconds % 60).padStart(2, '0');
      timerEl.textContent = `${m}:${s}`;
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  function showSaveForm() {
    hintEl.textContent = 'Recording complete. Save it to your archive.';
    saveForm.style.display = 'flex';

    // Playback preview
    const audioUrl = URL.createObjectURL(audioBlob);
    if (!app.querySelector('#rec-preview')) {
      const audio = document.createElement('audio');
      audio.id = 'rec-preview';
      audio.controls = true;
      audio.src = audioUrl;
      audio.className = 'rec-preview-audio';
      saveForm.insertBefore(audio, saveForm.firstChild);
    } else {
      app.querySelector('#rec-preview').src = audioUrl;
    }
  }

  // Save recording
  app.querySelector('#rec-save').addEventListener('click', async () => {
    if (!audioBlob) return;
    const title = app.querySelector('#rec-title').value.trim() || 'Untitled Recording';
    const description = app.querySelector('#rec-description').value.trim();
    const category = app.querySelector('#rec-category').value;
    const path = `${user.id}/${Date.now()}_recording.webm`;

    try {
      toast('Saving recording...', 'info', 2000);
      await uploadFile('voice', path, audioBlob);
      await insertRow('voice_recordings', {
        user_id: user.id,
        title,
        description,
        file_path: path,
        duration: seconds,
        category
      });
      toast('Voice recording archived', 'success');

      // Reset
      audioBlob = null;
      seconds = 0;
      timerEl.textContent = '00:00';
      saveForm.style.display = 'none';
      hintEl.textContent = 'Tap the microphone to start recording';
      app.querySelector('#rec-title').value = '';
      app.querySelector('#rec-description').value = '';
      app.querySelector('#rec-preview')?.remove();
      loadRecordings();
    } catch (err) {
      toast('Failed to save recording', 'error');
    }
  });

  // Load existing recordings
  async function loadRecordings() {
    try {
      const recordings = await fetchRows('voice_recordings', { userId: user.id });
      if (recordings.length === 0) {
        recordingsList.innerHTML = `
          <div class="empty-state">
            <span class="material-symbols-rounded empty-icon">mic</span>
            <p>No recordings yet. Your voice is the most personal part of your legacy.</p>
          </div>
        `;
        return;
      }

      recordingsList.innerHTML = recordings.map(rec => {
        const cat = CATEGORIES.find(c => c.value === rec.category);
        const m = Math.floor((rec.duration || 0) / 60);
        const s = (rec.duration || 0) % 60;
        return `
          <div class="recording-card card-glass">
            <div class="rec-card-icon">
              <span class="material-symbols-rounded">graphic_eq</span>
            </div>
            <div class="rec-card-info">
              <h4 class="rec-card-title">${rec.title}</h4>
              <div class="rec-card-meta">
                <span>${cat?.icon || '🎙️'} ${cat?.label || rec.category}</span>
                <span>•</span>
                <span>${m}:${String(s).padStart(2, '0')}</span>
                <span>•</span>
                <span>${new Date(rec.created_at).toLocaleDateString()}</span>
              </div>
              ${rec.description ? `<p class="rec-card-desc">${rec.description}</p>` : ''}
            </div>
            <div class="rec-card-actions">
              <audio controls src="${getPublicUrl('voice', rec.file_path)}" preload="none" class="rec-audio-player"></audio>
              <button class="btn-icon-sm rec-delete" data-id="${rec.id}" aria-label="Delete">
                <span class="material-symbols-rounded">delete</span>
              </button>
            </div>
          </div>
        `;
      }).join('');

      // Delete handlers
      recordingsList.querySelectorAll('.rec-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Delete this recording?')) return;
          try {
            await deleteRow('voice_recordings', btn.dataset.id);
            toast('Recording deleted', 'info');
            loadRecordings();
          } catch (err) {
            toast('Failed to delete recording', 'error');
          }
        });
      });
    } catch (e) {
      recordingsList.innerHTML = `
        <div class="empty-state">
          <span class="material-symbols-rounded empty-icon">mic</span>
          <p>No recordings yet. Start capturing your voice.</p>
        </div>
      `;
    }
  }

  loadRecordings();

  // Cleanup on navigation
  return () => {
    stopTimer();
    if (mediaRecorder?.state !== 'inactive') {
      try { mediaRecorder?.stop(); } catch (e) {}
    }
  };
}
