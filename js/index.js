// index.js for TaskFlow landing page
// Handles registration, validation, and redirect logic 

document.addEventListener('DOMContentLoaded', () => {
  // Check if user data exists in localStorage
  const user = JSON.parse(localStorage.getItem('taskflow_user'));
  if (user && user.name && user.dob) {
    // Validate existing user data
    const age = calculateAge(user.dob);
    if (age > 10) {
      window.location.href = 'app.html';
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

  // Real-time validation
  nameInput.addEventListener('input', validateName);
  dobInput.addEventListener('change', validateAge);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Clear previous errors
    clearErrors();
    
    // Validate all fields
    const nameValid = validateName();
    const dobValid = validateDob();
    const ageValid = validateAge();
    
    if (!nameValid || !dobValid || !ageValid) {
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
    submitButton.textContent = 'Setting up your workspace...';

    // Save user data
    try {
      localStorage.setItem('taskflow_user', JSON.stringify({ 
        name, 
        dob,
        registrationDate: new Date().toISOString()
      }));
      
      // Show success message briefly before redirect
      showSuccess('Welcome to TaskFlow! Redirecting...');
      
      setTimeout(() => {
        window.location.href = 'app.html';
      }, 1000);
      
    } catch (error) {
      showError('Failed to save your data. Please try again.');
      submitButton.disabled = false;
      submitButton.textContent = 'Continue';
    }
  });

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

  function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.className = 'text-red-500 text-sm mt-2';
    errorMessage.classList.remove('hidden');
  }

  function showSuccess(msg) {
    errorMessage.textContent = msg;
    errorMessage.className = 'text-green-500 text-sm mt-2';
    errorMessage.classList.remove('hidden');
  }

  function showInfo(msg) {
    errorMessage.textContent = msg;
    errorMessage.className = 'text-blue-500 text-sm mt-2';
    errorMessage.classList.remove('hidden');
  }

  function showFieldError(input, msg) {
    input.classList.add('border-red-500', 'focus:ring-red-500');
    input.classList.remove('border-gray-300', 'focus:ring-primary');
    
    // Show error message
    showError(msg);
  }

  function clearFieldError(input) {
    input.classList.remove('border-red-500', 'focus:ring-red-500');
    input.classList.add('border-gray-300', 'focus:ring-primary');
  }

  function clearErrors() {
    errorMessage.classList.add('hidden');
    errorMessage.textContent = '';
    clearFieldError(nameInput);
    clearFieldError(dobInput);
  }

  // Add helpful tooltip for age requirement
  const ageInfo = document.createElement('div');
  ageInfo.className = 'text-xs text-gray-500 mt-1';
  ageInfo.innerHTML = '💡 You must be over 10 years old to use TaskFlow.';
  dobInput.parentNode.appendChild(ageInfo);

  // Add character counter for name
  const nameCounter = document.createElement('div');
  nameCounter.className = 'text-xs text-gray-400 mt-1 text-right';
  nameInput.parentNode.appendChild(nameCounter);
  
  nameInput.addEventListener('input', () => {
    const length = nameInput.value.length;
    nameCounter.textContent = `${length}/50 characters`;
    nameCounter.className = `text-xs mt-1 text-right ${length > 50 ? 'text-red-400' : 'text-gray-400'}`;
  });

  console.log('TaskFlow registration page loaded successfully!');
}); 