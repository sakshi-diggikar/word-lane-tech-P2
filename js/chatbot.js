document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById('chatbot-toggle-btn');
    const panel = document.getElementById('chatbot-panel');
    const closeBtn = document.querySelector('#chatbot-panel #close-btn');
    const messages = document.getElementById('messages');
    const inputForm = document.getElementById('input-area');
    const userInput = document.getElementById('user-input');

    if (!toggleBtn || !panel || !closeBtn || !messages || !inputForm || !userInput) {
        return;
    }

    const LOCAL_STORAGE_KEY = 'selfLearningBotQAData';
    let qaData = [];
    let learningMode = false;
    let pendingQuestion = '';

    toggleBtn.onclick = () => panel.classList.toggle('active');
    closeBtn.onclick = () => panel.classList.remove('active');

    function loadQAData() {
        try {
            const saved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
            qaData = Array.isArray(saved) ? saved : [];
        } catch {
            qaData = [];
        }

        if (qaData.length === 0) {
            qaData = [
                { question: "How do I publish my book?", answer: "Submit your manuscript through our online portal." },
                { question: "What formats do you publish?", answer: "Print, eBook, and audiobook." },
                { question: "How much does publishing cost?", answer: "Packages start from ₹4999 depending on services." },
                { question: "Do you offer marketing services?", answer: "Yes, we offer press releases, PR, and online marketing." },
                { question: "How long does publishing take?", answer: "Typically 8–12 weeks after manuscript acceptance." },
                { question: "Can I sell internationally?", answer: "Yes, we distribute globally via Amazon, Ingram, and more." },
                { question: "Do you provide editing?", answer: "Yes, editing and proofreading are included or optional add-ons." },
                { question: "How to get ISBN?", answer: "We assign ISBNs for free with every published book." },
                { question: "Can I edit after publishing?", answer: "Minor changes are free, major ones may have a cost." },
                { question: "What royalties will I receive?", answer: "Usually 10–15% of net sales depending on the plan." },
            ];
        }
    }

    function saveQAData() {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(qaData));
    }

    function addMessage(text, type = 'bot') {
        const msg = document.createElement('div');
        msg.className = `message ${type}-message`;
        msg.textContent = text;
        messages.appendChild(msg);
        messages.scrollTop = messages.scrollHeight;
    }

    function showInitialOptions() {
        addMessage("Welcome! Choose a question or type your own:");
        const btnContainer = document.createElement('div');
        btnContainer.className = 'question-buttons';

        qaData.slice(0, 10).forEach(qa => {
            const btn = document.createElement('button');
            btn.textContent = qa.question;
            btn.onclick = () => {
                addMessage(qa.question, 'user');
                setTimeout(() => addMessage(qa.answer), 300);
            };
            btnContainer.appendChild(btn);
        });

        const customBtn = document.createElement('button');
        customBtn.textContent = "Other Doubt";
        customBtn.onclick = () => {
            addMessage("Other Doubt", 'user');
            setTimeout(() => addMessage("Please type your question below."), 300);
        };
        btnContainer.appendChild(customBtn);

        messages.appendChild(btnContainer);
        messages.scrollTop = messages.scrollHeight;
    }

    inputForm.addEventListener('submit', e => {
        e.preventDefault();
        const text = userInput.value.trim();
        if (!text) return;
        addMessage(text, 'user');
        userInput.value = '';

        if (learningMode) {
            qaData.push({ question: pendingQuestion, answer: text });
            saveQAData();
            addMessage("Thanks! I've saved this answer.");
            learningMode = false;
            pendingQuestion = '';
            return;
        }

        const match = qaData.find(q => q.question.toLowerCase() === text.toLowerCase());
        if (match) {
            setTimeout(() => addMessage(match.answer), 300);
        } else {
            setTimeout(() => {
                addMessage(`I don't know the answer to "${text}". Please teach me the correct answer.`);
                learningMode = true;
                pendingQuestion = text;
            }, 300);
        }
    });

    loadQAData();
    showInitialOptions();
}); 