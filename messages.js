document.addEventListener("DOMContentLoaded", () => {
  // 🔁 Toggle Chat on Item Click
  const chatItems = document.querySelectorAll(".chat-item");
  const chatBox = document.getElementById("chat-box");
  const placeholder = document.getElementById("chat-placeholder");
  const chatTitle = document.getElementById("chat-title");
  const openSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-quick-win-video-game-notification-269.mp3");
  const themeToggler = document.querySelector(".theme-toggler");



  chatItems.forEach(item => {
    item.addEventListener("click", () => {
      // Show chat box
      placeholder.classList.add("hidden");
      chatBox.classList.remove("hidden");

      // Get data attributes
      const name = item.getAttribute("data-name") || "Unknown";
      const status = item.getAttribute("data-status") || "";
      const img = item.getAttribute("data-img") || "images/default.jpg";
      const type = item.getAttribute("data-type") || "single";

      // Update chat header
      document.querySelector(".chat-header img").src = img;
      document.querySelector(".chat-meta h3").textContent = name;
      document.querySelector(".chat-meta div").textContent = status;

      // Update profile panel
      document.querySelector(".logo-circle img.company-logo").src = img;
      document.querySelector(".studio-name").textContent = name;
      document.querySelector(".tagline").textContent = status;

      // Store chat type
      chatBox.setAttribute("data-type", type);

      // Close info panel if it's a single chat
      const infoPanel = document.querySelector(".info-panel");
      const container = document.querySelector(".container-new") || document.querySelector(".container");
      if (type === "single") {
        infoPanel.classList.add("hidden");
        if (container.classList.contains("container-new")) {
          container.classList.replace("container-new", "container");
        }
      }

      openSound.play();
    });
  });






  // 🌙 Toggle Dark Mode
  themeToggler.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme-variables");

    themeToggler.querySelector("span:nth-child(1)").classList.toggle("active");
    themeToggler.querySelector("span:nth-child(2)").classList.toggle("active");
  });

  // Optionally bind this to a button:
  // document.getElementById("dark-mode-toggle").addEventListener("click", toggleDarkMode);

  // 📩 SEND Message
  const sendBtn = document.getElementById("send-btn");
  const messageInput = document.querySelector(".chat-input input");
  const messagesContainer = document.querySelector(".chat-messages");

  const extractLinks = (text) => {
    const regex = /https?:\/\/[^\s]+/g;
    return text.match(regex) || [];
  };

  sendBtn?.addEventListener("click", () => {
    const text = messageInput.value.trim();
    if (!text) return;

    const div = document.createElement("div");
    div.className = "message sent";
    div.textContent = text;

    const now = new Date();
    div.setAttribute("data-time", `${now.getHours()}:${now.getMinutes()}`);

    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // 🔗 Extract links and add to Links tab
    const links = extractLinks(text);
    const linksList = document.getElementById("linksList");
    links.forEach(link => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${link}" target="_blank">${link}</a>`;
      linksList?.appendChild(li);
    });

    messageInput.value = "";
  });


  // Send on Enter key
  messageInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendBtn.click();
    }
  });


  // 😀 EMOJI Button
  const emojiBtn = document.getElementById("emoji-btn");

  emojiBtn?.addEventListener("click", () => {
    messageInput.value += "😊";
  });

  // 📎 ATTACH File
  const attachBtn = document.getElementById("attach-btn");
  const fileInput = document.getElementById("file-input");

  attachBtn?.addEventListener("click", () => {
    fileInput?.click();
  });

  fileInput?.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const fileType = file.type;
    const url = URL.createObjectURL(file);

    const messageDiv = document.createElement("div");
    messageDiv.className = "sent message";

    if (fileType.startsWith("image/")) {
      // 👇 Add image to chat and info panel
      messageDiv.innerHTML = `
      <div class="file-preview">
        <img src="${url}" alt="${file.name}">
        <div class="file-name">${file.name}</div>
      </div>
      <div class="tick-status">✓</div>
    `;
      document.getElementById("mediaGallery")?.appendChild(Object.assign(document.createElement("img"), {
        src: url,
        alt: file.name,
        style: "width:100%; height:80px; object-fit:cover; border-radius:6px;"
      }));
    } else if (fileType === "application/pdf") {
      // 👇 Add file to chat and files list
      messageDiv.innerHTML = `
      <div class="file-preview">
        📄 <a href="${url}" download="${file.name}">${file.name}</a>
      </div>
      <div class="tick-status">✓</div>
    `;
      const li = document.createElement("li");
      li.innerHTML = `<a href="${url}" download>${file.name}</a>`;
      document.getElementById("filesList")?.appendChild(li);
    } else if (fileType.startsWith("audio/")) {
      // 👇 Add audio to chat only
      messageDiv.innerHTML = `
      <audio controls>
        <source src="${url}" type="${fileType}">
      </audio>
      <div class="tick-status">✓</div>
    `;
    } else {
      // 👇 Add generic file to chat and info panel
      messageDiv.innerHTML = `
      <div class="file-preview">
        📁 <a href="${url}" download="${file.name}">${file.name}</a>
      </div>
      <div class="tick-status">✓</div>
    `;
      const li = document.createElement("li");
      li.innerHTML = `<a href="${url}" download>${file.name}</a>`;
      document.getElementById("filesList")?.appendChild(li);
    }

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });



  // 🎤 MIC Button
  let mediaRecorder;
  let audioChunks = [];

  const micBtn = document.getElementById("mic-btn");
  micBtn?.addEventListener("click", async () => {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const audioURL = URL.createObjectURL(audioBlob);

          const messageDiv = document.createElement("div");
          messageDiv.className = "sent message";
          messageDiv.innerHTML = `
          <audio controls>
            <source src="${audioURL}" type="audio/webm">
            Your browser does not support the audio tag.
          </audio>
          <div class="tick-status">✓</div>
        `;
          messagesContainer.appendChild(messageDiv);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        };

        mediaRecorder.start();
        alert("🎙️ Recording... Click mic again to stop.");
      } catch (error) {
        alert("Microphone access denied or not supported.");
      }
    } else if (mediaRecorder.state === "recording") {
      // Stop recording
      mediaRecorder.stop();
    }
  });



  //CLOSE CHAT
  document.getElementById("close-chat-btn")?.addEventListener("click", () => {
    document.getElementById("chat-box").classList.add("hidden");
    document.getElementById("chat-placeholder").classList.remove("hidden");

    chatBox.classList.add("hidden");
    chatPlaceholder.classList.remove("hidden");

    // remove active class from all chat items
    document.querySelectorAll(".chat-item").forEach(i => i.classList.remove("active"));
  });



  //INFO PANEL HIDE AND UNHIDE
  const profile = document.querySelector(".chat-meta");       // gets the first one
  const info = document.querySelector(".info-panel");
  const container = document.querySelector(".container");

  profile?.addEventListener("click", () => {
    const chatType = chatBox.getAttribute("data-type");
    const isGroup = chatType === "group";

    // Show/hide members section based on chat type
    document.querySelector(".members-section").style.display = isGroup ? "block" : "none";
    document.querySelector(".add-member-btn").style.display = isGroup ? "block" : "none";

    info?.classList.toggle("hidden");
    container?.classList.replace("container", "container-new");
  });



  // INFO PANEL CLOSE BUTTON
  const closeInfoBtn = document.getElementById("close-chat-btn-info");
  closeInfoBtn?.addEventListener("click", () => {
    const info = document.querySelector(".info-panel");
    const container = document.querySelector(".container-new") || document.querySelector(".container");
    info?.classList.add("hidden");
    if (container.classList.contains("container-new")) {
      container.classList.replace("container-new", "container");
    }
  });


  // Tab switching logic for attachments section
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active from all buttons and tabs
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));

      // Activate current
      btn.classList.add("active");
      const tabId = btn.getAttribute("data-tab");
      document.getElementById(tabId)?.classList.add("active");
    });
  });



  // Toggle Members Dropdown
  const membersHeader = document.getElementById("membersHeader");
  const membersBody = document.getElementById("membersBody");
  const membersToggle = document.getElementById("membersToggle");

  membersHeader?.addEventListener("click", () => {
    membersBody.classList.toggle("show");
    membersToggle.classList.toggle("rotate");
  });

  // Add Member Logic
  // Modal Elements
  const addMemberBtn = document.getElementById("addMemberBtn");
  const addMemberModal = document.getElementById("addMemberModal");
  const closeAddModal = document.getElementById("closeAddModal");
  const cancelAddMember = document.getElementById("cancelAddMember");
  const confirmAddMember = document.getElementById("confirmAddMember");
  const newMemberNameInput = document.getElementById("newMemberName");
  const membersList = document.getElementById("membersList");

  // Open Modal
  addMemberBtn?.addEventListener("click", () => {
    document.getElementById("addMemberModal").classList.remove("hidden");
    newMemberNameInput.value = "";
    addMemberModal.style.display = "block";
    newMemberNameInput.focus();
  });

  // Close Modal
  const closeModal = () => {
    addMemberModal.style.display = "none";
  };

  closeAddModal?.addEventListener("click", closeModal);
  cancelAddMember?.addEventListener("click", closeModal);

  // Add Member
  confirmAddMember?.addEventListener("click", () => {
    const name = newMemberNameInput.value.trim();
    if (name) {
      const li = document.createElement("li");
      li.innerHTML = `<img src="images/profile-1.jpeg"> ${name}`;
      membersList.appendChild(li);
      closeModal();
    } else {
      alert("Please enter a name.");
    }
  });

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === addMemberModal) closeModal();
  });


  //SEARCHHHH
  const searchInput = document.querySelector(".search-input");


  searchInput?.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();

    chatItems.forEach(item => {
      const nameElement = item.querySelector("strong");
      const fullName = nameElement.textContent;
      const lowerName = fullName.toLowerCase();

      if (query && lowerName.includes(query)) {
        // Highlight matched text
        const matchStart = lowerName.indexOf(query);
        const matchEnd = matchStart + query.length;
        const before = fullName.slice(0, matchStart);
        const match = fullName.slice(matchStart, matchEnd);
        const after = fullName.slice(matchEnd);

        nameElement.innerHTML = `${before}<span class="highlight">${match}</span>${after}`;
        item.style.display = "flex";
      } else if (!query) {
        // Clear highlight if input is empty
        nameElement.innerHTML = fullName;
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });
  });


  function setupDropdownMenus() {
    document.querySelectorAll(".action-menu-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        // Close others
        document.querySelectorAll(".chat-item").forEach(item => item.classList.remove("show-dropdown"));
        const chatItem = btn.closest(".chat-item");
        chatItem?.classList.toggle("show-dropdown");
      });
    });

    // Click outside to close all dropdowns
    document.addEventListener("click", () => {
      document.querySelectorAll(".chat-item").forEach(item => item.classList.remove("show-dropdown"));
    });

    // Pin/Unpin logic
    document.querySelectorAll(".pin-option").forEach(option => {
      option.addEventListener("click", (e) => {
        e.stopPropagation();
        const chatItem = option.closest(".chat-item");
        const allList = document.getElementById("all-list");
        const pinnedList = document.getElementById("pinned-list");

        const isPinned = chatItem.classList.contains("pinned");

        if (isPinned) {
          chatItem.classList.remove("pinned");
          option.textContent = "Pin";
          allList.appendChild(chatItem);
        } else {
          chatItem.classList.add("pinned");
          option.textContent = "📍 Unpin";
          pinnedList.appendChild(chatItem);
        }

        chatItem.classList.remove("show-dropdown"); // close dropdown
      });
    });
  }

  setupDropdownMenus();



  //CHAT HIGHLIGHT WHEN CLICKED
  chatItems.forEach(item => {
    item.addEventListener("click", () => {
      // remove active from all chat items
      chatItems.forEach(i => i.classList.remove("active"));

      // add active to clicked item
      item.classList.add("active");

      // show chat box
      placeholder.classList.add("hidden");
      chatBox.classList.remove("hidden");

      // update title, image, etc. as you're already doing...
    });
  });

  document.getElementById("close-chat-btn")?.addEventListener("click", () => {
    chatBox.classList.add("hidden");
    placeholder.classList.remove("hidden");

    // remove active class from all chat items
    document.querySelectorAll(".chat-item").forEach(i => i.classList.remove("active"));
  });


  function updateUnreadCount() {
    let totalUnread = 0;
    document.querySelectorAll(".chat-item").forEach(item => {
      totalUnread += parseInt(item.getAttribute("data-unread") || "0");
    });

    const badge = document.getElementById("unread-count");
    if (badge) {
      if (totalUnread > 0) {
        badge.textContent = totalUnread;
        badge.classList.remove("hidden");
      } else {
        badge.classList.add("hidden");
      }
    }
  }

  updateUnreadCount();

  const addBtn = document.getElementById("add-btn");
  const addMenu = document.getElementById("add-menu");
  const openAddUser = document.getElementById("openAddUser");
  const openAddGroup = document.getElementById("openAddGroup");
  const chatModal = document.getElementById("chatModal");
  const closeChatModal = document.getElementById("closeChatModal");
  const modalTitle = document.getElementById("modalTitle");
  const chatNameInput = document.getElementById("chatName");
  const chatImageInput = document.getElementById("chatImage");
  const chatMembersInput = document.getElementById("chatMembers");
  const createChatBtn = document.getElementById("createChatBtn");
  const allList = document.getElementById("all-list");

  let currentChatType = "user";

  // Show/hide menu
  addBtn.addEventListener("click", () => {
    addMenu.classList.toggle("hidden");
  });

  // Open modal for user
  openAddUser.addEventListener("click", () => {
    currentChatType = "user";
    modalTitle.textContent = "Add User";
    chatMembersInput.classList.add("hidden");
    chatModal.classList.remove("hidden"); // <--- THIS LINE
    addMenu.classList.add("hidden");
  });



  // Open modal for group
  openAddGroup.addEventListener("click", () => {
    currentChatType = "group";
    modalTitle.textContent = "Create Group";
    chatMembersInput.classList.remove("hidden");
    chatModal.classList.remove("hidden");
    addMenu.classList.add("hidden");
  });

  // Close modal
  closeChatModal.addEventListener("click", () => {
    chatModal.classList.add("hidden");
  });

  // Create chat item
  createChatBtn.addEventListener("click", () => {
    console.log("✅ Create button clicked");
    const name = chatNameInput.value.trim();
    const imgFile = chatImageInput.files[0];
    const members = chatMembersInput.value.trim();

    if (!name) return alert("Please enter a name.");

    let imgUrl = currentChatType === "group" ? "images/wlt-logo.png" : "images/profile-1.jpg";

    if (imgFile) {
      imgUrl = URL.createObjectURL(imgFile);
    }

    const chatItem = document.createElement("div");
    chatItem.className = "chat-item";
    chatItem.setAttribute("data-name", name);
    chatItem.setAttribute("data-status", currentChatType === "group" ? "Group Created" : "Online");
    chatItem.setAttribute("data-img", imgUrl);
    chatItem.setAttribute("data-type", currentChatType);

    chatItem.innerHTML = `
      <img src="${imgUrl}" />
      <div>
        <strong>${name}</strong>
        <div>${currentChatType === "group" ? "Group Created" : "Online"}</div>
      </div>
      <div class="chat-actions">
        <button class="action-menu-btn">⋮</button>
        <div class="action-dropdown">
          <button class="pin-option">Pin</button>
        </div>
      </div>
    `;

    allList.appendChild(chatItem);
    openChatOnClick(chatItem);  // ✅ attach open logic
    chatItem.click();           // ✅ auto-open the chat


    function openChatOnClick(item) {
      item.addEventListener("click", () => {
        // Remove existing "active" states
        document.querySelectorAll(".chat-item").forEach(i => i.classList.remove("active"));
        item.classList.add("active");

        const name = item.getAttribute("data-name") || "Unknown";
        const status = item.getAttribute("data-status") || "";
        const img = item.getAttribute("data-img") || "images/default.jpg";
        const type = item.getAttribute("data-type") || "single";

        const chatBox = document.getElementById("chat-box");
        const placeholder = document.getElementById("chat-placeholder");
        const infoPanel = document.querySelector(".info-panel");
        const container = document.querySelector(".container-new") || document.querySelector(".container");

        // Show chat
        placeholder.classList.add("hidden");
        chatBox.classList.remove("hidden");

        // Update chat UI
        document.querySelector(".chat-header img").src = img;
        document.querySelector(".chat-meta h3").textContent = name;
        document.querySelector(".chat-meta div").textContent = status;

        document.querySelector(".logo-circle img.company-logo").src = img;
        document.querySelector(".studio-name").textContent = name;
        document.querySelector(".tagline").textContent = status;

        chatBox.setAttribute("data-type", type);

        if (type === "single") {
          infoPanel.classList.add("hidden");
          if (container.classList.contains("container-new")) {
            container.classList.replace("container-new", "container");
          }
        }
      });
    }

    setupDropdownMenus();
    chatModal.classList.add("hidden");

    chatNameInput.value = "";
    chatImageInput.value = "";
    chatMembersInput.value = "";
  });


});

