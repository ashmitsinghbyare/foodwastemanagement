document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('locationForm').addEventListener('submit', function (event) {
    event.preventDefault();
  const location = document.getElementById('location').value;

  fetch(`/admin/donations?location=${location}`)
    .then(response => response.json())
    .then(data => {
      const resultsDiv = document.getElementById('results');
      resultsDiv.innerHTML = '';

      if (data.length > 0) {
        let table = `<table>
            <tr>
                <th>Category</th>
                <th>Phone</th>
                <th>Date</th>
                <th>Address</th>
                <th>Quantity</th>
            </tr>`;

       /* data.forEach(donation => {
          table += `<tr>
              <td>${donation.category}</td>
              <td>${donation.phone}</td>
              <td>${new Date(donation.datetime).toLocaleString()}</td>
              <td>${donation.address}</td>
              <td>${donation.quantity}</td>
          </tr>`;
        });*/
        data.forEach(donation => {
          table += `<tr>
              <td>${donation.category}</td>
              <td>${donation.phone || donation.phoneno || 'N/A'}</td>
              <td>${donation.pickupTime 
                    ? new Date(donation.pickupTime).toLocaleString() 
                    : new Date(donation.createdAt).toLocaleString()}</td>
              <td>${donation.address || 'N/A'}</td>
              <td>${donation.quantity || donation.amount || 'N/A'}</td>
          </tr>`;
        });
        

        table += '</table>';
        resultsDiv.innerHTML = table;
      } else {
        resultsDiv.innerHTML = '<p>No donations found for this location.</p>';
      }
    })
    .catch(error => {
      console.error('Error fetching donation details:', error);
      alert('An error occurred while fetching the data.');
    });
});
});

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('darkModeToggle');
  const themeIcon = document.getElementById('theme-icon');
  const switchElement = document.querySelector('.switch');

  // Apply saved theme
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    themeIcon.classList.remove('uil-moon');
    themeIcon.classList.add('uil-sun');
    switchElement.style.backgroundColor = "#06C167";  // Dark mode on

  }

  toggle.addEventListener('click', (e) => {
    e.preventDefault(); // prevent page reload
    document.body.classList.toggle('dark-mode');

    // Toggle icon
    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('darkMode', 'enabled');
      themeIcon.classList.remove('uil-moon');
      themeIcon.classList.add('uil-sun');
      switchElement.style.backgroundColor = "#0b3cc1";  // Dark mode on
    } else {
      localStorage.setItem('darkMode', 'disabled');
      themeIcon.classList.remove('uil-sun');
      themeIcon.classList.add('uil-moon');
      switchElement.style.backgroundColor = "#ccc";
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector("nav");
  const toggleBtn = document.querySelector(".sidebar-toggle");

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("close");

    // Optional: save state to localStorage
    if (sidebar.classList.contains("close")) {
      localStorage.setItem("sidebar", "collapsed");
    } else {
      localStorage.setItem("sidebar", "expanded");
    }
  });

  // On page load, restore sidebar state
  if (localStorage.getItem("sidebar") === "collapsed") {
    sidebar.classList.add("close");
  }
});
