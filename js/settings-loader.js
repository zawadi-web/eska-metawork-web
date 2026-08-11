/**
 * ESKA Metalworks – settings-loader.js
 * Automatically updates contact details across the site from data/settings.json
 */
(function() {
  'use strict';

  async function loadSettings() {
    try {
      const response = await fetch('data/settings.json?v=' + new Date().getTime());
      if (!response.ok) return;
      
      const settings = await response.json();
      
      // 1. Update Links (href only)
      document.querySelectorAll('.contact-email-link').forEach(el => el.href = 'mailto:' + settings.email);
      document.querySelectorAll('.contact-phone-link').forEach(el => el.href = settings.phone_link);
      document.querySelectorAll('.contact-whatsapp-link').forEach(el => {
        let text = "Hello ESKA Metalworks, I would like to inquire about your metal fabrication services.";
        
        // Customize text based on the current page to identify customer intent
        const path = window.location.pathname.toLowerCase();
        if (path.includes('services')) {
          text = "Hello, I am visiting your Services page and would like to inquire about your steel fabrication services.";
        } else if (path.includes('projects')) {
          text = "Hello, I saw your portfolio gallery and would like to inquire about some of your metalwork projects.";
        } else if (path.includes('quote')) {
          text = "Hello, I would like to request a custom quote for a metal fabrication project.";
        } else if (path.includes('about')) {
          text = "Hello, I read about ESKA Metalworks and would like to inquire about your services.";
        }
        
        el.href = settings.whatsapp_link + '?text=' + encodeURIComponent(text);
      });

      // 2. Update Text (textContent only)
      document.querySelectorAll('.contact-email-text').forEach(el => el.textContent = settings.email);
      document.querySelectorAll('.contact-phone-text').forEach(el => el.textContent = settings.phone);

    } catch (error) {
      console.warn('Settings loader skipped:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSettings);
  } else {
    loadSettings();
  }
})();
