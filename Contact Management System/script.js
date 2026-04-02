// DOM elements
const nameInput = document.getElementById('nameInput');
const phoneInput = document.getElementById('phoneInput');
const addBtn = document.getElementById('addBtn');
const searchInput = document.getElementById('searchInput');
const contactsList = document.getElementById('contactsList');
const darkModeToggle = document.getElementById('darkModeToggle');

// Load contacts from localStorage
let contacts = JSON.parse(localStorage.getItem('contacts')) || [];

// Dark mode state
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// Initialize app
function init() {
    renderContacts();
    updateDarkMode();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    addBtn.addEventListener('click', addContact);
    searchInput.addEventListener('input', filterContacts);
    darkModeToggle.addEventListener('click', toggleDarkMode);

    // Enter key support for adding contacts
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') phoneInput.focus();
    });
    phoneInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addContact();
    });
}

// Add new contact
function addContact() {
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name || !phone) {
        alert('Please enter both name and phone number');
        return;
    }

    // Check for duplicate phone numbers
    if (contacts.some(contact => contact.phone === phone)) {
        alert('A contact with this phone number already exists');
        return;
    }

    const newContact = {
        id: Date.now(),
        name: name,
        phone: phone
    };

    contacts.push(newContact);
    saveContacts();
    renderContacts();
    clearInputs();

    // Show success message
    showMessage('Contact added successfully!', 'success');
}

// Delete contact
function deleteContact(id) {
    if (confirm('Are you sure you want to delete this contact?')) {
        contacts = contacts.filter(contact => contact.id !== id);
        saveContacts();
        renderContacts();
        showMessage('Contact deleted successfully!', 'success');
    }
}

// Edit contact
function editContact(id) {
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;

    const newName = prompt('Enter new name:', contact.name);
    const newPhone = prompt('Enter new phone number:', contact.phone);

    if (newName && newPhone) {
        // Check for duplicate phone numbers (excluding current contact)
        if (contacts.some(c => c.phone === newPhone && c.id !== id)) {
            alert('A contact with this phone number already exists');
            return;
        }

        contact.name = newName.trim();
        contact.phone = newPhone.trim();
        saveContacts();
        renderContacts();
        showMessage('Contact updated successfully!', 'success');
    }
}

// Filter contacts based on search input
function filterContacts() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm) ||
        contact.phone.includes(searchTerm)
    );
    renderContacts(filteredContacts);
}

// Render contacts
function renderContacts(contactsToRender = contacts) {
    contactsList.innerHTML = '';

    if (contactsToRender.length === 0) {
        contactsList.innerHTML = `
            <div class="contact-item" style="justify-content: center; text-align: center; color: #718096;">
                <p>No contacts found</p>
            </div>
        `;
        return;
    }

    contactsToRender.forEach(contact => {
        const contactItem = document.createElement('div');
        contactItem.className = 'contact-item';
        contactItem.innerHTML = `
            <div class="contact-info">
                <div class="contact-name">${contact.name}</div>
                <div class="contact-phone">
                    <i class="fas fa-phone"></i>
                    ${contact.phone}
                </div>
            </div>
            <div class="contact-actions">
                <button class="btn edit-btn" onclick="editContact(${contact.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn delete-btn" onclick="deleteContact(${contact.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        contactsList.appendChild(contactItem);
    });
}

// Clear input fields
function clearInputs() {
    nameInput.value = '';
    phoneInput.value = '';
    nameInput.focus();
}

// Save contacts to localStorage
function saveContacts() {
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

// Toggle dark mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', isDarkMode);
    updateDarkMode();
}

// Update dark mode styles
function updateDarkMode() {
    document.body.classList.toggle('dark-mode', isDarkMode);
    darkModeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// Show message (success/error)
function showMessage(message, type) {
    // Simple implementation - you could enhance this with a proper toast notification
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#48bb78' : '#f56565'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => document.body.removeChild(messageDiv), 300);
    }, 3000);
}

// Add CSS animations for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the app
init();