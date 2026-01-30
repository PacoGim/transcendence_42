const form = document.getElementById("uploadForm") as HTMLFormElement;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  const res = await fetch("/update_avatar", {
    method: "POST",
    body: formData
  });

  const result = await res.json();
  console.log(result);
});
