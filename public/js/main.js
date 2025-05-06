document.addEventListener('DOMContentLoaded', function() {
  // Feedback Modal
  const feedbackButtons = document.querySelectorAll('.feedback-button');
  const feedbackModal = document.getElementById('feedbackModal');
  const closeFeedbackModal = document.querySelector('#feedbackModal .close');
  
  if (feedbackButtons.length > 0 && feedbackModal) {
    feedbackButtons.forEach(button => {
      button.addEventListener('click', function() {
        feedbackModal.style.display = 'block';
      });
    });
    
    if (closeFeedbackModal) {
      closeFeedbackModal.addEventListener('click', function() {
        feedbackModal.style.display = 'none';
      });
    }
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
      if (event.target === feedbackModal) {
        feedbackModal.style.display = 'none';
      }
    });
    
    // Validate form before submission
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
      feedbackForm.addEventListener('submit', function(e) {
        const rating = document.querySelector('input[name="rating"]:checked');
        if (!rating) {
          e.preventDefault();
          alert('Please rate your experience');
        }
      });
    }
  }
  
  // Mobile navigation toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (mobileToggle) {
    mobileToggle.addEventListener('click', function() {
      navMenu.classList.toggle('active');
    });
  }
  
  // Auth tabs
  const authTabs = document.querySelectorAll('.auth-tab');
  const authContents = document.querySelectorAll('.auth-form-content');
  
  if (authTabs.length > 0) {
    authTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs and contents
        authTabs.forEach(t => t.classList.remove('active'));
        authContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        document.getElementById(tab.dataset.target).classList.add('active');
      });
    });
  }
  
  // Food image gallery
  const mainImage = document.querySelector('.food-main-image');
  const thumbnails = document.querySelectorAll('.food-thumbnail');
  
  if (thumbnails.length > 0) {
    thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', () => {
        mainImage.src = thumbnail.src;
      });
    });
  }
  
  // Flash message dismissal
  const dismissButtons = document.querySelectorAll('.alert .close');
  
  if (dismissButtons.length > 0) {
    dismissButtons.forEach(button => {
      button.addEventListener('click', () => {
        button.parentElement.style.display = 'none';
      });
    });
  }
  
  // Form validation for food creation/editing
  const foodForm = document.querySelector('.food-form');
  
  if (foodForm) {
    foodForm.addEventListener('submit', function(e) {
      const title = document.getElementById('title').value.trim();
      const description = document.getElementById('description').value.trim();
      const quantity = document.getElementById('quantity').value;
      const expiryDate = document.getElementById('expiryDate').value;
      
      let isValid = true;
      const errorMessages = [];
      
      if (!title) {
        errorMessages.push('Title is required');
        isValid = false;
      }
      
      if (!description) {
        errorMessages.push('Description is required');
        isValid = false;
      }
      
      if (!quantity || quantity < 1) {
        errorMessages.push('Quantity must be at least 1');
        isValid = false;
      }
      
      if (!expiryDate) {
        errorMessages.push('Expiry date is required');
        isValid = false;
      } else {
        const currentDate = new Date();
        const selectedDate = new Date(expiryDate);
        
        if (selectedDate < currentDate) {
          errorMessages.push('Expiry date cannot be in the past');
          isValid = false;
        }
      }
      
      if (!isValid) {
        e.preventDefault();
        
        // Display error messages
        const errorContainer = document.createElement('div');
        errorContainer.className = 'alert alert-danger';
        
        errorMessages.forEach(message => {
          const p = document.createElement('p');
          p.textContent = message;
          errorContainer.appendChild(p);
        });
        
        const existingError = document.querySelector('.alert.alert-danger');
        if (existingError) {
          existingError.remove();
        }
        
        foodForm.insertBefore(errorContainer, foodForm.firstChild);
        
        // Scroll to top of form
        window.scrollTo({
          top: foodForm.offsetTop - 20,
          behavior: 'smooth'
        });
      }
    });
  }
  
  // Dynamic form fields for availability times
  const addAvailabilityBtn = document.getElementById('add-availability');
  const availabilityContainer = document.getElementById('availability-container');
  
  if (addAvailabilityBtn && availabilityContainer) {
    addAvailabilityBtn.addEventListener('click', function() {
      const index = document.querySelectorAll('.availability-row').length;
      
      const availabilityRow = document.createElement('div');
      availabilityRow.className = 'availability-row form-group';
      
      availabilityRow.innerHTML = `
        <div class="row">
          <div class="col-md-4">
            <select name="availability" class="form-control" required>
              <option value="">Select Day</option>
              <option value="Monday|">Monday</option>
              <option value="Tuesday|">Tuesday</option>
              <option value="Wednesday|">Wednesday</option>
              <option value="Thursday|">Thursday</option>
              <option value="Friday|">Friday</option>
              <option value="Saturday|">Saturday</option>
              <option value="Sunday|">Sunday</option>
            </select>
          </div>
          <div class="col-md-3">
            <input type="time" class="form-control from-time" required>
          </div>
          <div class="col-md-3">
            <input type="time" class="form-control to-time" required>
          </div>
          <div class="col-md-2">
            <button type="button" class="btn btn-danger remove-availability">Remove</button>
          </div>
        </div>
      `;
      
      availabilityContainer.appendChild(availabilityRow);
      
      // Update time inputs to modify the hidden input value
      const updateAvailabilityValue = () => {
        const daySelect = availabilityRow.querySelector('select');
        const fromTime = availabilityRow.querySelector('.from-time').value;
        const toTime = availabilityRow.querySelector('.to-time').value;
        
        if (daySelect.value && fromTime && toTime) {
          const value = `${daySelect.value}${fromTime}-${toTime}`;
          daySelect.value = value;
        }
      };
      
      availabilityRow.querySelector('.from-time').addEventListener('change', updateAvailabilityValue);
      availabilityRow.querySelector('.to-time').addEventListener('change', updateAvailabilityValue);
      
      // Remove availability row
      availabilityRow.querySelector('.remove-availability').addEventListener('click', function() {
        availabilityRow.remove();
      });
    });
  }
  
  // Profile image preview
  const profileImageInput = document.getElementById('profileImage');
  const profileImagePreview = document.getElementById('imagePreview');
  
  if (profileImageInput && profileImagePreview) {
    profileImageInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
          profileImagePreview.src = e.target.result;
        };
        
        reader.readAsDataURL(this.files[0]);
      }
    });
  }
  
  // Food image preview
  const foodImageInput = document.getElementById('foodImages');
  const foodImagePreviewContainer = document.getElementById('imagePreviewContainer');
  
  if (foodImageInput && foodImagePreviewContainer) {
    foodImageInput.addEventListener('change', function() {
      foodImagePreviewContainer.innerHTML = '';
      
      if (this.files && this.files.length > 0) {
        for (let i = 0; i < this.files.length; i++) {
          const reader = new FileReader();
          const imagePreview = document.createElement('div');
          imagePreview.className = 'image-preview';
          
          reader.onload = function(e) {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
          };
          
          reader.readAsDataURL(this.files[i]);
          foodImagePreviewContainer.appendChild(imagePreview);
        }
      }
    });
  }
  
  // Mark notification as read
  const notifications = document.querySelectorAll('.notification-item');
  
  if (notifications.length > 0) {
    notifications.forEach(notification => {
      notification.addEventListener('click', function() {
        const notificationId = this.dataset.id;
        
        if (notificationId && this.classList.contains('unread')) {
          fetch(`/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              this.classList.remove('unread');
            }
          })
          .catch(error => console.error('Error marking notification as read:', error));
        }
      });
    });
  }
  
  // Confirmation dialogs
  const confirmActions = document.querySelectorAll('[data-confirm]');
  
  if (confirmActions.length > 0) {
    confirmActions.forEach(action => {
      action.addEventListener('click', function(e) {
        const message = this.dataset.confirm || 'Are you sure you want to perform this action?';
        
        if (!confirm(message)) {
          e.preventDefault();
        }
      });
    });
  }
});
