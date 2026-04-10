// ==========================================
// Digital Suggestion Box Logic
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    // DOM Elements
    const form = document.getElementById('suggestion-form');
    const nameInput = document.getElementById('name');
    const categoryInput = document.getElementById('category');
    const suggestionInput = document.getElementById('suggestion');
    const submitBtn = document.getElementById('submit-btn');
    const suggestionsContainer = document.getElementById('suggestions-container');
    const totalCountSpan = document.getElementById('total-count');
    const toast = document.getElementById('toast');
    const feedSortSelect = document.getElementById('feed-sort-select');
    
    // Quick Tags & Character Counter
    const quickTagBtns = document.querySelectorAll('.quick-tag-btn');
    const charCounter = document.getElementById('char-counter');
    const maxChars = 500;

    if (suggestionInput && charCounter) {
        suggestionInput.addEventListener('input', () => {
            const currentLen = suggestionInput.value.length;
            charCounter.textContent = `${currentLen} / ${maxChars}`;
            
            // Visual feedback as it gets full
            if (currentLen >= maxChars) {
                charCounter.className = 'char-counter danger';
            } else if (currentLen >= maxChars * 0.8) {
                charCounter.className = 'char-counter warning';
            } else {
                charCounter.className = 'char-counter';
            }
        });
    }

    if (quickTagBtns && suggestionInput) {
        quickTagBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tag = btn.textContent;
                // Add space if input is not empty and doesn't end with space
                const prefix = (suggestionInput.value && !suggestionInput.value.endsWith(' ')) ? ' ' : '';
                suggestionInput.value += prefix + tag + ' ';
                // Trigger input event to update counter
                suggestionInput.dispatchEvent(new Event('input'));
                suggestionInput.focus();
            });
        });
    }

    if (feedSortSelect) {
        feedSortSelect.addEventListener('change', () => renderSuggestions());
    }

    // Image Upload Elements
    const fileInput = document.getElementById('image-upload');
    const fileUploadWrapper = document.querySelector('.file-upload-wrapper');
    const fileUploadUI = document.getElementById('file-upload-ui');
    const imagePreview = document.getElementById('image-preview');
    const removeImageBtn = document.getElementById('remove-image');
    const aiStatus = document.getElementById('ai-status');
    const categoryChips = document.getElementById('category-chips');

    // Handle Category Chip Selection (REMOVED - now on Stage 2)

    // State Variables
    let isImageSafe = true; // Assume true if no image
    let currentCategory = 'General';

    // Subcategories Data Map
    const subcategoriesData = {
        "Subject Improvement": [
            "Simplify difficult topics explanation",
            "More practical examples in classes",
            "Provide extra study materials",
            "Conduct doubt-clearing sessions",
            "Improve teaching methods"
        ],
        "New Tech Course": [
            "Artificial Intelligence course",
            "Data Science course",
            "Cloud Computing course",
            "Cybersecurity course",
            "Blockchain technology course"
        ],
        "Syllabus Update": [
            "Include latest industry technologies",
            "Remove outdated topics",
            "Add practical-based modules",
            "Industry oriented subjects",
            "Project based learning"
        ],
        "Exam Pattern Feedback": [
            "Improve question paper pattern",
            "Provide sample papers",
            "Transparent evaluation system",
            "Reduce exam stress through continuous assessment",
            "Online exam practice tests"
        ],
        "Lab Equipment Upgrade": [
            "Add modern laboratory equipment",
            "Increase number of lab systems",
            "Upgrade computer hardware",
            "Maintain lab equipment regularly",
            "Improve lab safety"
        ],
        "Software Tools": [
            "Install programming software (Python, Java)",
            "Provide licensed software tools",
            "Install data science tools",
            "Provide simulation software",
            "Access to online coding platforms"
        ],
        "Hands-on Projects": [
            "Mini projects every semester",
            "Real-world industry projects",
            "Team based projects",
            "IoT or robotics projects",
            "Research oriented projects"
        ],
        "Workshop Improvement": [
            "Coding workshops",
            "AI and ML workshops",
            "Cybersecurity workshops",
            "Web development workshops",
            "Industry expert sessions"
        ],
        "Coding Bootcamps": [
            "Programming bootcamp",
            "Data science bootcamp",
            "Cloud computing bootcamp",
            "Cybersecurity bootcamp",
            "Full stack development bootcamp"
        ],
        "Hackathon Requests": [
            "24-hour coding competitions",
            "Problem solving hackathons",
            "AI innovation hackathons",
            "Startup idea hackathons",
            "National level hackathons"
        ],
        "Technical Club": [
            "Coding club",
            "Robotics club",
            "AI / ML club",
            "Cybersecurity club",
            "Electronics club"
        ],
        "Industry Certification": [
            "AWS certification",
            "Google certification",
            "Microsoft certification",
            "Data science certification",
            "Cybersecurity certification"
        ],
        "Placement Training": [
            "Aptitude training",
            "Coding practice sessions",
            "Communication skills training",
            "Resume building workshops",
            "Group discussion training"
        ],
        "Internship Opportunities": [
            "Industry internships",
            "Paid internships",
            "Research internships",
            "Startup internships",
            "Virtual internships"
        ],
        "Resume & Interview": [
            "HR interview practice",
            "Technical interview practice",
            "Panel interviews",
            "Online interview simulations",
            "Feedback sessions"
        ],
        "Alumni Networking": [
            "Alumni guest lectures",
            "Career guidance sessions",
            "Networking events",
            "Alumni mentorship programs",
            "Alumni success talks"
        ],
        "Wi-Fi Improvement": [
            "High speed campus Wi-Fi",
            "Wi-Fi coverage in hostels",
            "Stable internet connection",
            "Secure network access",
            "24/7 internet availability"
        ],
        "Library Resources": [
            "More technical books",
            "Digital library access",
            "Extended library hours",
            "Study rooms for students",
            "Access to online journals"
        ],
        "Hostel Facilities": [
            "Clean hostel rooms",
            "Better food quality",
            "Internet in hostel rooms",
            "Security in hostels",
            "Recreation facilities"
        ],
        "Transportation": [
            "Increase bus routes",
            "Better bus timing schedules",
            "Safe transportation services",
            "GPS tracking for buses",
            "Affordable transport fees"
        ],
        "Teaching Method": [
            "Interactive teaching methods",
            "Smart classroom technology",
            "Use of digital presentations",
            "Case study based learning",
            "Practical demonstrations"
        ],
        "Faculty Availability": [
            "Faculty doubt clearing hours",
            "Online consultation sessions",
            "Academic mentoring",
            "Faculty support groups",
            "Regular interaction sessions"
        ],
        "Admin Processes": [
            "Online certificate requests",
            "Faster administrative services",
            "Digital fee payment system",
            "Simplified documentation process",
            "Online grievance system"
        ],
        "Transparency": [
            "Transparent evaluation system",
            "Clear academic policies",
            "Open communication with students",
            "Display of results and marks clearly",
            "Transparent placement process"
        ],
        "Mental Health Support": [
            "Counseling services",
            "Stress management workshops",
            "Psychological support programs",
            "Student mentoring programs",
            "Awareness programs"
        ],
        "Sports & Cultural": [
            "Sports competitions",
            "Cultural festivals",
            "Dance and music clubs",
            "Talent shows",
            "Fitness and yoga programs"
        ],
        "Anti-Ragging": [
            "Anti-ragging awareness programs",
            "24/7 campus security",
            "Complaint reporting system",
            "CCTV surveillance",
            "Safety helpline"
        ],
        "Stress Management": [
            "Meditation sessions",
            "Yoga programs",
            "Time management workshops",
            "Relaxation activities",
            "Student wellness programs"
        ],
        "Innovation & Research": [
            "Student research projects",
            "Faculty research collaboration",
            "Innovation competitions",
            "Research funding support",
            "Publication opportunities"
        ],
        "Startup Support": [
            "Startup mentorship programs",
            "Entrepreneurship workshops",
            "Business idea competitions",
            "Startup incubation center",
            "Funding support for startups"
        ],
        "Sustainability": [
            "Tree plantation programs",
            "Plastic free campus",
            "Solar energy usage",
            "Waste management systems",
            "Water conservation programs"
        ],
        "Digital Transformation": [
            "Digital attendance system",
            "Online learning platforms",
            "Smart classrooms",
            "Campus mobile app",
            "Paperless administration"
        ]
    };

    let currentSubcategory = '';

    // ==========================================
    // Global Loader Logic
    // ==========================================
    function transitionWithLoader(hideCallback, showCallback, durationMs = 3000) {
        const loader = document.getElementById('global-loader');
        if (!loader) {
            if (hideCallback) hideCallback();
            if (showCallback) showCallback();
            return;
        }

        // Show the loader by adding active AND removing hidden
        loader.classList.remove('hidden');
        loader.classList.add('active');

        setTimeout(() => {
            if (hideCallback) hideCallback();
            if (showCallback) showCallback();

            setTimeout(() => {
                // Hide the loader
                loader.classList.remove('active');
                loader.classList.add('hidden');
            }, durationMs);
        }, 600); // Slightly longer delay to ensure user sees the "Loading" state
    }

    // ==========================================
    // Top Navigation Bar Logic
    // ==========================================
    function setupTopNav() {
        const navLinks = document.querySelectorAll('.nav-links a');
        const brandLogo = document.querySelector('.nav-brand');

        // Simple reset for "Home" or Logo
        const goHome = (e) => {
            if (e) e.preventDefault();
            transitionWithLoader(() => { }, () => {
                window.location.reload();
            }, 1000);
        };

        if (brandLogo) brandLogo.addEventListener('click', goHome);

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetText = link.textContent.trim();

                // If clicking an already active link, do nothing (except Home)
                if (link.classList.contains('active') && targetText !== 'Home') return;

                transitionWithLoader(() => {
                    // Hide all major pages
                    document.getElementById('intro-page').classList.add('hidden');
                    document.getElementById('category-page').classList.add('hidden');
                    document.getElementById('subcategory-page').classList.add('hidden');
                    document.getElementById('about-page').classList.add('hidden');
                    document.getElementById('team-page').classList.add('hidden');
                    document.getElementById('contact-page').classList.add('hidden');
                    document.getElementById('working-page').style.display = 'none';

                    // Remove active class from all
                    navLinks.forEach(l => l.classList.remove('active'));
                    // Add active to clicked
                    link.classList.add('active');
                }, () => {
                    if (targetText === 'Home') {
                        window.location.reload();
                    } else if (targetText === 'About') {
                        document.getElementById('about-page').classList.remove('hidden');
                        document.getElementById('about-page').style.display = 'flex';
                    } else if (targetText === 'Team') {
                        document.getElementById('team-page').classList.remove('hidden');
                        document.getElementById('team-page').style.display = 'flex';
                    } else if (targetText === 'Contact') {
                        document.getElementById('contact-page').classList.remove('hidden');
                        document.getElementById('contact-page').style.display = 'flex';
                    } else {
                        alert(`The ${targetText} section is currently under construction!`);
                        // Revert active state or go home
                        goHome();
                    }
                }, 2000);
            });
        });

        // Close About & Team page functionality
        const closeAboutBtn = document.getElementById('close-about-btn');
        if (closeAboutBtn) closeAboutBtn.addEventListener('click', goHome);

        const closeTeamBtn = document.getElementById('close-team-btn');
        if (closeTeamBtn) closeTeamBtn.addEventListener('click', goHome);

        const closeContactBtn = document.getElementById('close-contact-btn');
        if (closeContactBtn) closeContactBtn.addEventListener('click', goHome);
    }

    // ==========================================
    // 1. Navigation Setup & Flow
    // ==========================================
    function setupAuthAndNavigation() {
        const introPage = document.getElementById('intro-page');
        const categoryPage = document.getElementById('category-page');
        const subcategoryPage = document.getElementById('subcategory-page');
        const workingPage = document.getElementById('working-page');
        
        const enterBtn = document.getElementById('enter-app-btn');

        const subcategoryContainer = document.getElementById('subcategory-container');
        const selectedMainCategoryTitle = document.getElementById('selected-main-category-title');

        if (!introPage || !categoryPage) return;

        // Stage 1 -> Stage 2: Enter System
        if (enterBtn) {
            enterBtn.onclick = () => {
                console.log("Stage 1 -> Stage 2");
                transitionWithLoader(
                    () => {
                        introPage.classList.add('hidden');
                        introPage.style.display = 'none';
                    },
                    () => {
                        categoryPage.style.display = 'flex';
                        setTimeout(() => categoryPage.classList.remove('hidden'), 50);
                    },
                    3000
                );
            };
        }

        // Stage 2 -> Stage 3: Category Select -> Subcategory Select
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('#category-page .intro-cat-btn');
            if (!btn) return;

            const selectedCat = btn.getAttribute('data-value');
            if (selectedCat) {
                console.log("Stage 2 -> Stage 3 with category:", selectedCat);
                currentCategory = selectedCat;
                selectedMainCategoryTitle.textContent = `Topics for ${selectedCat}`;

                // Populate Subcategories
                subcategoryContainer.innerHTML = '';
                const subcats = subcategoriesData[selectedCat] || ["General Feedback"];

                const gridDiv = document.createElement('div');
                gridDiv.className = 'intro-category-grid';

                subcats.forEach(subcat => {
                    const subBtn = document.createElement('button');
                    subBtn.className = 'intro-cat-btn small subcat-btn';
                    subBtn.setAttribute('data-value', subcat);
                    subBtn.innerHTML = `<span>${subcat}</span>`;
                    gridDiv.appendChild(subBtn);
                });

                subcategoryContainer.appendChild(gridDiv);

                // Initialize tilt on new dynamically created buttons
                if (window.VanillaTilt) {
                    VanillaTilt.init(document.querySelectorAll(".subcat-btn"), {
                        max: 15,
                        speed: 400,
                        glare: true,
                        "max-glare": 0.2,
                        scale: 1.05
                    });
                }

                transitionWithLoader(
                    () => {
                        categoryPage.classList.add('hidden');
                        categoryPage.style.display = 'none';
                    },
                    () => {
                        subcategoryPage.style.display = 'flex';
                        setTimeout(() => subcategoryPage.classList.remove('hidden'), 50);
                    },
                    3500
                );
            }
        });

        // Stage 3 -> Stage 4: Subcategory Select -> Working Page
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('#subcategory-page .intro-cat-btn');
            if (!btn) return;

            const selectedSubcat = btn.getAttribute('data-value');
            if (selectedSubcat) {
                console.log("Stage 3 -> Stage 4 with subcategory:", selectedSubcat);
                currentSubcategory = selectedSubcat;

                const catFormInput = document.getElementById('category');
                // Combine them or just use subcategory for the tag. Using Main - Sub format.
                if (catFormInput) catFormInput.value = `${currentCategory} - ${currentSubcategory}`;

                renderSuggestions();
                transitionWithLoader(
                    () => {
                        subcategoryPage.classList.add('hidden');
                        subcategoryPage.style.display = 'none';
                    },
                    () => {
                        workingPage.style.display = 'block';
                        window.dispatchEvent(new Event('resize'));
                    },
                    4000
                );
            }
        });

        // Stage 4 -> Stage 3: Back Button
        const backBtn = document.getElementById('back-to-categories');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                console.log("Stage 4 -> Stage 3");
                transitionWithLoader(
                    () => {
                        workingPage.style.display = 'none';
                        workingPage.classList.add('initial-hidden');
                    },
                    () => {
                        subcategoryPage.style.display = 'flex';
                        setTimeout(() => subcategoryPage.classList.remove('hidden'), 50);
                    },
                    1500
                );
            });
        }

        // Stage 3 -> Stage 2: Back Button
        const backToStage2Btn = document.getElementById('back-to-stage2');
        if (backToStage2Btn) {
            backToStage2Btn.onclick = () => {
                console.log("Stage 3 -> Stage 2");
                transitionWithLoader(
                    () => {
                        subcategoryPage.classList.add('hidden');
                        subcategoryPage.style.display = 'none';
                    },
                    () => {
                        categoryPage.style.display = 'flex';
                        setTimeout(() => categoryPage.classList.remove('hidden'), 50);
                    },
                    1500
                );
            };
        }
    }

    // Initialize App
    function init() {
        setupTopNav();      // Run first
        setupAuthAndNavigation(); // Replace setupIntroScreen with auth flow
        loadSuggestions();
        renderSuggestions();
        setupImageUpload(); // Setup UI immediately
        loadAIModel();      // Load AI in background without blocking
        initAntigravity();  // Start the advanced particle background

        // Initialize 3D Tilt on static panels
        if (window.VanillaTilt) {
            VanillaTilt.init(document.querySelectorAll(".glass-panel"), {
                max: 5,
                speed: 400,
                glare: true,
                "max-glare": 0.2,
            });
            VanillaTilt.init(document.querySelectorAll(".intro-cat-btn:not(.subcat-btn)"), {
                max: 15,
                speed: 400,
                glare: true,
                "max-glare": 0.2,
                scale: 1.05
            });
            VanillaTilt.init(document.querySelectorAll(".intro-logo, .app-logo"), {
                max: 25,
                speed: 400,
                glare: true,
                "max-glare": 0.5,
                scale: 1.1
            });
            VanillaTilt.init(document.querySelectorAll(".enter-btn"), {
                max: 15,
                speed: 400,
                scale: 1.05,
                glare: true,
                "max-glare": 0.2
            });
        }
    }

    // Load NSFWJS Model
    async function loadAIModel() {
        aiStatus.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> Loading AI Safety Filter...`;
        aiStatus.className = 'ai-status loading';
        try {
            // Load the model from public url
            nsfwModel = await nsfwjs.load();
            aiStatus.innerHTML = `<i class='bx bx-check-shield'></i> AI Filter Active`;
            aiStatus.className = 'ai-status safe';
            setTimeout(() => {
                aiStatus.innerHTML = ''; // Clear message after 3 seconds
            }, 3000);
        } catch (error) {
            console.error("Failed to load NSFWJS model", error);
            aiStatus.innerHTML = `<i class='bx bx-error'></i> AI Filter failed (network). Moderation bypassed.`;
            aiStatus.className = 'ai-status text-muted';
        }
    }

    // Load data from Backend API
    async function loadSuggestions() {
        try {
            const res = await fetch('/api/suggestions', { cache: 'no-store' });
            if (res.ok) {
                suggestions = await res.json();
                renderSuggestions();
            }
        } catch (e) {
            console.error('Error fetching suggestions', e);
            suggestions = [];
        }
    }

    // Show Notification Toast
    function showToast() {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Button loading state animation
    function setButtonLoading(isLoading) {
        const icon = submitBtn.querySelector('i');
        const text = submitBtn.querySelector('span');

        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.8';
            icon.className = 'bx bx-loader-alt bx-spin';
            text.textContent = 'Submitting...';
        } else {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            icon.className = 'bx bx-send';
            text.textContent = 'Submit Suggestion';
        }
    }

    // Get Avatar Initials
    function getInitials(name) {
        if (!name || name.trim().toLowerCase() === 'anonymous') return 'A';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0][0].toUpperCase();
    }

    // Format Date safely
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }



    // ==========================================
    // 1. Global Function Exposures (High Priority)
    // ==========================================

    // Toggle Reply Form Visibility
    window.toggleReplyForm = (id) => {
        const form = document.getElementById(`reply-form-${id}`);
        if (form) {
            form.classList.toggle('hidden');
            if (!form.classList.contains('hidden')) {
                const input = document.getElementById(`reply-input-${id}`);
                if (input) input.focus();
            }
        }
    };

    // Post a Reply
    window.submitReply = async (id) => {
        const input = document.getElementById(`reply-input-${id}`);
        if (!input) return;

        const text = input.value.trim();
        if (!text) return;

        try {
            const res = await fetch(`/api/suggestions/${id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'User', text })
            });

            if (res.ok) {
                const data = await res.json();
                const idx = suggestions.findIndex(s => s.id === id);
                if (idx !== -1) suggestions[idx].replies = data.replies;
                input.value = '';
                renderSuggestions();
            } else {
                const err = await res.json();
                alert(err.error || "Failed to post reply.");
            }
        } catch (e) {
            console.error("Reply failed", e);
            alert("Network error. Please try again.");
        }
    };

    // Delete Suggestion
    window.deleteSuggestion = async function (id) {
        console.log("Delete requested for ID:", id);
        if (confirm('Are you sure you want to delete this suggestion? This cannot be undone.')) {
            try {
                const res = await fetch(`/api/suggestions/${id}`, {
                    method: 'DELETE',
                    headers: { 'Accept': 'application/json' }
                });

                if (res.ok) {
                    console.log("Delete successful");
                    // Force a re-fetch and render by removing from local array immediately before sync
                    suggestions = suggestions.filter(s => String(s.id) !== String(id));
                    renderSuggestions();

                    // Then optionally sync from backend
                    await loadSuggestions();
                } else {
                    const data = await res.json();
                    alert(data.error || 'Failed to delete suggestion.');
                }
            } catch (e) {
                console.error('Error deleting suggestion', e);
                alert('Network error while deleting. Is the server running?');
            }
        }
    };

    // Toggle Reaction
    window.toggleReaction = async function (id, emoji) {
        try {
            const res = await fetch(`/api/suggestions/${id}/reaction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emoji, action: 'add' })
            });

            if (res.ok) {
                await loadSuggestions();
            }
        } catch (e) {
            console.error('Error adding reaction', e);
        }
    };

    // ==========================================
    // Image Upload Logic & AI Moderation
    // ==========================================
    function setupImageUpload() {
        // Drag and drop styles
        fileInput.addEventListener('dragenter', () => fileUploadWrapper.classList.add('dragover'));
        fileInput.addEventListener('dragleave', () => fileUploadWrapper.classList.remove('dragover'));
        fileInput.addEventListener('drop', () => fileUploadWrapper.classList.remove('dragover'));

        fileInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (!file) return;

            // Type check
            if (!file.type.match('image.*') && file.type !== 'application/pdf') {
                alert('Please upload an image file (PNG, JPG, GIF) or PDF.');
                resetImage();
                return;
            }

            // Size check (Max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File is too large. Maximum size is 5MB.');
                resetImage();
                return;
            }

            const reader = new FileReader();
            reader.onload = async function (event) {
                currentImageBase64 = event.target.result;

                if (file.type === 'application/pdf') {
                    // Show a generic PDF SVG
                    const pdfIconSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a855f7'><path d='M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v16h8V4H8zm2 3h4v2h-4V7zm0 4h4v2h-4v-2zm0 4h3v2h-3v-2z'/></svg>`;
                    imagePreview.src = pdfIconSvg;
                    imagePreview.style.objectFit = 'contain';
                    imagePreview.style.padding = '2rem';

                    fileUploadUI.classList.add('hidden');
                    imagePreview.classList.remove('hidden');
                    removeImageBtn.classList.remove('hidden');

                    aiStatus.innerHTML = `<i class='bx bx-check-shield'></i> Document Attached`;
                    aiStatus.className = 'ai-status safe';
                    isImageSafe = true; // Auto safe for PDF
                } else {
                    imagePreview.src = currentImageBase64;
                    imagePreview.style.objectFit = 'cover';
                    imagePreview.style.padding = '0';

                    // Show preview, hide UI
                    fileUploadUI.classList.add('hidden');
                    imagePreview.classList.remove('hidden');
                    removeImageBtn.classList.remove('hidden');

                    // Moderation
                    await moderateImage(imagePreview);
                }
            };
            reader.readAsDataURL(file);
        });

        removeImageBtn.addEventListener('click', () => {
            resetImage();
        });
    }

    function resetImage() {
        fileInput.value = '';
        currentImageBase64 = null;
        imagePreview.src = '';
        imagePreview.style.objectFit = 'cover';
        imagePreview.style.padding = '0';
        fileUploadUI.classList.remove('hidden');
        imagePreview.classList.add('hidden');
        removeImageBtn.classList.add('hidden');
        aiStatus.innerHTML = '';
        isImageSafe = true;
    }

    async function moderateImage(imgElement) {
        if (!nsfwModel) {
            isImageSafe = true; // Bypass if model failed to load
            return;
        }

        isImageSafe = false; // Block submission during check
        setButtonLoading(true);
        aiStatus.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> Scanning image for appropriateness...`;
        aiStatus.className = 'ai-status loading';

        try {
            const predictions = await nsfwModel.classify(imgElement);
            // Predictions return array of objects: {className: "Porn", probability: 0.99}

            let isAdult = false;
            predictions.forEach(p => {
                if ((p.className === 'Porn' || p.className === 'Hentai' || p.className === 'Sexy') && p.probability > 0.6) {
                    isAdult = true;
                }
            });

            if (isAdult) {
                aiStatus.innerHTML = `<i class='bx bx-error-circle'></i> Image blocked: Contains inappropriate content.`;
                aiStatus.className = 'ai-status unsafe';
                isImageSafe = false;
                // Optional: remove image automatically
                // resetImage(); 
            } else {
                aiStatus.innerHTML = `<i class='bx bx-check-shield'></i> Image is safe.`;
                aiStatus.className = 'ai-status safe';
                isImageSafe = true;
                setTimeout(() => aiStatus.innerHTML = '', 3000);
            }
        } catch (err) {
            console.error(err);
            aiStatus.innerHTML = `<i class='bx bx-error'></i> Error scanning image.`;
            aiStatus.className = 'ai-status unsafe';
        }

        setButtonLoading(false);
    }

    // Handle Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Basic Validation
        let text = suggestionInput.value.trim();
        const hasFile = fileInput.files[0] && isImageSafe;

        if (text.length === 0 && !hasFile) {
            alert('Please provide a text suggestion OR attach a file.');
            return;
        }

        if (!isImageSafe) {
            alert('Please remove the inappropriate image before submitting.');
            return;
        }

        const category = currentCategory + ' - ' + currentSubcategory;

        setButtonLoading(true);
        const icon = submitBtn.querySelector('i');
        const btnText = submitBtn.querySelector('span');

        // --- Auto AI Spelling Check ---
        if (text.length > 0) {
            try {
                btnText.textContent = 'Checking Spelling (AI)...';
                // Using the free LanguageTool API for spelling and basic grammar
                const response = await fetch('https://api.languagetoolplus.com/v2/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ text: text, language: 'en-US' })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.matches && data.matches.length > 0) {
                        let correctedText = text;
                        // Sort by offset descending to replace from end to start without breaking previous offsets
                        const matches = data.matches.sort((a, b) => b.offset - a.offset);

                        for (const match of matches) {
                            if (match.replacements && match.replacements.length > 0) {
                                const replacement = match.replacements[0].value;
                                const before = correctedText.substring(0, match.offset);
                                const after = correctedText.substring(match.offset + match.length);
                                correctedText = before + replacement + after;
                            }
                        }
                        text = correctedText;
                        // Update UI to reflect autocorrected text
                        suggestionInput.value = text;
                    }
                }
            } catch (err) {
                console.error("Auto AI Spelling Error: Proceeding with uncorrected text", err);
            }
        }
        // --- End Auto AI Check ---

        btnText.textContent = 'Submitting...';

        setTimeout(async () => {
            const formData = new FormData();
            formData.append('name', nameInput.value.trim());
            formData.append('category', category);
            formData.append('text', text);
            if (fileInput.files[0] && isImageSafe) {
                formData.append('image', fileInput.files[0]);
            }

            try {
                const res = await fetch('/api/suggestions', {
                    method: 'POST',
                    body: formData
                });

                const data = await res.json();

                if (res.ok) {
                    await loadSuggestions();
                    showToast();
                    
                    // Trigger Success Confetti Animation
                    if (window.confetti) {
                        confetti({
                            particleCount: 100,
                            spread: 70,
                            origin: { y: 0.6 },
                            colors: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b']
                        });
                    }

                    form.reset();
                    // Reset character counter manually after form reset
                    if (charCounter) {
                        charCounter.textContent = `0 / ${maxChars}`;
                        charCounter.className = 'char-counter';
                    }
                    resetImage();
                } else {
                    // Handle Duplicate or Spam or Rate Limit errors
                    alert(data.error || 'Failed to submit suggestion.');
                }
            } catch (err) {
                console.error(err);
                alert('Network error. Is the server running?');
            }

            setButtonLoading(false);
            btnText.textContent = 'Submit Suggestion';
        }, 10);
    });

    function renderSuggestions() {
        const feedTitle = document.querySelector('.feed-header h2');
        const sortMode = feedSortSelect ? feedSortSelect.value : 'recent';

        if (feedTitle) {
            const prefix = sortMode === 'ranking' ? 'Top Ranked' : 'Recent';
            feedTitle.textContent = `${prefix} ${currentCategory} Ideas`;
        }

        // Filter: Since category in DB is saved as "MainCategory - Subcategory", we check if it starts with the current Main Category
        const filteredSuggestions = suggestions.filter(item => item.category && item.category.startsWith(currentCategory));

        if (sortMode === 'ranking') {
            // Sort filtered suggestions by total reactions for accurate Ranking
            filteredSuggestions.sort((a, b) => {
                const getScore = (entry) => {
                    if (!entry.reactions) return 0;
                    return Object.values(entry.reactions).reduce((sum, count) => sum + count, 0);
                };
                return getScore(b) - getScore(a);
            });
        } else {
            // Sort by recent Date (newest first)
            filteredSuggestions.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        totalCountSpan.textContent = `${filteredSuggestions.length} Total`;

        if (filteredSuggestions.length === 0) {
            suggestionsContainer.innerHTML = `
                <div class="empty-state">
                    <i class='bx bx-ghost'></i>
                    <p>No ${currentCategory} suggestions yet. Be the first to share an idea!</p>
                </div>
            `;
            return;
        }

        // Clear container
        suggestionsContainer.innerHTML = '';

        // Build HTML
        filteredSuggestions.forEach((item, index) => {
            const card = document.createElement('div');

            // CSS classes for tags based on option text
            // Determine catClass primarily by checking if the main category has a specific type
            let catClass = 'cat-General';
            // We use item.category which contains "Main - Sub"
            if (item.category) {
                if (item.category.includes('Feature') || item.category.includes('Tech') || item.category.includes('Code') || item.category.includes('Hackathon')) catClass = 'cat-Feature';
                else if (item.category.includes('Bug') || item.category.includes('Admin') || item.category.includes('Lab')) catClass = 'cat-Bug';
                else if (item.category.includes('Feedback') || item.category.includes('Wellbeing') || item.category.includes('Method')) catClass = 'cat-Feedback';
            }

            // Reactions Map
            const reactions = item.reactions || { "👍": item.likes || 0, "❤️": 0, "😂": 0, "💡": 0 };
            const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

            // Assign ranks (Index 0 = Gold, Index 1 = Silver) if they have at least 1 reaction
            let rankClass = '';
            if (index === 0 && totalReactions > 0) rankClass = 'rank-1';
            else if (index === 1 && totalReactions > 0) rankClass = 'rank-2';

            card.className = `suggestion-card ${rankClass}`;

            let reactionsHTML = '';
            const emojis = ['👍', '❤️', '😂', '💡'];
            emojis.forEach(emoji => {
                const count = reactions[emoji] || 0;
                reactionsHTML += `
                    <button class="reaction-btn" onclick="toggleReaction('${item.id}', '${emoji}')">
                        <span class="emoji">${emoji}</span>
                        <span class="count">${count}</span>
                    </button>
                `;
            });

            // Media Rendering (Image or PDF)
            let mediaHTML = '';
            if (item.image_url) {
                if (item.image_url.startsWith('data:application/pdf') || item.image_url.endsWith('.pdf')) {
                    mediaHTML = `
                        <div class="pdf-attachment" style="margin-top: 1rem; padding: 1.25rem; background: rgba(139, 92, 246, 0.05); border-radius: 12px; border: 1px solid rgba(139, 92, 246, 0.2); display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <i class='bx bxs-file-pdf' style="font-size: 1.75rem; color: var(--accent-primary);"></i>
                                <span style="color: var(--text-main); font-weight: 500;">Attached PDF Document</span>
                            </div>
                            <div style="display: flex; gap: 1rem; width: 100%; justify-content: center;">
                                <a href="${item.image_url}" target="_blank" style="padding: 0.5rem 1rem; border-radius: 8px; background: rgba(67, 56, 202, 0.2); color: #fff; text-decoration: none; display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; transition: background 0.3s ease;">
                                    <i class='bx bx-show'></i> View
                                </a>
                                <a href="${item.image_url}" download="Attached_Document.pdf" style="padding: 0.5rem 1rem; border-radius: 8px; background: rgba(16, 185, 129, 0.2); color: #fff; text-decoration: none; display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; transition: background 0.3s ease;">
                                    <i class='bx bx-download'></i> Download
                                </a>
                            </div>
                        </div>
                    `;
                } else {
                    mediaHTML = `<img src="${item.image_url}" alt="Attached Image" class="card-image">`;
                }
            }

            card.innerHTML = `
                <div class="card-header">
                    <div class="user-info">
                        <div class="avatar">${getInitials(item.name)}</div>
                        <div class="meta-info">
                            <span class="user-name">${escapeHTML(item.name)}</span>
                            <span class="date">${formatDate(item.date)}</span>
                        </div>
                    </div>
                    <div class="header-actions">
                        <div class="category-tag ${catClass}">
                            ${escapeHTML(item.category)}
                        </div>
                        <button class="delete-post-btn" data-id="${item.id}" title="Delete Suggestion">
                            <i class='bx bx-trash'></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <p>${escapeHTML(item.text)}</p>
                    ${mediaHTML}
                </div>
                <div class="card-footer reaction-footer">
                    ${reactionsHTML.replace(/onclick="toggleReaction\('([^']+)', '([^']+)'\)"/g, 'data-reaction-id="$1" data-reaction-emoji="$2"')}
                    <button class="reply-toggle-btn" data-reply-id="${item.id}">
                        <i class='bx bx-reply'></i> Reply
                    </button>
                </div>

                <!-- Reply Section -->
                <div class="reply-section" id="reply-sec-${item.id}">
                    <div class="replies-list" id="replies-list-${item.id}">
                        ${(item.replies || []).map(reply => `
                            <div class="reply-item">
                                <span class="reply-author">${escapeHTML(reply.name)}:</span>
                                <span class="reply-text">${escapeHTML(reply.text)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="reply-form hidden" id="reply-form-${item.id}">
                        <input type="text" placeholder="Type reply & press Enter..." id="reply-input-${item.id}" data-reply-input="${item.id}">
                        <button class="post-reply-btn" data-post-reply="${item.id}">Post</button>
                    </div>
                </div>
            `;
            suggestionsContainer.appendChild(card);
        });

        // Attach event listeners to newly created elements
        suggestionsContainer.querySelectorAll('.delete-post-btn').forEach(btn => {
            btn.addEventListener('click', () => window.deleteSuggestion(btn.dataset.id));
        });

        suggestionsContainer.querySelectorAll('.reaction-btn').forEach(btn => {
            btn.addEventListener('click', () => window.toggleReaction(btn.dataset.reactionId, btn.dataset.reactionEmoji));
        });

        suggestionsContainer.querySelectorAll('.reply-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => window.toggleReplyForm(btn.dataset.replyId));
        });

        suggestionsContainer.querySelectorAll('.post-reply-btn').forEach(btn => {
            btn.addEventListener('click', () => window.submitReply(btn.dataset.postReply));
        });

        suggestionsContainer.querySelectorAll('input[data-reply-input]').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') window.submitReply(input.dataset.replyInput);
            });
        });

        // Initialize 3D Tilt on dynamically created cards
        if (window.VanillaTilt) {
            VanillaTilt.init(document.querySelectorAll(".suggestion-card"), {
                max: 10,
                speed: 400,
                glare: true,
                "max-glare": 0.3,
                scale: 1.02
            });
        }
    }

    // XSS Prevention Utility
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ==========================================
    // Advanced Starburst Particle Network 
    // ==========================================
    function initAntigravity() {
        const canvas = document.getElementById('antigravity-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let width, height, particles;

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            createParticles();
        }

        const colors = [
            '#a855f7', // Purple
            '#ec4899', // Pink
            '#3b82f6', // Blue
            '#f59e0b', // Yellow/Orange
            '#10b981', // Green
            '#ef4444'  // Red
        ];

        class Particle {
            constructor(spawnAtCenter = true) {
                this.reset(spawnAtCenter);
            }

            reset(spawnAtCenter) {
                this.angle = Math.random() * Math.PI * 2;
                this.speed = Math.random() * 1.5 + 0.2; // Initial speed

                // Start center, or random position if initially filling the screen
                const initialRadius = spawnAtCenter ? (Math.random() * 20) : (Math.random() * Math.max(width, height));

                this.x = (width / 2) + Math.cos(this.angle) * initialRadius;
                this.y = (height / 2) + Math.sin(this.angle) * initialRadius;

                this.vx = Math.cos(this.angle) * this.speed;
                this.vy = Math.sin(this.angle) * this.speed;

                this.size = Math.random() * 1.5 + 0.5;
                this.color = colors[Math.floor(Math.random() * colors.length)];

                this.history = [];
                this.maxHistory = Math.floor(Math.random() * 15) + 5; // Trail length
            }

            update() {
                this.history.push({ x: this.x, y: this.y });
                if (this.history.length > this.maxHistory) {
                    this.history.shift();
                }

                this.x += this.vx;
                this.y += this.vy;

                // Accelerate as it moves outward (warp effect)
                this.speed *= 1.015;
                this.vx = Math.cos(this.angle) * this.speed;
                this.vy = Math.sin(this.angle) * this.speed;

                // Reset if off screen
                if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
                    this.reset(true);
                }
            }

            draw() {
                if (this.history.length > 0) {
                    ctx.beginPath();
                    ctx.moveTo(this.history[0].x, this.history[0].y);
                    for (let i = 1; i < this.history.length; i++) {
                        ctx.lineTo(this.history[i].x, this.history[i].y);
                    }
                    ctx.strokeStyle = this.color;
                    ctx.globalAlpha = 0.6;
                    ctx.lineWidth = this.size;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                    ctx.globalAlpha = 1.0;
                }

                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
            }
        }

        function createParticles() {
            particles = [];
            // Calculate number of particles based on screen size (denser than before)
            const count = Math.floor((width * height) / 5000);
            for (let i = 0; i < count; i++) {
                particles.push(new Particle(false));
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }

            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', resize);
        resize();
        animate();
    }

    // Run Initialization
    init();
});
