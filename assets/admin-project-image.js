const projectsForm = document.querySelector("#projectsForm");
const allowedUploadTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const maxUploadSize = 8 * 1024 * 1024;

function addUploadField(form, target, labelText, accept) {
  const targetInput = form?.elements.namedItem(target);
  if (!targetInput || form.querySelector(`[data-upload-target="${target}"]`)) return;

  const label = document.createElement("label");
  label.className = targetInput.closest("label")?.classList.contains("full") ? "full" : "";
  label.append(labelText);

  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  input.dataset.uploadTarget = target;
  input.setAttribute("aria-label", labelText);
  label.append(input);

  targetInput.closest("label").insertAdjacentElement("afterend", label);
}

if (projectsForm && !projectsForm.elements.namedItem("image")) {
  const imageField = document.createElement("label");
  imageField.className = "full";
  imageField.append("URL gambar proyek (HTTPS)");

  const imageInput = document.createElement("input");
  imageInput.name = "image";
  imageInput.type = "url";
  imageInput.placeholder = "https://contoh.com/gambar-proyek.jpg";
  imageInput.autocomplete = "url";
  imageField.append(imageInput);

  const descriptionField = projectsForm.querySelector(".full");
  projectsForm.insertBefore(imageField, descriptionField || null);
}

addUploadField(
  document.querySelector("#profileForm"),
  "image",
  "Atau upload foto profil ke Google Drive",
  "image/jpeg,image/png,image/gif,image/webp",
);
addUploadField(
  document.querySelector("#profileForm"),
  "cv",
  "Atau upload CV ke Google Drive",
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
);
addUploadField(
  projectsForm,
  "image",
  "Atau upload gambar proyek ke Google Drive",
  "image/jpeg,image/png,image/gif,image/webp",
);
addUploadField(
  document.querySelector("#credentialsForm"),
  "url",
  "Atau upload dokumen ke Google Drive",
  "image/jpeg,image/png,image/gif,image/webp,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
);
addUploadField(
  document.querySelector("#galleryForm"),
  "image",
  "Atau upload foto ke Google Drive",
  "image/jpeg,image/png,image/gif,image/webp",
);

const uploadNotice = document.createElement("p");
uploadNotice.className = "hint";
uploadNotice.textContent =
  "File disimpan di Google Drive dan dapat dilihat siapa saja yang memiliki link. Maksimal 8 MB per file.";
document.querySelector("#adminStatus")?.insertAdjacentElement("afterend", uploadNotice);

const galleryHint = document.querySelector("#tab-gallery .hint");
if (galleryHint) {
  galleryHint.textContent =
    "Pilih file di atas untuk mengunggah foto ke Google Drive, atau isi URL HTTPS secara manual.";
}

document.body.addEventListener("change", async (event) => {
  const input = event.target.closest("input[type=file][data-upload-target]");
  const file = input?.files?.[0];
  if (!input || !file) return;

  if (!allowedUploadTypes.has(file.type)) {
    status("Jenis file tidak didukung. Gunakan JPG, PNG, GIF, WebP, PDF, DOC, atau DOCX.", true);
    input.value = "";
    return;
  }
  if (file.size > maxUploadSize) {
    status("Ukuran file maksimal 8 MB.", true);
    input.value = "";
    return;
  }

  const form = input.closest("form");
  const target = form?.elements.namedItem(input.dataset.uploadTarget);
  if (!target) {
    status("Kolom URL tujuan upload tidak ditemukan.", true);
    input.value = "";
    return;
  }

  input.disabled = true;
  status(`Mengunggah ${file.name} ke Google Drive...`);
  try {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result));
      reader.addEventListener("error", () => reject(Error("File tidak dapat dibaca.")));
      reader.readAsDataURL(file);
    });
    const base64 = String(dataUrl).split(",")[1];
    if (!base64) throw Error("File tidak dapat diproses.");

    const result = await api("uploadFile", {
      fileName: file.name,
      mimeType: file.type,
      data: base64,
    });
    target.value = result.url;
    input.value = "";
    status(`${file.name} berhasil diunggah. Simpan formulir untuk menerapkan perubahan.`);
  } catch (error) {
    status(error.message || "Upload gagal.", true);
  } finally {
    input.disabled = false;
  }
});
