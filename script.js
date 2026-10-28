// =============================================
// YOU ASPIRANT - INTERACTIVE WEBSITE
// Competition demonstration prototype
// =============================================

document.addEventListener("DOMContentLoaded", function () {

    // -----------------------------------------
    // 1. GENERAL ELEMENTS
    // -----------------------------------------

    const $ = (selector) => document.querySelector(selector);

    const $$ = (selector) => document.querySelectorAll(selector);

    $("#currentYear").textContent = new Date().getFullYear();


    // -----------------------------------------
    // 2. THREE-DOT NAVIGATION MENU
    // -----------------------------------------

    const dotsButton = $("#dotsButton");
    const dropdownMenu = $("#dropdownMenu");

    function closeMenu() {
        dropdownMenu.hidden = true;
        dotsButton.setAttribute("aria-expanded", "false");
    }

    dotsButton.addEventListener("click", function (event) {
        event.stopPropagation();

        dropdownMenu.hidden = !dropdownMenu.hidden;

        dotsButton.setAttribute(
            "aria-expanded",
            String(!dropdownMenu.hidden)
        );
    });

    dropdownMenu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", function (event) {
        if (
            !dropdownMenu.contains(event.target) &&
            !dotsButton.contains(event.target)
        ) {
            closeMenu();
        }
    });


    // -----------------------------------------
    // 3. MODAL MANAGEMENT
    // -----------------------------------------

    const authModal = $("#authModal");
    const profileModal = $("#profileModal");
    const programModal = $("#programModal");

    let activeModal = null;
    let previousFocus = null;

    function openModal(modal) {
        if (activeModal) {
            activeModal.hidden = true;
        }

        previousFocus = document.activeElement;
        activeModal = modal;
        modal.hidden = false;

        document.body.classList.add("modal-open");

        const firstInput = modal.querySelector(
            "input:not([type='hidden']), button"
        );

        if (firstInput) {
            firstInput.focus();
        }
    }

    function closeModal(modal) {
        modal.hidden = true;

        if (activeModal === modal) {
            activeModal = null;
        }

        if (!authModal.hidden ||
            !profileModal.hidden ||
            !programModal.hidden) {
            document.body.classList.add("modal-open");
        } else {
            document.body.classList.remove("modal-open");
        }

        if (previousFocus && previousFocus.isConnected) {
            previousFocus.focus();
        }
    }

    [authModal, profileModal, programModal].forEach(function (modal) {
        modal.addEventListener("click", function (event) {
            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {

            if (activeModal) {
                closeModal(activeModal);
            }

            closeChat();
            closeMenu();
        }
    });

    $("#closeAuthModal").addEventListener("click", function () {
        closeModal(authModal);
    });

    $("#closeProfileModal").addEventListener("click", function () {
        closeModal(profileModal);
    });

    $("#closeProgramModal").addEventListener("click", function () {
        closeModal(programModal);
    });


    // -----------------------------------------
    // 4. DEMO LOGIN AND SIGNUP
    // -----------------------------------------

    const authForm = $("#authForm");
    const authName = $("#authName");
    const authEmail = $("#authEmail");
    const authPassword = $("#authPassword");
    const nameField = $("#nameField");
    const authStatus = $("#authStatus");

    let authMode = "login";

    // The prototype stores only the demo profile.
    // It does not store or authenticate passwords.

    function getUser() {
        try {
            return JSON.parse(
                localStorage.getItem("yaDemoUser")
            );
        } catch (error) {
            return null;
        }
    }

    function saveUser(user) {
        localStorage.setItem(
            "yaDemoUser",
            JSON.stringify(user)
        );

        updateProfileDisplay();
    }

    function openLogin() {
        authForm.reset();
        authStatus.textContent = "";

        setAuthMode("login");

        openModal(authModal);
    }

    function setAuthMode(mode) {
        authMode = mode;

        $$(".auth-tab").forEach(function (tab) {
            const active = tab.dataset.authMode === mode;

            tab.classList.toggle("active", active);
            tab.setAttribute("aria-pressed", String(active));
        });

        nameField.hidden = mode !== "signup";
        authName.required = mode === "signup";

        $("#authTitle").textContent =
            mode === "signup"
                ? "Create Your Profile"
                : "Welcome to You Aspirant";

        authStatus.textContent = "";
    }

    $$(".auth-tab").forEach(function (tab) {
        tab.addEventListener("click", function () {
            setAuthMode(tab.dataset.authMode);
        });
    });

    // Login button opens login/signup popup.

    $("#heroLoginButton").addEventListener("click", openLogin);

    $("#contactLoginButton").addEventListener("click", openLogin);

    // Profile button:
    // Logged in -> profile
    // Not logged in -> login/signup

    $("#profileButton").addEventListener("click", function () {

        const user = getUser();

        if (user) {
            updateProfileDisplay();
            openModal(profileModal);
        } else {
            openLogin();
        }
    });

    $("#profileAuthButton").addEventListener("click", function () {
        closeModal(profileModal);
        openLogin();
    });

    authForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = authEmail.value.trim().toLowerCase();
        const password = authPassword.value;

        if (!email || !password) {
            authStatus.textContent =
                "Please enter your email and demo password.";
            return;
        }

        let user;

        if (authMode === "signup") {

            const name = authName.value.trim();

            if (!name) {
                authStatus.textContent =
                    "Please enter your full name.";
                return;
            }

            user = {
                name: name,
                email: email,
                interest: "Career Development",
                joined: new Date().toLocaleDateString()
            };

        } else {

            const existingUser = getUser();

            if (
                existingUser &&
                existingUser.email === email
            ) {
                user = existingUser;

            } else {

                // Demonstration login only.
                // No server or real account verification exists.

                const suggestedName = email
                    .split("@")[0]
                    .replace(/[._-]+/g, " ")
                    .replace(/\b\w/g, function (letter) {
                        return letter.toUpperCase();
                    });

                user = {
                    name: suggestedName || "Guest Student",
                    email: email,
                    interest: "Career Development",
                    joined: new Date().toLocaleDateString()
                };
            }
        }

        saveUser(user);

        authForm.reset();
        authStatus.textContent = "";

        closeModal(authModal);

        updateProfileDisplay();

        openModal(profileModal);
    });


    // -----------------------------------------
    // 5. STUDENT PROFILE
    // -----------------------------------------

    function updateProfileDisplay() {

        const user = getUser();

        const avatar = $("#profileAvatar");
        const largeAvatar = $("#profileLargeAvatar");

        if (!user) {

            avatar.textContent = "👤";
            largeAvatar.textContent = "👤";

            $("#profileName").textContent = "Guest Student";
            $("#profileEmail").textContent = "Not signed in";
            $("#profileInterest").textContent = "Career Development";

            $("#logoutButton").hidden = true;
            $("#profileAuthButton").hidden = false;

            $("#feedbackUser").textContent =
                "Sign in to display your profile name with your feedback.";

            return;
        }

        const initials = user.name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(function (part) {
                return part.charAt(0).toUpperCase();
            })
            .join("");

        avatar.textContent = initials || "YA";
        largeAvatar.textContent = initials || "YA";

        $("#profileName").textContent = user.name;
        $("#profileEmail").textContent = user.email;

        $("#profileInterest").textContent =
            user.interest || "Career Development";

        $("#logoutButton").hidden = false;
        $("#profileAuthButton").hidden = true;

        $("#feedbackUser").textContent =
            "Signed in as " + user.name +
            ". Your name will appear with your feedback.";
    }

    $("#editInterestButton").addEventListener("click", function () {

        const user = getUser();

        if (!user) {
            closeModal(profileModal);
            openLogin();
            return;
        }

        const options = [
            "Career Guidance",
            "Skill Development",
            "Internships",
            "Interview Preparation",
            "Project Development",
            "Communication Skills"
        ];

        const selected = prompt(
            "Enter your learning interest:\n\n" +
            options.join("\n")
        );

        if (selected && selected.trim()) {
            user.interest = selected.trim();

            saveUser(user);
        }
    });

    $("#logoutButton").addEventListener("click", function () {

        const confirmed = confirm(
            "Do you want to log out of your demo profile?"
        );

        if (!confirmed) {
            return;
        }

        localStorage.removeItem("yaDemoUser");

        updateProfileDisplay();

        closeModal(profileModal);
    });

    updateProfileDisplay();


    // -----------------------------------------
    // 6. ANIMATED STATISTICS
    // -----------------------------------------

    const counters = $$(".counter");

    function animateCounter(counter) {

        if (counter.dataset.finished === "true") {
            return;
        }

        counter.dataset.finished = "true";

        const target = Number(counter.dataset.target);

        const duration = 1800;
        const startTime = performance.now();

        function updateNumber(currentTime) {

            const elapsed = currentTime - startTime;

            const progress = Math.min(
                elapsed / duration,
                1
            );

            // Smooth ease-out animation.

            const easedProgress = 1 - Math.pow(
                1 - progress,
                3
            );

            const value = Math.floor(
                easedProgress * target
            );

            counter.textContent = value.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                counter.textContent = target.toLocaleString();
            }
        }

        requestAnimationFrame(updateNumber);
    }

    if ("IntersectionObserver" in window) {

        const counterObserver = new IntersectionObserver(
            function (entries, observer) {

                entries.forEach(function (entry) {

                    if (entry.isIntersecting) {

                        animateCounter(entry.target);

                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.3
            }
        );

        counters.forEach(function (counter) {
            counterObserver.observe(counter);
        });

    } else {

        counters.forEach(animateCounter);
    }


    // -----------------------------------------
    // 7. CONTINUOUS MOVING STORY CARDS
    // -----------------------------------------

    // Duplicate the cards to create a seamless loop.

    function duplicateCards(trackId) {

        const track = $("#" + trackId);

        if (!track || track.dataset.duplicated === "true") {
            return;
        }

        const originalCards = Array.from(track.children);

        originalCards.forEach(function (card) {

            const copy = card.cloneNode(true);

            copy.setAttribute("aria-hidden", "true");

            track.appendChild(copy);
        });

        track.dataset.duplicated = "true";
    }

    duplicateCards("companyTrack");
    duplicateCards("studentTrack");


    // -----------------------------------------
    // 8. PROGRAM DETAILS POPUPS
    // -----------------------------------------

    const programDetails = {

        "Career Guidance": {
            description:
                "Explore career pathways, understand your interests " +
                "and organise your professional goals.",
            steps: [
                "Identify your interests and strengths.",
                "Explore suitable career pathways.",
                "Research the skills each role requires.",
                "Create a practical career roadmap."
            ]
        },

        "Skill Development": {
            description:
                "Build technical and professional skills through " +
                "structured learning and regular practice.",
            steps: [
                "Choose a skill to develop.",
                "Learn the essential concepts.",
                "Practise using small exercises.",
                "Apply the skill in a project."
            ]
        },

        "Interview Preparation": {
            description:
                "Practise explaining your knowledge, projects " +
                "and experience in a professional interview.",
            steps: [
                "Research the role and organisation.",
                "Review technical fundamentals.",
                "Practise common interview questions.",
                "Reflect on your answers and improve."
            ]
        },

        "Resume Preparation": {
            description:
                "Organise your education, skills, projects " +
                "and experience into a clear resume.",
            steps: [
                "Collect your education and project details.",
                "Choose a readable resume structure.",
                "Highlight relevant skills and achievements.",
                "Proofread and customise your resume."
            ]
        },

        "Project Development": {
            description:
                "Learn to turn a problem into a practical " +
                "project and present your solution clearly.",
            steps: [
                "Identify a real problem.",
                "Define requirements and plan a solution.",
                "Develop and test your project.",
                "Document and demonstrate the result."
            ]
        },

        "Career Preparation": {
            description:
                "Prepare your professional profile and develop " +
                "a structured approach to career opportunities.",
            steps: [
                "Define your career goals.",
                "Prepare your resume and portfolio.",
                "Research relevant opportunities.",
                "Track applications and follow-ups."
            ]
        },

        "Internship Support": {
            description:
                "Understand internship applications, workplace " +
                "expectations and preparation strategies.",
            steps: [
                "Explore relevant internship roles.",
                "Prepare your resume and project portfolio.",
                "Review the application requirements.",
                "Practise introducing your skills and interests."
            ]
        },

        "Communication Skills": {
            description:
                "Improve your ability to explain ideas " +
                "clearly in academic and professional settings.",
            steps: [
                "Practise speaking clearly.",
                "Organise your ideas before presenting.",
                "Take part in group discussions.",
                "Request feedback and continue practising."
            ]
        }
    };

    let selectedProgram = "";

    $$(".program-action").forEach(function (button) {

        button.addEventListener("click", function () {

            selectedProgram = button.dataset.program;

            const details = programDetails[selectedProgram];

            if (!details) {
                return;
            }

            $("#programModalTitle").textContent = selectedProgram;

            $("#programModalDescription").textContent =
                details.description;

            const stepsList = $("#programModalSteps");

            stepsList.replaceChildren();

            details.steps.forEach(function (step) {

                const listItem = document.createElement("li");

                listItem.textContent = step;

                stepsList.appendChild(listItem);
            });

            openModal(programModal);
        });
    });

    $("#programEnquiryButton").addEventListener("click", function () {

        const user = getUser();

        if (!user) {

            closeModal(programModal);

            openLogin();

            authStatus.textContent =
                "Create a demo profile to continue with your interest.";

            return;
        }

        const interest = selectedProgram;

        user.interest = interest;

        saveUser(user);

        closeModal(programModal);

        $("#feedbackUser").textContent =
            "Signed in as " + user.name +
            ". Current interest: " + interest + ".";

        alert(
            "Thank you, " + user.name + "!\n\n" +
            "Your selected interest is: " + interest + ".\n\n" +
            "This is a competition demonstration. " +
            "No enquiry has been sent to the company."
        );
    });


    // -----------------------------------------
    // 9. FAQ ACCORDION
    // -----------------------------------------

    $$(".faq-question").forEach(function (button) {

        button.addEventListener("click", function () {

            const answer = button.nextElementSibling;

            const symbol = button.querySelector(".faq-symbol");

            const isOpen =
                button.getAttribute("aria-expanded") === "true";

            button.setAttribute(
                "aria-expanded",
                String(!isOpen)
            );

            answer.hidden = isOpen;

            if (symbol) {
                symbol.textContent = isOpen ? "+" : "−";
            }
        });
    });


    // -----------------------------------------
    // 10. STAR RATING SELECTION
    // -----------------------------------------

    const starButtons = $$("#starPicker button");
    const ratingValue = $("#ratingValue");

    function selectRating(rating) {

        ratingValue.value = rating;

        starButtons.forEach(function (button) {

            const buttonRating = Number(button.dataset.rating);

            const selected = buttonRating <= rating;

            button.textContent = selected ? "★" : "☆";

            button.classList.toggle("selected", selected);

            button.setAttribute(
                "aria-pressed",
                String(buttonRating === rating)
            );
        });
    }

    starButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            selectRating(Number(button.dataset.rating));
        });
    });


    // -----------------------------------------
    // 11. STUDENT FEEDBACK
    // -----------------------------------------

    const feedbackForm = $("#feedbackForm");

    const feedbackStatus = $("#feedbackStatus");

    const feedbackList = $("#feedbackList");

    function loadFeedback() {

        try {
            return JSON.parse(
                localStorage.getItem("yaDemoFeedback") || "[]"
            );
        } catch (error) {
            return [];
        }
    }

    function saveFeedback(items) {

        localStorage.setItem(
            "yaDemoFeedback",
            JSON.stringify(items)
        );
    }

    function makeReviewCard(review) {

        const article = document.createElement("article");

        article.className = "feedback-card";

        const top = document.createElement("div");

        top.className = "feedback-card-top";

        const avatar = document.createElement("span");

        avatar.className = "review-avatar";

        avatar.textContent = review.name
            .split(/\s+/)
            .slice(0, 2)
            .map(function (part) {
                return part.charAt(0).toUpperCase();
            })
            .join("");

        const identity = document.createElement("div");

        const name = document.createElement("h4");

        name.textContent = review.name;

        const label = document.createElement("span");

        label.className = "review-label";

        label.textContent = "Demo Feedback";

        identity.append(name, label);

        const stars = document.createElement("span");

        stars.className = "review-stars";

        stars.textContent =
            "★".repeat(review.rating) +
            "☆".repeat(5 - review.rating);

        top.append(avatar, identity, stars);

        const message = document.createElement("p");

        message.textContent = '"' + review.message + '"';

        article.append(top, message);

        return article;
    }

    function renderFeedback() {

        const savedFeedback = loadFeedback();

        // Keep the three example reviews already in the HTML.
        // Add saved demonstration reviews below them.

        feedbackList.querySelectorAll(
            "[data-user-feedback='true']"
        ).forEach(function (card) {
            card.remove();
        });

        savedFeedback.slice().reverse().forEach(function (review) {

            const card = makeReviewCard(review);

            card.dataset.userFeedback = "true";

            feedbackList.appendChild(card);
        });
    }

    feedbackForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const user = getUser();

        const nameInput = $("#displayName");

        const messageInput = $("#feedbackMessage");

        const name = nameInput.value.trim();

        const message = messageInput.value.trim();

        const rating = Number(ratingValue.value);

        if (!name || !message) {

            feedbackStatus.textContent =
                "Please enter your display name and feedback.";

            return;
        }

        if (rating < 1 || rating > 5) {

            feedbackStatus.textContent =
                "Please select a star rating before submitting.";

            return;
        }

        const review = {
            name: name,
            message: message,
            rating: rating,
            date: new Date().toISOString()
        };

        const items = loadFeedback();

        items.push(review);

        try {

            saveFeedback(items);

        } catch (error) {

            feedbackStatus.textContent =
                "Browser storage is unavailable. Please check your browser settings.";

            return;
        }

        renderFeedback();

        feedbackStatus.textContent =
            "Thank you, " + name +
            "! Your demo feedback has been added.";

        feedbackForm.reset();

        selectRating(0);

        // Keep the signed-in user's display name available.

        if (user) {
            nameInput.value = user.name;
        }

        feedbackList.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    });

    // Use the signed-in user's name automatically.

    const originalFeedbackUserText =
        $("#feedbackUser").textContent;

    $("#displayName").addEventListener("focus", function () {

        const user = getUser();

        if (user && !this.value) {
            this.value = user.name;
        }
    });

    $("#profileButton").addEventListener("click", function () {

        const user = getUser();

        if (user) {
            $("#displayName").value = user.name;
        }
    });

    // Start with all five stars outlined.

    selectRating(0);

    renderFeedback();


    // -----------------------------------------
    // 12. CHATBOT
    // -----------------------------------------

    const chatLauncher = $("#chatLauncher");

    const chatWindow = $("#chatWindow");

    const chatForm = $("#chatForm");

    const chatInput = $("#chatInput");

    const chatMessages = $("#chatMessages");

    function openChat() {

        chatWindow.hidden = false;

        chatLauncher.setAttribute("aria-expanded", "true");

        chatInput.focus();
    }

    function closeChat() {

        chatWindow.hidden = true;

        chatLauncher.setAttribute("aria-expanded", "false");
    }

    chatLauncher.addEventListener("click", function () {

        if (chatWindow.hidden) {
            openChat();
        } else {
            closeChat();
        }
    });

    $("#closeChat").addEventListener("click", closeChat);

    function addChatMessage(message, type) {

        const element = document.createElement("div");

        element.className = "chat-message " + type;

        // textContent prevents user input from being treated as HTML.

        element.textContent = message;

        chatMessages.appendChild(element);

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function getChatResponse(message) {

        const text = message.toLowerCase();

        if (
            text.includes("hello") ||
            text.includes("hi") ||
            text.includes("hey")
        ) {
            return "Hello! 👋 Welcome to You Aspirant. " +
                "I can help you explore programs, internships, " +
                "resumes and interview preparation.";
        }

        if (
            text.includes("program") ||
            text.includes("course") ||
            text.includes("training")
        ) {
            return "You can explore eight learning areas:\n\n" +
                "1. Career Guidance\n" +
                "2. Skill Development\n" +
                "3. Interview Preparation\n" +
                "4. Resume Preparation\n" +
                "5. Project Development\n" +
                "6. Career Preparation\n" +
                "7. Internship Support\n" +
                "8. Communication Skills\n\n" +
                "Visit the Programs section and select " +
                "'Explore details' to learn more.";
        }

        if (
            text.includes("internship") ||
            text.includes("intern")
        ) {
            return "For internship preparation, start by:\n\n" +
                "1. Exploring relevant roles.\n" +
                "2. Preparing your resume.\n" +
                "3. Collecting your project details.\n" +
                "4. Reviewing the application requirements.\n\n" +
                "Visit our Internship Support program for the steps.";
        }

        if (
            text.includes("resume") ||
            text.includes("cv")
        ) {
            return "A good student resume can include:\n\n" +
                "• Contact information\n" +
                "• Education\n" +
                "• Technical skills\n" +
                "• Academic projects\n" +
                "• Internships or experience\n" +
                "• Relevant achievements\n\n" +
                "Keep it clear, accurate and easy to read.";
        }

        if (
            text.includes("interview") ||
            text.includes("hr round")
        ) {
            return "To prepare for an interview:\n\n" +
                "1. Research the role.\n" +
                "2. Revise relevant technical concepts.\n" +
                "3. Practise introducing yourself.\n" +
                "4. Explain your projects clearly.\n" +
                "5. Practise common HR questions.\n\n" +
                "Try our Interview Preparation program.";
        }

        if (
            text.includes("career guidance") ||
            text.includes("career path") ||
            text.includes("career option") ||
            text.includes("which career")
        ) {
            return "Start by identifying your interests, " +
                "strengths and preferred work areas. " +
                "Research different roles, the skills they require " +
                "and the projects that could help you explore them.\n\n" +
                "Our Career Guidance section gives you a starting roadmap.";
        }

        if (
            text.includes("project") ||
            text.includes("prototype")
        ) {
            return "A useful project workflow is:\n\n" +
                "1. Identify a real problem.\n" +
                "2. Define your requirements.\n" +
                "3. Choose suitable tools.\n" +
                "4. Develop and test your solution.\n" +
                "5. Document the result.\n\n" +
                "Visit Project Development for more details.";
        }

        if (
            text.includes("communication") ||
            text.includes("speaking")
        ) {
            return "You can improve communication by practising " +
                "short presentations, explaining technical ideas " +
                "in simple words, participating in group discussions " +
                "and asking for constructive feedback.";
        }

        if (
            text.includes("login") ||
            text.includes("profile") ||
            text.includes("sign up") ||
            text.includes("signup") ||
            text.includes("account")
        ) {
            return "Click the profile icon at the top-right corner. " +
                "You can create a demonstration profile or open your " +
                "existing demo profile. This prototype does not use " +
                "real account authentication.";
        }

        if (
            text.includes("feedback") ||
            text.includes("rating") ||
            text.includes("review") ||
            text.includes("star")
        ) {
            return "Visit 'Your Voice Matters' on the website. " +
                "Enter a display name, select between one and five stars, " +
                "write your feedback and press Submit Feedback. " +
                "Your demo review is stored in this browser.";
        }

        if (
            text.includes("placement") ||
            text.includes("job")
        ) {
            return "You can prepare for job opportunities by " +
                "developing relevant skills, building projects, " +
                "preparing your resume and practising interviews. " +
                "This prototype does not guarantee a job or placement.";
        }

        if (
            text.includes("experience") ||
            text.includes("statistics") ||
            text.includes("250") ||
            text.includes("300")
        ) {
            return "The animated figures on this website are " +
                "illustrative competition-demo numbers. They are " +
                "not verified statistics about You Aspirant.";
        }

        if (
            text.includes("contact") ||
            text.includes("email") ||
            text.includes("phone")
        ) {
            return "The Contact section shows the next-step call " +
                "to action. Official company contact details can be " +
                "added once they are available.";
        }

        if (
            text.includes("thank")
        ) {
            return "You're welcome! Keep exploring, learning " +
                "and taking one step at a time. 🌱";
        }

        return "I can help with:\n\n" +
            "• Career guidance\n" +
            "• Programs and training\n" +
            "• Internship preparation\n" +
            "• Resume preparation\n" +
            "• Interview preparation\n" +
            "• Project development\n" +
            "• Communication skills\n" +
            "• Profile and feedback features\n\n" +
            "Try asking me about one of these topics.";
    }

    function sendChatMessage(message) {

        const cleanMessage = message.trim();

        if (!cleanMessage) {
            return;
        }

        addChatMessage(cleanMessage, "user-message");

        chatInput.value = "";

        // This is a local rule-based demo chatbot.
        // It does not use an external AI service.

        window.setTimeout(function () {

            const response = getChatResponse(cleanMessage);

            addChatMessage(response, "bot-message");

        }, 350);
    }

    chatForm.addEventListener("submit", function (event) {

        event.preventDefault();

        sendChatMessage(chatInput.value);
    });

    $$(".chat-suggestions button").forEach(function (button) {

        button.addEventListener("click", function () {

            openChat();

            sendChatMessage(button.dataset.chatQuestion);
        });
    });


    // -----------------------------------------
    // 13. INITIAL WEBSITE STATE
    // -----------------------------------------

    closeMenu();

    updateProfileDisplay();

    console.log(
        "You Aspirant website loaded successfully."
    );

});