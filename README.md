# Image Upload Guide

## Supported Image Types:
- Profile Pictures: JPG, PNG, GIF (max 5MB)
- Certificates: JPG, PNG, PDF (max 10MB)
- Project Images: JPG, PNG (max 8MB)

## Folder Structure for Images:



// Form submission
document.getElementById('education-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const educationData = {
        degree: document.getElementById('edu-degree').value,
        institution: document.getElementById('edu-institution').value,
        startDate: document.getElementById('edu-start-date').value,
        endDate: currentCheckbox.checked ? null : document.getElementById('edu-end-date').value,
        current: currentCheckbox.checked,
        description: document.getElementById('edu-description').value
    };
    
    if (education) {
        portfolioData.updateEducation(education.id, educationData);
    } else {
        portfolioData.addEducation(educationData);
    }
    
    // ADD THIS LINE - Trigger homepage update
    triggerHomepageUpdate();
    
    modal.remove();
    loadEducationSection(document.getElementById('education-section'));
});