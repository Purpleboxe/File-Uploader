document.addEventListener("DOMContentLoaded", () => {
  const contextMenu = document.getElementById("context-menu");
  let selectedFolderId = null;
  let selectedFileId = null;
  let currentFolder = null;

  const offsetX = 50;
  const offsetY = 10;

  document.querySelectorAll(".item").forEach((item) => {
    item.addEventListener("contextmenu", function (e) {
      e.stopPropagation();
      e.preventDefault();

      if (item.classList.contains("folder")) {
        selectedFolderId = this.dataset.folderId;
        contextMenu.style.top = `${e.pageY}px`;
        contextMenu.style.left = `${e.pageX}px`;
        contextMenu.classList.remove("hidden");
      } else if (item.classList.contains("file")) {
        selectedFileId = this.dataset.fileId;
        currentFolder = this.dataset.currentFolder;
        contextMenu.style.top = `${e.pageY}px`;
        contextMenu.style.left = `${e.pageX}px`;
        contextMenu.classList.remove("hidden");
      }
    });
  });

  document.querySelectorAll(".ellipsis").forEach((ellipsis) => {
    ellipsis.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();

      if (ellipsis.classList.contains("folder")) {
        selectedFolderId = this.dataset.folderId;
        contextMenu.style.top = `${e.pageY + offsetY}px`;
        contextMenu.style.left = `${e.pageX - offsetX}px`;
        contextMenu.classList.remove("hidden");
      } else if (ellipsis.classList.contains("file")) {
        selectedFileId = this.dataset.fileId;
        currentFolder = this.dataset.currentFolder;
        contextMenu.style.top = `${e.pageY + offsetY}px`;
        contextMenu.style.left = `${e.pageX - offsetX}px`;
        contextMenu.classList.remove("hidden");
      }
    });
  });

  document.addEventListener("click", function () {
    selectedFolderId = null;
    selectedFileId = null;
    currentFolder = null;
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
        window.location.href = `/folder/${currentFolder}`;
        fetch(`/file/${selectedFileId}/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newFileName }),
        })
          .then(() => {
            window.location.reload();
            selectedFileId = null;
            currentFolder = null;
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
            console.log(window.location.href);
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
        window.location.href = `/folder/${currentFolder}`;
        fetch(`/file/${selectedFileId}/delete`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then(() => {
            window.location.reload();
            selectedFileId = null;
          })
          .catch((error) => console.error("Error:", error));
      }
    }
  });
});
