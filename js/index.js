// index.js for TaskFlow landing page
// Handles registration, validation, and redirect logic with enhanced animations

document.addEventListener('DOMContentLoaded', () => {
  // Initialize particle system
  initializeParticles();
  
  // Add typing animation to hero text
  initializeTypingAnimation();
  
  // Add scroll-triggered animations
  initializeScrollAnimations();
  
  // Check if user data exists in localStorage
  let user = null;
  try {
    const userData = localStorage.getItem('taskflow_user');
    if (userData) {
      user = JSON.parse(userData);
    }
  } catch (error) {
    // If JSON parsing fails, clear the invalid data
    console.warn('Invalid user data found in localStorage, clearing...');
    localStorage.removeItem('taskflow_user');
  }
  
  if (user && user.name && user.dob) {
    // Validate existing user data
    const age = calculateAge(user.dob);
    if (age > 10) {
      // Add smooth transition before redirect
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.5s ease-out';
      setTimeout(() => {
        window.location.href = 'app.html';
      }, 500);
      return;
    } else {
      // Clear invalid user data
      localStorage.removeItem('taskflow_user');
    }
  }

  const form = document.getElementById('registration-form');
  const nameInput = document.getElementById('name');
  const dobInput = document.getElementById('dob');
  const errorMessage = document.getElementById('error-message');
  const submitButton = form.querySelector('button[type="submit"]');

  // Set max date to today (prevent future dates)
  const today = new Date().toISOString().split('T')[0];
  dobInput.setAttribute('max', today);

  // Real-time validation with enhanced feedback
  nameInput.addEventListener('input', validateName);
  dobInput.addEventListener('change', validateAge);
  
  // Add focus animations
  nameInput.addEventListener('focus', () => addFocusEffect(nameInput));
  nameInput.addEventListener('blur', () => removeFocusEffect(nameInput));
  dobInput.addEventListener('focus', () => addFocusEffect(dobInput));
  dobInput.addEventListener('blur', () => removeFocusEffect(dobInput));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Clear previous errors
    clearErrors();
    
    // Validate all fields
    const nameValid = validateName();
    const dobValid = validateDob();
    const ageValid = validateAge();
    
    if (!nameValid || !dobValid || !ageValid) {
      // Add shake animation to form
      form.classList.add('animate-bounce');
      setTimeout(() => form.classList.remove('animate-bounce'), 1000);
      return;
    }

    const name = nameInput.value.trim();
    const dob = dobInput.value;
    const age = calculateAge(dob);

    // Final age check
    if (age <= 10) {
      showError('You must be over 10 years old to use TaskFlow. Please check your date of birth.');
      return;
    }

    // Disable submit button to prevent double submission
    submitButton.disabled = true;
    submitButton.innerHTML = `
      <span class="flex items-center justify-center">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Setting up your workspace...
      </span>
    `;

    // Save user data
    try {
      localStorage.setItem('taskflow_user', JSON.stringify({ 
        name, 
        dob,
        registrationDate: new Date().toISOString()
      }));
      
      // Show success message with enhanced animation
      showSuccess('Welcome to TaskFlow! Redirecting...');
      
      // Add success animation to the entire page
      document.body.style.transform = 'scale(0.95)';
      document.body.style.transition = 'all 0.5s ease-out';
      
      setTimeout(() => {
        document.body.style.opacity = '0';
        document.body.style.transform = 'scale(1.05)';
        setTimeout(() => {
          window.location.href = 'app.html';
        }, 500);
      }, 1000);
      
    } catch (error) {
      showError('Failed to save your data. Please try again.');
      submitButton.disabled = false;
      submitButton.innerHTML = `
        <span class="flex items-center justify-center">
          <span class="mr-2">🚀</span>
          Start Your Journey
          <span class="ml-2">→</span>
        </span>
      `;
    }
  });

  // Enhanced validation functions
  function validateName() {
    const name = nameInput.value.trim();
    
    if (!name) {
      showFieldError(nameInput, 'Name is required.');
      return false;
    }
    
    if (name.length < 2) {
      showFieldError(nameInput, 'Name must be at least 2 characters long.');
      return false;
    }
    
    if (name.length > 50) {
      showFieldError(nameInput, 'Name is too long. Please use a shorter name.');
      return false;
    }
    
    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (!nameRegex.test(name)) {
      showFieldError(nameInput, 'Name can only contain letters, spaces, hyphens, and apostrophes.');
      return false;
    }
    
    clearFieldError(nameInput);
    return true;
  }

  function validateDob() {
    const dob = dobInput.value;
    
    if (!dob) {
      showFieldError(dobInput, 'Date of birth is required.');
      return false;
    }
    
    const selectedDate = new Date(dob);
    const today = new Date();
    
    if (selectedDate > today) {
      showFieldError(dobInput, 'Date of birth cannot be in the future.');
      return false;
    }
    
    // Check if date is reasonable (not too far in the past)
    const minDate = new Date('1900-01-01');
    if (selectedDate < minDate) {
      showFieldError(dobInput, 'Please enter a valid date of birth.');
      return false;
    }
    
    clearFieldError(dobInput);
    return true;
  }

  function validateAge() {
    const dob = dobInput.value;
    
    if (!dob) {
      return false;
    }
    
    const age = calculateAge(dob);
    
    if (age <= 0) {
      showFieldError(dobInput, 'Please enter a valid date of birth.');
      return false;
    }
    
    if (age <= 10) {
      showFieldError(dobInput, `You are ${age} years old. You must be over 10 years old to use TaskFlow.`);
      return false;
    }
    
    if (age > 120) {
      showFieldError(dobInput, 'Please enter a valid date of birth.');
      return false;
    }
    
    // Show age confirmation for users close to the limit
    if (age <= 12) {
      showInfo(`You are ${age} years old. Welcome to TaskFlow!`);
    }
    
    clearFieldError(dobInput);
    return true;
  }

  function calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  // Enhanced error/success display functions
  function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.className = 'text-red-500 text-sm mt-2 animate-pulse';
    errorMessage.classList.remove('hidden');
    
    // Add shake animation to the form
    form.classList.add('animate-bounce');
    setTimeout(() => form.classList.remove('animate-bounce'), 1000);
  }

  function showSuccess(msg) {
    errorMessage.textContent = msg;
    errorMessage.className = 'text-green-500 text-sm mt-2 animate-pulse';
    errorMessage.classList.remove('hidden');
  }

  function showInfo(msg) {
    errorMessage.textContent = msg;
    errorMessage.className = 'text-blue-500 text-sm mt-2 animate-pulse';
    errorMessage.classList.remove('hidden');
  }

  function showFieldError(input, msg) {
    input.classList.add('border-red-500', 'focus:ring-red-500', 'animate-pulse');
    input.classList.remove('border-gray-200', 'focus:ring-blue-500/20');
    
    // Show error message
    showError(msg);
  }

  function clearFieldError(input) {
    input.classList.remove('border-red-500', 'focus:ring-red-500', 'animate-pulse');
    input.classList.add('border-gray-200', 'focus:ring-blue-500/20');
  }

  function clearErrors() {
    errorMessage.classList.add('hidden');
    errorMessage.textContent = '';
    clearFieldError(nameInput);
    clearFieldError(dobInput);
  }

  // Focus effect functions
  function addFocusEffect(input) {
    input.parentElement.classList.add('scale-105');
    input.parentElement.style.transition = 'transform 0.2s ease-out';
  }

  function removeFocusEffect(input) {
    input.parentElement.classList.remove('scale-105');
  }

  // Animation initialization functions
  function initializeParticles() {
    // Create additional floating particles
    for (let i = 0; i < 10; i++) {
      createParticle();
    }
  }

  function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 4 + 's';
    particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
    document.body.appendChild(particle);
  }

  function initializeTypingAnimation() {
    const heroText = document.querySelector('.gradient-text');
    if (heroText) {
      const text = heroText.textContent;
      heroText.textContent = '';
      heroText.style.borderRight = '2px solid #667eea';
      
      let i = 0;
      const typeWriter = () => {
        if (i < text.length) {
          heroText.textContent += text.charAt(i);
          i++;
          setTimeout(typeWriter, 100);
        } else {
          heroText.style.borderRight = 'none';
        }
      };
      
      setTimeout(typeWriter, 1000);
    }
  }

  function initializeScrollAnimations() {
    // Add intersection observer for scroll-triggered animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fadeSlide');
        }
      });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.glass-effect').forEach(el => {
      observer.observe(el);
    });
  }

  // Add helpful tooltip for age requirement with enhanced styling
  const ageInfo = document.createElement('div');
  ageInfo.className = 'text-xs text-gray-500 mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200';
  ageInfo.innerHTML = '💡 You must be over 10 years old to use TaskFlow.';
  dobInput.parentNode.appendChild(ageInfo);

  // Add character counter for name with enhanced styling
  const nameCounter = document.createElement('div');
  nameCounter.className = 'text-xs text-gray-400 mt-2 text-right transition-colors duration-300';
  nameInput.parentNode.appendChild(nameCounter);
  
  nameInput.addEventListener('input', () => {
    const length = nameInput.value.length;
    nameCounter.textContent = `${length}/50 characters`;
    nameCounter.className = `text-xs mt-2 text-right transition-colors duration-300 ${
      length > 50 ? 'text-red-400' : length > 40 ? 'text-yellow-400' : 'text-gray-400'
    }`;
  });

  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.target === nameInput || e.target === dobInput)) {
      form.dispatchEvent(new Event('submit'));
    }
  });

  console.log('TaskFlow landing page loaded successfully with enhanced animations! 🎨');
}); 