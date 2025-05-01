document.addEventListener("DOMContentLoaded", function () {
    // Personal Info Form Validation
    const personalInfoForm = document.getElementById("personalInfoForm");
    personalInfoForm.addEventListener("submit", function (event) {
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      
      if (!name || !email) {
        alert("Name and email are required!");
        event.preventDefault(); // Prevent form submission
      }
    });
  
    // Password Change Form Validation
    const changePasswordForm = document.getElementById("changePasswordForm");
    changePasswordForm.addEventListener("submit", function (event) {
      const currentPassword = document.getElementById("currentPassword").value.trim();
      const newPassword = document.getElementById("newPassword").value.trim();
      const confirmPassword = document.getElementById("confirmPassword").value.trim();
  
      if (newPassword !== confirmPassword) {
        alert("New password and confirmation do not match.");
        event.preventDefault(); // Prevent form submission
      }
  
      if (!currentPassword || !newPassword || !confirmPassword) {
        alert("All password fields are required!");
        event.preventDefault();
      }
    });
  
    // Delete Account Confirmation
    window.confirmDelete = function () {
      return confirm("Are you sure you want to delete your account? This cannot be undone.");
    };
  });
  