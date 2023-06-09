import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.getElementById("chat_container");

let loadInterval;

// 机器人思考时的...效果
function loader(element) {
  element.textContent = "";
  loadInterval = setInterval(() => {
    element.textContent += ".";
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

// 机器人打字输出效果
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

// 为对话创建唯一ID
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);
  return `id-${timestamp}-${hexadecimalString}`;
}

// 对话斑马条纹
function chatStripe(isAi, value, uniqueId) {
  return `
    <div class="wrapper ${isAi && "ai"}">
      <div class="chat">
        <div class="profile">
          <img
            src="${isAi ? bot : user}"
            alt="${isAi ? "bot" : "user"}"
          />
        </div>
        <div class="message" id="${uniqueId}">${value}</div>
      </div>
    </div>
  `;
}

// 提交对话
const handleSubmit = async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  // 用户框 不需要设置id
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
  form.reset();

  // 机器人框
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  // 滚动到底
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // 在机器人输出框中设置loading效果
  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  // 请求机器人回答
  const response = await fetch("https://my-chatgpt-node-server.onrender.com/", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";
  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();
    messageDiv.innerHTML = "something went wrong.";
    alert(err);
  }
};

// 监听发送事件
form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    handleSubmit(e);
  }
});
