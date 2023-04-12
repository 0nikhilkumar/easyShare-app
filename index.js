const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileInput");
const browseBtn = document.querySelector(".browseBtn");

const progressContainer = document.querySelector(".progress-container");
const bgProgress = document.querySelector(".bg-progress");
const progressBar = document.querySelector(".progress-bar");
const percentDiv = document.querySelector("#percent");

const sharingContainer = document.querySelector(".sharing-container");
const fileURLInput = document.querySelector("#fileURL");
const copyBtn = document.querySelector("#copyBtn");

const emailForm = document.querySelector("#emailForm");

const toast = document.querySelector(".toast");

const host = "https://inshare-backend-69ko.onrender.com";
const uploadURL = `${host}/api/files`;
const emailURL = `${host}/api/files/send`;

const maxAllowedSize = 100 * 1024 * 1024; //100MB

// Drop Zone Area
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  if (!dropZone.classList.contains("dragged")) {
    dropZone.classList.add("dragged");
  }
});

dropZone.addEventListener("dragleave", (e) => {
  dropZone.classList.remove("dragged");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragged");

  const dropFiles = e.dataTransfer.files;

  // console.log(dropFiles);

  if (dropFiles.length) {
    fileInput.files = dropFiles;
    uploadFiles();
  }
});

fileInput.addEventListener("change", () => {
  uploadFiles();
});

browseBtn.addEventListener("click", (e) => {
  fileInput.click();
});

copyBtn.addEventListener("click", () => {
  fileURLInput.select();
  document.execCommand("copy");
  showToast("Link Copied");
});

const uploadFiles = () => {
  if (fileInput.files.length > 1) {
    resetFileInput();
    showToast("Only Upload One File");
  }
  const file = fileInput.files[0];
  if (file.size > maxAllowedSize) {
    showToast("Can't Upload more than 100MB");
    resetFileInput();
    return;
  }

  progressContainer.style.display = "block";
  const formData = new FormData();
  formData.append("myfile", file);

  const xhr = new XMLHttpRequest();
  //
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      // console.log(xhr.response);
      onUploadSuccess(JSON.parse(xhr.response));
    }
  };

  xhr.upload.onprogress = updateProgress;
  xhr.upload.onerror = () => {
    resetFileInput();
    showToast(`Error in upload: ${xhr.statusText}`);
  };

  xhr.open("POST", uploadURL);
  xhr.send(formData);
};

const updateProgress = (e) => {
  const percent = Math.round((e.loaded / e.total) * 100);
  // console.log(percent);
  bgProgress.style.width = `${percent}%`;
  percentDiv.innerText = percent;
  progressBar.style.transform = `scaleX(${percent / 100})`;
};

const onUploadSuccess = ({ file: url }) => {
  // console.log(url);
  resetFileInput();
  emailForm[2].removeAttribute("disabled");
  progressContainer.style.display = "none";
  sharingContainer.style.display = "block";
  fileURLInput.value = url;
};

const resetFileInput = () => {
  fileInput.value = "";
};

emailForm.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("Submit Form");

  const url = fileURLInput.value;
  const formData = {
    uuid: url.split("/").splice(-1, 1)[0],
    emailTo: emailForm.elements["to-email"].value,
    emailFrom: emailForm.elements["from-email"].value,
  };
  emailForm[2].setAttribute("disabled", "true");
  // console.table(formData);
  fetch(emailURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then(({ success }) => {
      if (success) {
        sharingContainer.style.display = "none";
        showToast("Email Sent");
      }
    });
});

let toastTimer;
const showToast = (msg) => {
  toast.innerText = msg;
  toast.style.transform = "translate(-50%, 0)";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.transform = "translate(-50%, 60px)";
  }, 1500);
};
