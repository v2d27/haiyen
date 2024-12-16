document.addEventListener("DOMContentLoaded", () => {
  const formContainer = document.getElementById("form-container");
  const gameContainer = document.getElementById("game-container");
  const userForm = document.getElementById("user-form");
  const gameBoard = document.getElementById("game-board");
  const timerDisplay = document.getElementById("timer");

  const images = [
    "https://lh3.googleusercontent.com/jOY_kTPv_8aI27gCkzohZSBqcytI_mun2LRTXRJtmW1FMZjG8Y11JKk2z8ekVaP8ufZN0fUJ55e1L0eQV0sfz060U0i7GfOp=rw-w1152",     // Hình ảnh thứ nhất
    "https://lh3.googleusercontent.com/koHwfPv4FVcoz7Ao-Ht4z6UvsCdJfOo0KRDDk7mrpfESSJ-l3DK2AtLiVMNrqYEdYN57w0giI6h3fY51XS1axRk2tTzlUdc=rw-w1152",    // Hình ảnh thứ hai
    "https://lh3.googleusercontent.com/HBtSshdBMggdRdfdACI-pD50vLG6OJebNOsMr4sP-ODG9P6OoB0yZv2sbrCavmsa1LN8hg9OJakg_3eWoafZB05flQUtYmY_NQ=rw-w1152",     // Hình ảnh thứ ba
    "https://lh3.googleusercontent.com/VzeyriXH-uZ9jknWYRqelFpAG7FWh73bNhh_STNFLvbyBhJDyYZw5lhtU-CpVO_coaNf8dQATHLZO7nabfXC-n8nuYtdFvk=rw-w1152",// Hình ảnh thứ tư
    "https://lh3.googleusercontent.com/8vIv3H722eSi-skhcy1047WpTFj6-VMGCDRkn_BrKk3gSXzXzUck5gLYTKyWk2NvMmZZIsEsTUZAV2Ci76Oul4n1Ze-_snr8iQ=rw-w1152",    // Hình ảnh thứ năm
    "https://lh3.googleusercontent.com/OMTYS-wxCcNjS7oYiDzC2aYfzAKNuTS6v52YKZldpwtSSbWLLSdnoPdDSwcNSMAQOWotag-om-Igs_lwC1J7ivpLjIX8YDMU=w95-rw",    // Hình ảnh thứ sáu
  ];

  const doubleImages = [...images, ...images].sort(() => Math.random() - 0.5);

  let startTime;
  let timerInterval;
  let firstCard = null;
  let secondCard = null;
  let matches = 0;
  const totalPairs = images.length;

  const scriptURL = "https://script.google.com/macros/s/AKfycbwrLbarLHswePLNGXWyRTMXqgKYdwXPWX_vWJcz01NgO7eZ1GwrHsRZwB6pZ1lneOpH/exec"; // Thay YOUR_DEPLOYMENT_ID bằng URL Apps Script của bạn

  userForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;

    // Kiểm tra nếu số điện thoại đã chơi trước đó
    if (localStorage.getItem(phone)) {
      alert("Số điện thoại này đã chơi một lần rồi!");
      return;
    }

    localStorage.setItem(phone, true); // Lưu số điện thoại vào localStorage để kiểm tra

    formContainer.classList.remove("active");
    gameContainer.classList.add("active");

    startGame();
  });

  function startGame() {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
    createGameBoard();
  }

  function updateTimer() {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.textContent = `Thời gian: ${elapsedTime} giây`;
  }

  function createGameBoard() {
    gameBoard.innerHTML = ""; // Reset board trước khi tạo mới
    doubleImages.forEach((image) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.dataset.image = image;

      const img = document.createElement("img");
      img.src = image;
      card.appendChild(img);

      card.addEventListener("click", () => flipCard(card));
      gameBoard.appendChild(card);
    });
  }

  function flipCard(card) {
    if (card.classList.contains("flipped") || secondCard) return;

    card.classList.add("flipped");

    if (!firstCard) {
      firstCard = card;
    } else {
      secondCard = card;
      checkMatch();
    }
  }

  function checkMatch() {
    const match = firstCard.dataset.image === secondCard.dataset.image;

    if (match) {
      matches++;
      resetCards();

      if (matches === totalPairs) {
        endGame();
      }
    } else {
      setTimeout(() => {
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        resetCards();
      }, 1000);
    }
  }

  function resetCards() {
    firstCard = null;
    secondCard = null;
  }

  function endGame() {
    clearInterval(timerInterval);

    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;

    // Hiển thị thông báo hoàn thành
    alert(`Chúc mừng ${name}! Bạn đã hoàn thành trò chơi trong ${elapsedTime} giây.`);

    // Gửi dữ liệu lên Google Sheets
    sendDataToGoogleSheets(name, phone, email, elapsedTime);
  }

  function sendDataToGoogleSheets(name, phone, email, time) {
    const data = { name, phone, email, time };

    fetch(scriptURL, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Dữ liệu đã gửi thành công:", data);
      })
      .catch((error) => {
        console.error("Lỗi khi gửi dữ liệu:", error);
      });
  }
});
