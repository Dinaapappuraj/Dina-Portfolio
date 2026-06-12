// Interactive Features for Premium Portfolio

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Mobile Navigation Toggle
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    
    if (mobileNavToggle && mobileMenu) {
        // Toggle menu on click
        mobileNavToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            
            // Toggle icon between menu and close
            const icon = mobileNavToggle.querySelector('i');
            if (icon) {
                const isClose = mobileMenu.classList.contains('active');
                icon.setAttribute('data-lucide', isClose ? 'x' : 'menu');
                lucide.createIcons();
            }
        });

        // Close menu when a link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                const icon = mobileNavToggle.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-lucide', 'menu');
                    lucide.createIcons();
                }
            });
        });
    }

    // 3. Mouse-Tracking Card Glow Effect (Stripe/Vercel-like hover)
    const glowCards = document.querySelectorAll('.hover-glow');
    
    glowCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top;  // y position within the element
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // 4. Scroll Reveal Animations (IntersectionObserver)
    const fadeElements = document.querySelectorAll('.fade-in, .timeline-item, .project-card, .skill-category-card, .cert-card');
    
    // Add default styling class if not present
    fadeElements.forEach(el => {
        if (!el.classList.contains('fade-in')) {
            el.classList.add('fade-in');
        }
    });

    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // 5. Interactive Canvas Particle Background Network
    const canvas = document.getElementById('aurora-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null, radius: 150 };

        // Set full screen size
        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        setCanvasSize();
        window.addEventListener('resize', setCanvasSize);

        // Track mouse position on window
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        // Particle class definition
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.3; // Very slow movement
                this.vy = (Math.random() - 0.5) * 0.3;
                this.size = Math.random() * 1.5 + 0.5;
                this.baseAlpha = Math.random() * 0.3 + 0.1;
                this.alpha = this.baseAlpha;
            }

            update() {
                // Border collision
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

                this.x += this.vx;
                this.y += this.vy;

                // Mouse interaction (push away gently)
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = this.x - mouse.x;
                    const dy = this.y - mouse.y;
                    const distance = Math.hypot(dx, dy);
                    
                    if (distance < mouse.radius) {
                        const force = (mouse.radius - distance) / mouse.radius;
                        // Push away relative to force
                        this.x += (dx / distance) * force * 1.2;
                        this.y += (dy / distance) * force * 1.2;
                        this.alpha = Math.min(0.6, this.baseAlpha + force * 0.3);
                    } else {
                        // Return to baseline opacity
                        if (this.alpha > this.baseAlpha) {
                            this.alpha -= 0.01;
                        }
                    }
                } else {
                    if (this.alpha > this.baseAlpha) {
                        this.alpha -= 0.01;
                    }
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(59, 130, 246, ${this.alpha})`;
                ctx.fill();
            }
        }

        // Initialize particles
        const initParticles = () => {
            particles = [];
            // Determine quantity based on screen width
            const count = Math.floor((canvas.width * canvas.height) / 16000);
            const cappedCount = Math.min(100, Math.max(30, count)); // Avoid heavy rendering
            
            for (let i = 0; i < cappedCount; i++) {
                particles.push(new Particle());
            }
        };
        initParticles();
        window.addEventListener('resize', initParticles);

        // Draw connections between nearby particles
        const drawConnections = () => {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.hypot(dx, dy);

                    if (distance < 110) {
                        // Connect points with thin line
                        const alpha = (110 - distance) / 110 * 0.08;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        
                        // Use gradient from primary to secondary for lines
                        const gradient = ctx.createLinearGradient(
                            particles[i].x, particles[i].y, 
                            particles[j].x, particles[j].y
                        );
                        gradient.addColorStop(0, `rgba(59, 130, 246, ${alpha})`);
                        gradient.addColorStop(1, `rgba(139, 92, 246, ${alpha})`);
                        
                        ctx.strokeStyle = gradient;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        };

        // Animation Loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            
            drawConnections();
            requestAnimationFrame(animate);
        };
        animate();
    }

    // --- REFINEMENTS IMPLEMENTATION ---

    // 6. Hero Rotating Titles & Typing Effect
    const subtitleEl = document.getElementById('rotating-subtitle');
    if (subtitleEl) {
        const titles = [
            "Java Developer",
            "AI/ML Developer",
            "Flutter Developer",
            "Full Stack Developer"
        ];
        let titleIndex = 0;
        
        const rotateTitles = () => {
            if (titleIndex < titles.length) {
                subtitleEl.style.opacity = 0;
                subtitleEl.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                    subtitleEl.textContent = titles[titleIndex];
                    subtitleEl.style.opacity = 1;
                    subtitleEl.style.transform = 'translateY(0)';
                    titleIndex++;
                    
                    setTimeout(rotateTitles, 2200);
                }, 400);
            } else {
                typeOutImmediateJoiner();
            }
        };
        
        const typeOutImmediateJoiner = () => {
            const finalWord = "Immediate Joiner";
            subtitleEl.style.opacity = 0;
            subtitleEl.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                subtitleEl.textContent = "";
                subtitleEl.classList.add('typing-cursor');
                subtitleEl.style.opacity = 1;
                subtitleEl.style.transform = 'translateY(0)';
                
                let charIndex = 0;
                const typeChar = () => {
                    if (charIndex < finalWord.length) {
                        subtitleEl.textContent += finalWord.charAt(charIndex);
                        charIndex++;
                        setTimeout(typeChar, 100);
                    }
                };
                typeChar();
            }, 400);
        };
        
        subtitleEl.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        setTimeout(rotateTitles, 500);
    }

    // 7. Sticky Hero Scrolling Experience & Social Sidebar Visibility
    const heroSection = document.getElementById('hero');
    const heroGrid = document.querySelector('.hero-grid');
    const socialSidebar = document.querySelector('.social-sidebar');
    
    if (heroSection && heroGrid) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            
            // Toggle social sidebar visibility (hide in Hero section)
            if (socialSidebar) {
                const threshold = window.innerHeight * 0.45;
                if (scrollY > threshold) {
                    socialSidebar.classList.add('visible');
                } else {
                    socialSidebar.classList.remove('visible');
                }
            }
            
            if (window.innerWidth > 1024) {
                const threshold = window.innerHeight;
                
                if (scrollY <= threshold) {
                    const ratio = scrollY / threshold;
                    heroGrid.style.opacity = (1 - ratio * 1.35).toFixed(2);
                    
                    const scaleValue = (1 - ratio * 0.08).toFixed(3);
                    heroGrid.style.transform = `scale(${scaleValue})`;
                } else {
                    heroGrid.style.opacity = 0;
                }
            } else {
                heroGrid.style.opacity = 1;
                heroGrid.style.transform = 'none';
            }
        });
    }

    // 8. Smooth Scroll Navigation with Navbar Height Offset
    const navLinks = document.querySelectorAll('.nav-link, .mobile-link, .hero-actions a[href^="#"], .logo');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                
                const targetElement = document.querySelector(targetId === '#' ? 'body' : targetId);
                if (targetElement) {
                    const navbarHeight = 72; // matches header height
                    const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                    const offsetPosition = elementPosition - navbarHeight;
                    
                    window.scrollTo({
                        top: targetId === '#' ? 0 : offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });



    // 10. Project Detailed Data Database
    const projectsData = {
        'money-manager': {
            name: "Intelligent Money Manager",
            image: "assets/project_money.png",
            problem: "Manual expense tracking is tedious, time-consuming, and prone to user neglect, while automated solutions often compromise user data privacy.",
            features: [
                "Automated receipt scanning via machine learning",
                "Automatic expense categorization and spending trend analysis",
                "Real-time transaction storage and data sync across multiple devices"
            ],
            tech: ["Flutter", "Python", "Flask", "Firebase Firestore", "Donut OCR Model", "Linear Regression"],
            architecture: "User uploads a receipt image via the Flutter mobile client. The image is securely processed by a custom Python/Flask backend using a Donut OCR model to extract merchant details, total amounts, and dates. Category classification is handled by a local Linear Regression model. Results are stored in Firebase Firestore for real-time synchronization across devices.",
            challenges: "Achieving high OCR text extraction accuracy on receipts with varying layouts, fonts, or low-lighting conditions, which was solved by custom pre-processing and tuning of the Donut model.",
            contributions: [
                "Engineered the OCR parsing pipeline and Flask backend API endpoints.",
                "Integrated the machine learning categorization engine on the server side.",
                "Architected the Firebase Firestore real-time synchronization layer on the mobile application."
            ],
            github: "https://github.com/Dinaapappuraj"
        },
        'road-damage': {
            name: "AI-Enhanced Road Damage Reporting System",
            image: "assets/project_road.png",
            problem: "Reporting road hazards to municipalities is slow and manual, and lacks precise coordinate tracking, causing delays in repairing structural hazards.",
            features: [
                "End-to-end computer vision road damage detection pipeline",
                "GPS-based geolocation tagging for instant hazard mapping",
                "Mobile client for reporting hazards and administrative dashboard for querying and review"
            ],
            tech: ["Flutter", "Firebase", "Python", "OpenCV", "CNN", "Transformer Models", "Geolocation"],
            architecture: "Mobile users capture hazard photos in the field. The app geotags the report with precise GPS coordinates. The image is processed through an OpenCV and Convolutional Neural Network (CNN) pipeline to identify and categorize the type and severity of road damage. The geotagged report is then pushed to Firebase to populate the administrator's map view.",
            challenges: "Classifying road damage types accurately under diverse lighting and weather conditions. Solved by training the CNN model on a balanced dataset of environmental conditions and applying image preprocessing techniques.",
            contributions: [
                "Trained and evaluated the Custom CNN classifier for damage categorization.",
                "Integrated GPS geolocation modules and map visualizer overlays.",
                "Developed the administrative dashboard for real-time reporting analytics."
            ],
            github: "https://github.com/Dinaapappuraj"
        },
        'hostel-management': {
            name: "Hostel Management System",
            image: "assets/project_hostel.png",
            problem: "Hostel operations, room allocations, leave approvals, and student complaints are historically managed through paperwork, leading to records loss and slow response times.",
            features: [
                "Real-time room allocation status tracking",
                "Fully digitalized leave registration and approval flow",
                "Instant administrative dashboard updates and student complaint loggers"
            ],
            tech: ["Flutter", "Firebase", "Firestore", "Dart"],
            architecture: "Built as a secure cross-platform client using Flutter. Implements Firebase Authentication for student and admin roles. Data management and synchronization are powered by Firebase Firestore, triggering real-time UI state updates on room allocations, leave records, and complaints.",
            challenges: "Avoiding room allocation race conditions when multiple users select the same room simultaneously. Handled by executing atomic Firestore transaction operations.",
            contributions: [
                "Designed secure student/admin authentication gateways and role redirection.",
                "Coded database transaction blocks ensuring race-free room allocations.",
                "Created mobile views for leave tracking and complaint logging."
            ],
            github: "https://github.com/Dinaapappuraj"
        },
        'wheelchair-accessibility': {
            name: "Wheelchair Accessibility Mobile Application",
            image: "assets/project_wheel.png",
            problem: "Individuals with mobility challenges struggle to navigate public spaces and plan barrier-free routes due to missing accessibility details in mainstream mapping apps.",
            features: [
                "Live turn-by-turn navigation and map discovery with accessibility overlays",
                "Dynamic venue filters highlighting ramps, elevators, and wide entrances",
                "Physical prototype testing confirming core accessibility flows"
            ],
            tech: ["Flutter", "Dart", "OpenStreetMap API"],
            architecture: "Leverages the OpenStreetMap API to render geographic data in a custom Flutter app. Venue databases are queried with specific accessibility tag filters (elevators, ramps). The route planner plots paths avoiding stairs and other mobility barriers.",
            challenges: "Overcoming inaccurate or missing accessibility metadata in public geographic datasets. Solved by introducing crowdsourced tag validation and overlaying custom venue attributes.",
            contributions: [
                "Integrated OpenStreetMap rendering and routing engine via Flutter plugins.",
                "Developed the accessibility-focused routing algorithm.",
                "Conducted field testing using target Android device APKs."
            ],
            github: "https://github.com/Dinaapappuraj"
        }
    };

    // 11. Project Modal Event Handlers
    const projectCards = document.querySelectorAll('.project-card');
    const modal = document.getElementById('project-modal');
    const modalClose = document.querySelector('.modal-close-btn');
    
    if (projectCards && modal && modalClose) {
        projectCards.forEach(card => {
            card.addEventListener('click', () => {
                const projectId = card.getAttribute('data-project-id');
                const project = projectsData[projectId];
                
                if (project) {
                    // Populate modal contents
                    document.getElementById('modal-project-image').src = project.image;
                    document.getElementById('modal-project-image').alt = project.name;
                    document.getElementById('modal-project-name').textContent = project.name;
                    document.getElementById('modal-problem-statement').textContent = project.problem;
                    document.getElementById('modal-architecture').textContent = project.architecture;
                    document.getElementById('modal-challenges').textContent = project.challenges;
                    document.getElementById('modal-github-link').href = project.github;
                    
                    // Render tech stack tags
                    const techStackEl = document.getElementById('modal-tech-stack');
                    techStackEl.innerHTML = '';
                    project.tech.forEach(t => {
                        const tag = document.createElement('span');
                        tag.textContent = t;
                        techStackEl.appendChild(tag);
                    });
                    
                    // Render features list
                    const featuresEl = document.getElementById('modal-features');
                    featuresEl.innerHTML = '';
                    project.features.forEach(f => {
                        const item = document.createElement('li');
                        item.textContent = f;
                        featuresEl.appendChild(item);
                    });
                    
                    // Render contributions list
                    const contributionsEl = document.getElementById('modal-contributions');
                    contributionsEl.innerHTML = '';
                    project.contributions.forEach(c => {
                        const item = document.createElement('li');
                        item.textContent = c;
                        contributionsEl.appendChild(item);
                    });
                    
                    // Show modal
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden'; // prevent background scrolling
                }
            });
        });
        
        const closeModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // restore background scrolling
        };
        
        modalClose.addEventListener('click', closeModal);
        
        // Close modal when clicking outside container
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Close modal on Escape press
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // 12. Contact Section Intersection Observer for Social Sidebar Tooltips
    const contactSection = document.getElementById('contact');
    const sidebar = document.querySelector('.social-sidebar');
    
    if (contactSection && sidebar) {
        const contactObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    sidebar.classList.add('in-contact');
                } else {
                    sidebar.classList.remove('in-contact');
                }
            });
        }, {
            threshold: 0.25
        });
        
        contactObserver.observe(contactSection);
    }
});
