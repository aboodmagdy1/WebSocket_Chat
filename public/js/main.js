const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

//get userName and roo from url  using the qs cdn scripts make us access to Qs
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
const socket = io(); //i can access this socket because of the script i put  in the chat.html

//Join chatroom
socket.emit("joinRoom", { username, room });

//get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

//message form server
socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);
  //scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Message Submit
chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  //get the elements of form and catch the element of id msg and get the text
  const message = event.target.elements.msg.value;

  //emit the message to the server
  socket.emit("chatMessage", message);

  //clear input after imit
  event.target.elements.msg.value = "";
  event.target.elements.msg.focus();
});

//output message to DOM
function outputMessage(msg) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${msg.username}<span>${msg.time}</span></p>
	<p class="text">
		${msg.text}
	</p>`;

  document.querySelector(".chat-messages").appendChild(div);
}

//add room naem to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}
//add users to DOM
function outputUsers(users) {
  userList.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.innerText = user.username;
    userList.appendChild(li);
  });
}
