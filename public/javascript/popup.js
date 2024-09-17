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

const modal = document.getElementById("fileDetailsModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const fileInfo = document.getElementById("fileInfo");
const downloadBtn = document.getElementById("downloadBtn");

function showFileDetails(fileName, fileSize, createdAt, fileId) {
  fileInfo.innerHTML = `
    <p><strong>Name:</strong> ${fileName}</p>
    <p><strong>Size:</strong> ${fileSize} KB</p>
    <p><strong>Created:</strong> ${createdAt}</p>
  `;

  // Set the download button link
  downloadBtn.onclick = function () {
    window.location.href = "/file/" + fileId + "/download";
  };

  // Show the modal
  modal.classList.remove("hidden");
}

// Function to close the modal
closeModalBtn.onclick = function () {
  modal.classList.add("hidden");
};

// Close modal if clicked outside the content
window.onclick = function (event) {
  if (event.target == modal) {
    modal.classList.add("hidden");
  }
};
