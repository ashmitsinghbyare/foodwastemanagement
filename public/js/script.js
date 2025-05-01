document.addEventListener("DOMContentLoaded", () => {
    const profileDropdown = document.getElementById('profileDropdown');
    profileDropdown.addEventListener('click', () => {
      profileDropdown.classList.toggle('show');
    });
  
    document.addEventListener('click', (e) => {
      if (!profileDropdown.contains(e.target)) {
        profileDropdown.classList.remove('show');
      }
    });
  
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('show');
    });
  
    const navbar = document.getElementById('navbar');
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      navbar.style.top = currentScroll > lastScrollTop ? "-80px" : "0";
      lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    });
  });
  