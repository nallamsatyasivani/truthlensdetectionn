// Vanilla JS: drag/drop + image preview for the upload dropzone.
(function () {
  const dz = document.querySelector('.dropzone');
  if (!dz) return;

  const input = dz.querySelector('input[type=file]');
  const preview = dz.querySelector('#preview');
  const label = dz.querySelector('#dropzone-label');

  function showPreview(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    preview.src = url;
    preview.hidden = false;
    if (label) label.querySelector('span').textContent = file.name;
  }

  input.addEventListener('change', (e) => showPreview(e.target.files[0]));

  ['dragenter', 'dragover'].forEach((evt) =>
    dz.addEventListener(evt, (e) => { e.preventDefault(); dz.classList.add('drag'); })
  );
  ['dragleave', 'drop'].forEach((evt) =>
    dz.addEventListener(evt, (e) => { e.preventDefault(); dz.classList.remove('drag'); })
  );
  dz.addEventListener('drop', (e) => {
    const f = e.dataTransfer.files[0];
    if (f) {
      input.files = e.dataTransfer.files;
      showPreview(f);
    }
  });
})();
