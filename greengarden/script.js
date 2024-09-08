  
// Function to fetch options from the endpoint and populate dropdowns
function fetchOptionsAndPopulateDropdowns(dropdown) {
  const cachedData = localStorage.getItem('dropdownOptions');
  const cachedTimestamp = localStorage.getItem('dropdownOptionsTimestamp');
  const currentTime = new Date().getTime();
  
  if (cachedData && cachedTimestamp) {
    // Use cached data if available and not expired (e.g., less than 1 hour old)
    const options = JSON.parse(cachedData);
    const timestampDiff = currentTime - parseInt(cachedTimestamp);
    if (timestampDiff < 3600000) { // 1 hour in milliseconds
      populateDropdown(options, dropdown);
      return;
    }
  }
  // Fetch fresh data from the endpoint if cached data is not available or expired
  fetch('https://script.google.com/macros/s/AKfycbybQ8GjDOkSPbUbg7zN5Q1TbUTc-5kPwdXHxm483C4BSHWE3GkCkNEy9vX5goJXxFL6/exec')
    .then(response => response.json())
    .then(data => {
      console.log(data);
      const options = data.content.map(item => item[0]);
      // Cache the fetched data locally along with the current timestamp
      localStorage.setItem('dropdownOptions', JSON.stringify(options));
      localStorage.setItem('dropdownOptionsTimestamp', currentTime.toString());
      populateDropdown(options, dropdown);
    })
    .catch(error => {
      console.error('Error fetching options:', error);
    });
}

// Function to populate dropdown with options
function populateDropdown(options, dropdown) {
  dropdown.innerHTML = '';
  options.forEach(option => {
    const optionElem = document.createElement('option');
    optionElem.value = option;
    optionElem.textContent = option;
    dropdown.appendChild(optionElem);
  });
}

// Fetch options and populate dropdowns when the page loads
document.addEventListener("DOMContentLoaded", function() {
  const dropdown = document.querySelector('select[name="options[]"]');
  fetchOptionsAndPopulateDropdowns(dropdown);
});

// Event listener to add a new dropdown
document.getElementById("addDropdown").addEventListener("click", function() {
  var dropdownContainer = document.getElementById("dropdownContainer");
  var newDropdown = document.createElement("div");
  newDropdown.classList.add("dropdown-container");
  newDropdown.innerHTML = `
    <select name="options[]">
      <!-- Options will be fetched dynamically from the endpoint -->
    </select>
    <input type="number" name="numeric[]" placeholder="Production">
    <input type="number" name="numeric[]" placeholder="Dispatch">
    <button type="button" class="delete-btn" onclick="deleteDropdown(this)">X</button>`;
  dropdownContainer.appendChild(newDropdown);
  
  // Populate the new dropdown with options
  const newDropdownSelect = newDropdown.querySelector('select[name="options[]"]');
  fetchOptionsAndPopulateDropdowns(newDropdownSelect);
});

// Function to delete a dropdown
function deleteDropdown(btn) {
  btn.parentNode.remove();
}

// Event listener to handle form submission
document.getElementById("submitBtn").addEventListener("click", function() {
  const form = document.getElementById("dropdownForm");
  const formData = new FormData(form);
  console.log(formData);  
  
  // Create a new jsPDF instance
  const doc = new jsPDF();

  // Get PDF dimensions
  const pdfWidth = doc.internal.pageSize.getWidth();
  const pdfHeight = doc.internal.pageSize.getHeight();
  

  var defaultColor = 0;
  var defaultFont = "helvetica"

  // Set font style to bold and color to red
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 0, 0); // Red color (RGB)
  doc.setFontSize(18);

  // Add title
  doc.setFontSize(16);
  const title = 'Daily Production and Dispatch Record';
  const titleWidth = doc.getStringUnitWidth(title) * doc.internal.getFontSize() / doc.internal.scaleFactor;
  const titleX = (pdfWidth - titleWidth) / 2;
  doc.text(titleX, 22, title);

   // Set font style to bold and color to red
   doc.setFont("helvetica", "normal");
   doc.setTextColor(255, 0, 0); // Red color (RGB)
   doc.setFontSize(12);

  // Add date, day, and time
const currentDate = new Date();
const dateString = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
const dayString = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
const timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true }; // Specify hour12: true to use AM/PM format
const timeString = currentDate.toLocaleTimeString('en-US', timeOptions);
const dateTime = `${dateString} | ${dayString} | ${timeString}`;
const dateTimeWidth = doc.getStringUnitWidth(dateTime) * doc.internal.getFontSize() / doc.internal.scaleFactor;
const dateTimeX = (pdfWidth - dateTimeWidth) / 2;
doc.text(dateTimeX, 30, dateTime);

  
   // Set font style to bold and color to red
   doc.setFont("helvetica", "bold");
   doc.setTextColor(0,0,255); // Blue color (RGB)
   doc.setFontSize(15);

  // Add heading
  doc.text("ITEMS", 10, 50);
  doc.text("PRODUCED", 60, 50);
  doc.text("DISPATCHED", 110, 50);

    // Reset font style and color to default
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0); // Black color
    doc.setFontSize(16);  


  // Loop through form data and add to PDF
  let yPos = 60;
  let xPos = 10
  var h = 0;
  var v = 0;
  formData.forEach((value, key) => {
    // Adjust the key if needed to match the desired format
    key = key.replace('[]', ''); // Remove the square brackets
    
    doc.text(xPos, yPos, `${value}`);
    xPos += 50
      
    h+=1;
    if (h%3==0){
      doc.line(10, yPos + 2, 150, yPos + 2); // Vertical line between each row
      yPos += 10;
      xPos = 10
    }
  });

  doc.line(55, 45, 55, yPos); // Vertical line between ITEMS and PRODUCED
  doc.line(105, 45, 105, yPos); // Vertical line between PRODUCED and DISPATCHED


  // Save PDF
  doc.save("form_data.pdf");
  document.getElementById("dropdownForm").reset();
});

  window.addEventListener("load", function() {
    const form = document.getElementById('update_form');
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      const data = new FormData(form);
      const action = e.target.action;
      fetch(action, {
        method: 'POST',
        body: data,
      })
      .then(() => {
        alert("Success!");
      })
    });
  });
