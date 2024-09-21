document.addEventListener("DOMContentLoaded", () => {
  const contextMenu = document.getElementById("context-menu");
  let selectedFolderId = null;
  let selectedFileId = null;

  document.querySelectorAll(".item").forEach((item) => {
    item.addEventListener("contextmenu", function (e) {
      e.preventDefault();

      if (item.classList.contains("folder")) {
        selectedFolderId = this.dataset.folderId;
        contextMenu.style.top = `${e.pageY}px`;
        contextMenu.style.left = `${e.pageX}px`;
        contextMenu.classList.remove("hidden");
      } else if (item.classList.contains("file")) {
        selectedFileId = this.dataset.fileId;
        contextMenu.style.top = `${e.pageY}px`;
        contextMenu.style.left = `${e.pageX}px`;
        contextMenu.classList.remove("hidden");
      }
    });
  });

  document.addEventListener("click", function () {
    selectedFolderId = null;
    selectedFileId = null;
    contextMenu.classList.add("hidden");
  });

  document.getElementById("update").addEventListener("click", function () {
    if (selectedFolderId) {
      const newFolderName = prompt("Enter the new name for the folder:");

      if (newFolderName) {
        fetch(`/folder/${selectedFolderId}/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newFolderName }),
        })
          .then(() => {
            window.location.href = `/folder/${selectedFolderId}`;
            selectedFolderId = null;
          })
          .catch((error) => console.error("Error:", error));
      }
    } else if (selectedFileId) {
      const newFileName = prompt("Enter the new name for the file:");

      if (newFileName) {
        fetch(`/file/${selectedFileId}/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newFileName }),
        })
          .then(() => {
            window.location.href = `/`;
            selectedFileId = null;
          })
          .catch((error) => console.error("Error:", error));
      }
    }
  });

  document.getElementById("delete").addEventListener("click", function () {
    if (selectedFolderId) {
      if (
        confirm(
          "Are you sure you want to delete this folder? (Everything inside will be lost!)"
        )
      ) {
        fetch(`/folder/${selectedFolderId}/delete`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then(() => {
            window.location.href = "/";
            selectedFolderId = null;
          })
          .catch((error) => console.error("Error:", error));
      }
    } else if (selectedFileId) {
      if (
        confirm(
          "Are you sure you want to delete this file? (The file will be lost!)"
        )
      ) {
        fetch(`/file/${selectedFileId}/delete`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then(() => {
            window.location.href = "/";
            selectedFileId = null;
          })
          .catch((error) => console.error("Error:", error));
      }
    }
  });
});
