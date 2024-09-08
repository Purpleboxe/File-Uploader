document.addEventListener("DOMContentLoaded", () => {
  const contextMenu = document.getElementById("context-menu");
  let selectedFolderId = null;

  document.querySelectorAll(".item").forEach((item) => {
    item.addEventListener("contextmenu", function (e) {
      e.preventDefault();

      if (item.classList.contains("folder")) {
        selectedFolderId = this.dataset.folderId;
        contextMenu.style.top = `${e.pageY}px`;
        contextMenu.style.left = `${e.pageX}px`;
        contextMenu.classList.remove("hidden");
      }
    });
  });

  document.addEventListener("click", function () {
    contextMenu.classList.add("hidden");
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
          })
          .catch((error) => console.error("Error:", error));
      }
    }
  });
});
