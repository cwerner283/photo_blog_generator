document.addEventListener('DOMContentLoaded', () => {
  // --- Quill Editor Instance ---
  let quill = null; // To be initialized after DOM is ready

  // --- Grab references to elements ---
  // Voice/Persona elements
  const voiceModeRadios = document.getElementsByName('voice_mode');
  const customVoiceInput = document.getElementById('customVoiceInput');
  const voiceAccordion = document.getElementById('voiceAccordion');
  const personaInput = document.getElementById('personaInput');

  // Main form elements
  const photoUpload = document.getElementById('photoUpload');
  const businessDescriptionInput = document.getElementById('businessDescription');
  const generateBlogBtn = document.getElementById('generateBlogBtn');
  const buttonText = document.getElementById('buttonText'); // For generate button text
  const buttonIcon = document.getElementById('buttonIcon'); // For generate button icon

  // Blog post display elements
  const blogPostContainer = document.getElementById('blogPostContainer');
  // const blogPostEditorDiv = document.getElementById('blogPostEditor'); // Quill initializes on this ID
  const blogPostTitle = document.getElementById('blogPostTitlePlaceholder'); // Title display

  // UI feedback elements
  const errorMessagesDiv = document.getElementById('errorMessages');
  const loadingIndicator = document.getElementById('loadingIndicator');

  // Debug elements
  const debugPromptPre = document.getElementById('debugPrompt');
  const debugPromptDetails = debugPromptPre ? debugPromptPre.closest('details') : null;

  // --- Initialize Quill Editor ---
  // Ensure the #blogPostEditor element exists in your HTML
  if (document.getElementById('blogPostEditor')) {
    quill = new Quill('#blogPostEditor', {
      theme: 'snow',
      placeholder: 'Your blog post will appear here...',
      modules: {
        toolbar: [ // Basic toolbar, customize as needed
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          ['link'], // Removed 'image' for simplicity unless image handling is implemented
          ['clean']
        ]
      }
    });
  } else {
    console.warn("Quill editor element '#blogPostEditor' not found. Editor functionality will be limited.");
  }


  // --- Voice UI toggle ---
  function updateVoiceUI() {
    if (!voiceModeRadios.length || !customVoiceInput || !voiceAccordion || !personaInput) return;
    const selectedModeRadio = Array.from(voiceModeRadios).find(r => r.checked);
    const mode = selectedModeRadio ? selectedModeRadio.value : 'default'; // Default if nothing selected

    if (customVoiceInput) customVoiceInput.disabled = (mode !== 'custom');
    if (voiceAccordion) voiceAccordion.classList.toggle('hidden', mode !== 'predefined');

    if (mode !== 'custom' && customVoiceInput && mode !== 'predefined') {
      // Clear custom voice input if not in custom mode and not in predefined (where it holds tone)
      // customVoiceInput.value = ''; // This line might be problematic if tone is set by predefined
    }
    if (mode !== 'predefined' && personaInput) {
      personaInput.value = ''; // Clear persona if not in predefined mode
    }
  }
  if (voiceModeRadios.length) {
    voiceModeRadios.forEach(r => r.addEventListener('change', updateVoiceUI));
    updateVoiceUI(); // Initial call
  }

  // --- Accordion toggles for voice profiles ---
  if (voiceAccordion) {
    const accordionButtons = voiceAccordion.querySelectorAll('button[aria-expanded][data-target]');
    accordionButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target; // Use dataset for data-* attributes
        const panel = document.getElementById(targetId);
        if (!panel) return;

        const isCurrentlyExpanded = btn.getAttribute('aria-expanded') === 'true';

        // Close all other panels
        accordionButtons.forEach(otherBtn => {
          if (otherBtn !== btn) {
            const otherPanel = document.getElementById(otherBtn.dataset.target);
            otherBtn.setAttribute('aria-expanded', 'false');
            if (otherPanel) otherPanel.classList.add('hidden');
            otherBtn.querySelector('.accordion-icon')?.classList.remove('rotate-180');
          }
        });

        // Toggle the clicked panel
        if (!isCurrentlyExpanded) {
          btn.setAttribute('aria-expanded', 'true');
          panel.classList.remove('hidden');
          btn.querySelector('.accordion-icon')?.classList.add('rotate-180');
        } else {
          // If it was already expanded, clicking again should close it.
          btn.setAttribute('aria-expanded', 'false');
          panel.classList.add('hidden');
          btn.querySelector('.accordion-icon')?.classList.remove('rotate-180');
        }
      });
    });
  }

  // --- Profile button selects for voice ---
  if (voiceAccordion) {
    const profileButtons = voiceAccordion.querySelectorAll('button[data-tone][data-persona]');
    profileButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (!customVoiceInput || !personaInput) return;
        customVoiceInput.value = btn.dataset.tone;
        personaInput.value = btn.dataset.persona;

        const predefinedRadio = document.querySelector('input[name="voice_mode"][value="predefined"]');
        if (predefinedRadio) predefinedRadio.checked = true;

        updateVoiceUI(); // Update UI to reflect predefined mode

        // Optionally close accordion (can be annoying if user misclicks)
        // voiceAccordion.querySelectorAll('button[aria-expanded="true"]').forEach(expandedBtn => {
        //   expandedBtn.click(); // Simulate click to toggle and close
        // });
      });
    });
  }

  // --- Generate Blog Post Handler ---
  if (generateBlogBtn) {
    generateBlogBtn.addEventListener('click', async () => {
      if (!photoUpload || !businessDescriptionInput || !customVoiceInput || !personaInput || !voiceModeRadios.length || !quill) {
        displayError('A required page element or the editor is not initialized. Cannot proceed.');
        return;
      }
      if (!photoUpload.files || photoUpload.files.length === 0) {
        displayError('Please select at least one photo to upload.');
        return;
      }

      const formData = new FormData();
      for (let file of photoUpload.files) { // More modern loop
        formData.append('photos', file);
      }
      formData.append('businessDescription', businessDescriptionInput.value);

      const selectedModeRadio = Array.from(voiceModeRadios).find(r => r.checked);
      const mode = selectedModeRadio ? selectedModeRadio.value : 'default';

      if (mode === 'custom') {
        formData.append('tone', customVoiceInput.value.trim());
        formData.append('persona', 'Custom');
      } else if (mode === 'predefined') {
        formData.append('tone', customVoiceInput.value.trim()); // Tone is set in customVoiceInput by profile buttons
        formData.append('persona', personaInput.value.trim());
      } else { // Default or "none"
        formData.append('tone', '');
        formData.append('persona', '');
      }

      // Reset UI
      if (blogPostContainer) blogPostContainer.classList.add('hidden');
      quill.setText(''); // Clear Quill editor
      if (blogPostTitle) blogPostTitle.textContent = 'Generated Blog Post:';
      if (errorMessagesDiv) {
        errorMessagesDiv.classList.add('hidden');
        errorMessagesDiv.innerHTML = '';
      }
      if (loadingIndicator) loadingIndicator.classList.remove('hidden');
      generateBlogBtn.disabled = true;
      if (buttonText) buttonText.textContent = 'Generating...';
      if (buttonIcon) buttonIcon.classList.add('animate-pulse');

      try {
        const response = await fetch('/generate-blog', { method: 'POST', body: formData });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || data.message || `Server error: ${response.status}`);
        }

        if (data.blog_post) {
          let content = data.blog_post;
          const titleMatch = content.match(/^#+\s*(.+)\n/m); // Match any H level for title
          if (titleMatch && titleMatch[1]) {
            if (blogPostTitle) blogPostTitle.textContent = titleMatch[1];
            content = content.substring(titleMatch[0].length).trim(); // Remove title from main content
          } else {
            if (blogPostTitle) blogPostTitle.textContent = 'Generated Blog Post';
          }

          // Use Quill's API to set content. dangerouslyPasteHTML is better if content is already HTML.
          // If parseMarkdown returns HTML, this is correct.
          const htmlContent = parseMarkdown(content);
          quill.root.innerHTML = htmlContent; // Paste HTML into Quill's editable area

          if (blogPostContainer) {
            blogPostContainer.classList.remove('hidden');
            // Update persona class
            blogPostContainer.className = blogPostContainer.className
              .replace(/persona-\S+/g, '') // Remove old persona classes
              .trim();
            if (data.persona) {
              blogPostContainer.classList.add('persona-' + data.persona.toLowerCase().replace(/\s+/g, '-'));
            }
          }
        } else {
          displayError('The AI did not return a blog post. Please try again.');
        }

        if (data.debug_prompt && debugPromptPre) {
          debugPromptPre.textContent = data.debug_prompt;
        }

      } catch (err) {
        console.error('Error generating blog post:', err);
        displayError(err.message);
      } finally {
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
        generateBlogBtn.disabled = false;
        if (buttonText) buttonText.textContent = 'Generate Blog Post';
        if (buttonIcon) buttonIcon.classList.remove('animate-pulse');
      }
    });
  }

  // --- Basic Markdown to HTML Converter ---
  // This is a simplified version. For robust conversion, a dedicated library is better.
  function parseMarkdown(md) {
    if (!md) return '';
    let html = md;

    // Headings (H1-H6)
    html = html.replace(/^######\s+(.*$)/gim, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.*$)/gim, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.*$)/gim, '<h1>$1</h1>');

    // Bold and Italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>'); // Bold + Italic
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');          // Bold
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');                      // Italic
    html = html.replace(/___(.*?)___/gim, '<strong><em>$1</em></strong>');   // Bold + Italic (underscore)
    html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');            // Bold (underscore)
    html = html.replace(/_(.*?)_/gim, '<em>$1</em>');                        // Italic (underscore)


    // Unordered Lists
    // Convert items first, then wrap the group. This handles multi-line items better.
    html = html.replace(/^\s*[-*+]\s+(.*(?:\n(?!\s*[-*+]\s+|\s*\d+\.\s+|\n|$).*)*)/gim, (match, content) => {
      return `<li>${content.trim().replace(/\n/gm, '<br>')}</li>`;
    });
    html = html.replace(/(<li>.*<\/li>\s*)+/gm, (match) => `<ul>\n${match.trim()}\n</ul>\n`);
    html = html.replace(/<ul>\s*<\/ul>\n?/gim, ''); // Clean up empty <ul>

    // Ordered Lists
    html = html.replace(/^\s*\d+\.\s+(.*(?:\n(?!\s*\d+\.\s+|\s*[-*+]\s+|\n|$).*)*)/gim, (match, content) => {
      return `<ol_li>${content.trim().replace(/\n/gm, '<br>')}</ol_li>`; // Temporary tag
    });
    html = html.replace(/(<ol_li>.*<\/ol_li>\s*)+/gm, (match) => {
      let items = '';
      match.replace(/<ol_li>(.*?)<\/ol_li>/g, (_liMatch, itemContent) => { items += `<li>${itemContent}</li>\n`; });
      return `<ol>\n${items.trim()}\n</ol>\n`;
    });
    html = html.replace(/<ol_li>/gim, '<li>').replace(/<\/ol_li>/gim, '</li>'); // Cleanup temp tags
    html = html.replace(/<ol>\s*<\/ol>\n?/gim, ''); // Clean up empty <ol>

    // Paragraphs and Line Breaks
    // Process paragraphs after block elements like lists and headings.
    // Split by double newlines to identify paragraphs.
    html = html.split(/\n\s*\n/).map(paragraph => {
      const trimmed = paragraph.trim();
      if (!trimmed) return '';
      // Avoid wrapping existing block elements in <p> tags
      if (/^<(ul|ol|li|h[1-6]|blockquote|hr|pre|table)/i.test(trimmed)) {
        return trimmed;
      }
      // For remaining text, wrap in <p> and convert single newlines to <br>
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    }).join('\n\n'); // Join paragraphs with double newlines for structure

    // Remove any leading/trailing newlines that might have been added
    html = html.trim();

    return html;
  }

  // --- Action Buttons: Copy and Download ---
  const copyBtn = document.getElementById('copyHtmlBtn'); // Match HTML button id
  const downloadBtn = document.getElementById('downloadHtmlBtn'); // Match HTML button id

  if (copyBtn && quill) {
    copyBtn.addEventListener('click', () => {
      const htmlContent = quill.root.innerHTML; // Get HTML from Quill
      navigator.clipboard.writeText(htmlContent)
        .then(() => {
          alert('Blog post HTML copied to clipboard!'); // User-provided script uses alert
        })
        .catch(err => {
          console.error('Failed to copy HTML: ', err);
          alert('Copy failed. See console for details.');
        });
    });
  }

  if (downloadBtn && quill) {
    downloadBtn.addEventListener('click', () => {
      const htmlContent = quill.root.innerHTML; // Get HTML from Quill
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const titleText = blogPostTitle ? (blogPostTitle.textContent || 'blog-post') : 'blog-post';
      link.download = `${titleText.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
      document.body.appendChild(link); // Required for Firefox
      link.click();
      document.body.removeChild(link); // Clean up
      URL.revokeObjectURL(link.href); // Free up memory
    });
  }

  // --- Helper Function: Display Error ---
  function displayError(msg) {
    if (errorMessagesDiv) {
      errorMessagesDiv.innerHTML = `<p class="font-medium">Error:</p><p>${msg}</p>`; // Consistent with previous error display
      errorMessagesDiv.classList.remove('hidden');
    }
    if (blogPostContainer) blogPostContainer.classList.add('hidden'); // Hide results on error
  }
});
