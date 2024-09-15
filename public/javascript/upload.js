document.addEventListener("DOMContentLoaded", () => {
  const uploadBtn = document.getElementById("uploadBtn");
  const uploadForm = document.getElementById("uploadForm");
  const closeBtn = document.getElementById("closeBtn");

  // Show the form when the Upload File button is clicked
  uploadBtn.addEventListener("click", () => {
    uploadForm.classList.remove("hidden");
  });

  // Hide the form when the close button is clicked
  closeBtn.addEventListener("click", () => {
    uploadForm.classList.add("hidden");
  });

  // Hide the form when clicking outside of the form content
  window.addEventListener("click", (e) => {
    if (e.target === uploadForm) {
      uploadForm.classList.add("hidden");
    }
  });
});
