// ===== Utility Functions =====

function getTimestamp() {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
}

function addLog(message, type = 'info') {
    const logsContent = document.getElementById('logs-content');
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;

    logEntry.innerHTML = `
    <span class="log-time">[${getTimestamp()}]</span>
    <span class="log-message">${message}</span>
  `;

    logsContent.appendChild(logEntry);
    logsContent.scrollTop = logsContent.scrollHeight;
}

function setStatus(message) {
    document.getElementById('status-text').textContent = message;
}

function showElement(elementId) {
    document.getElementById(elementId).style.display = 'block';
}

function hideElement(elementId) {
    document.getElementById(elementId).style.display = 'none';
}

// ===== Tab Navigation =====

const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.dataset.tab;

        // Update active states
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        button.classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');

        addLog(`Switched to ${tabName === 'apply' ? 'Create Project' : 'Extract Structure'} mode`);
    });
});

// ===== Logs Panel Toggle =====

const logsToggleBtn = document.getElementById('logs-toggle-btn');
const logsContent = document.getElementById('logs-content');

logsToggleBtn.addEventListener('click', () => {
    logsContent.classList.toggle('collapsed');
    logsToggleBtn.textContent = logsContent.classList.contains('collapsed') ? '▲' : '▼';
});

// ===== Check mkarchi Installation =====

async function checkMkarchiInstallation() {
    addLog('Checking mkarchi installation...');
    const result = await window.electronAPI.checkMkarchiInstalled();

    const statusElement = document.getElementById('mkarchi-status');

    if (result.installed) {
        statusElement.textContent = `mkarchi ${result.version} installed ✓`;
        statusElement.className = 'installed';
        addLog(`mkarchi ${result.version} detected`, 'success');
    } else {
        statusElement.textContent = 'mkarchi not installed ✗';
        statusElement.className = 'not-installed';
        addLog('mkarchi is not installed. Please install it first.', 'error');

        // Show installation prompt
        const install = confirm(
            'mkarchi CLI is not installed.\n\n' +
            'This application requires mkarchi to be installed.\n' +
            'Would you like to open the installation guide?'
        );

        if (install) {
            await window.electronAPI.openExternal('https://mkarchi.vercel.app/learn/0.1.7#installation');
        }
    }
}

// Check on startup
checkMkarchiInstallation();

// ===== Apply Mode (Create Project) =====

const applyDestinationInput = document.getElementById('apply-destination');
const applyBrowseBtn = document.getElementById('apply-browse-btn');
const applyTreeTextarea = document.getElementById('apply-tree');
const applyPreviewToggle = document.getElementById('apply-preview-toggle');
const applyPreviewSection = document.getElementById('apply-preview');
const applyPreviewContent = document.getElementById('apply-preview-content');
const applyGenerateBtn = document.getElementById('apply-generate-btn');

// Browse for destination folder
applyBrowseBtn.addEventListener('click', async () => {
    const folder = await window.electronAPI.selectFolder();
    if (folder) {
        applyDestinationInput.value = folder;
        addLog(`Selected destination: ${folder}`);
    }
});

// Preview toggle
applyPreviewToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
        showElement('apply-preview');
        updatePreview();
    } else {
        hideElement('apply-preview');
    }
});

// Update preview when tree content changes
applyTreeTextarea.addEventListener('input', () => {
    if (applyPreviewToggle.checked) {
        updatePreview();
    }
});

function updatePreview() {
    const tree = applyTreeTextarea.value.trim();
    if (tree) {
        applyPreviewContent.textContent = `Preview:\n\n${tree}\n\n(This is what will be generated)`;
    } else {
        applyPreviewContent.textContent = 'Enter an architecture tree to see preview...';
    }
}

// Generate project
applyGenerateBtn.addEventListener('click', async () => {
    const destination = applyDestinationInput.value.trim();
    const tree = applyTreeTextarea.value.trim();

    // Validation
    if (!destination) {
        alert('Please select a destination folder');
        addLog('Error: No destination folder selected', 'error');
        return;
    }

    if (!tree) {
        alert('Please enter an architecture tree');
        addLog('Error: No architecture tree provided', 'error');
        return;
    }

    // Disable button during execution
    applyGenerateBtn.disabled = true;
    applyGenerateBtn.innerHTML = '<span class="btn-icon">⏳</span> Generating...';
    setStatus('Generating project...');
    addLog('Starting project generation...', 'info');

    try {
        const result = await window.electronAPI.executeApply(tree, destination);

        if (result.success) {
            addLog('Project generated successfully!', 'success');
            addLog(result.output, 'success');
            setStatus('Project created successfully');
            alert('Project created successfully!\n\nCheck the destination folder.');

            // Clear inputs
            applyTreeTextarea.value = '';
            applyDestinationInput.value = '';
            hideElement('apply-preview');
            applyPreviewToggle.checked = false;
        } else {
            addLog('Failed to generate project', 'error');
            addLog(`Error: ${result.error}`, 'error');
            setStatus('Generation failed');
            alert(`Failed to generate project:\n\n${result.error}`);
        }
    } catch (error) {
        addLog(`Unexpected error: ${error.message}`, 'error');
        setStatus('Error occurred');
        alert(`An error occurred:\n\n${error.message}`);
    } finally {
        // Re-enable button
        applyGenerateBtn.disabled = false;
        applyGenerateBtn.innerHTML = '<span class="btn-icon">⚡</span> Generate Project';
    }
});

// ===== Give Mode (Extract Structure) =====

const giveSourceInput = document.getElementById('give-source');
const giveBrowseBtn = document.getElementById('give-browse-btn');
const giveIncludeContentCheckbox = document.getElementById('give-include-content');
const giveNoIgnoreCheckbox = document.getElementById('give-no-ignore');
const giveMaxDepthInput = document.getElementById('give-max-depth');
const giveMaxSizeInput = document.getElementById('give-max-size');
const giveNoMaxCheckbox = document.getElementById('give-no-max');
const giveIgnorePatternsInput = document.getElementById('give-ignore-patterns');
const giveExtractBtn = document.getElementById('give-extract-btn');
const giveOutputSection = document.getElementById('give-output-section');
const giveOutputTextarea = document.getElementById('give-output');
const giveCopyBtn = document.getElementById('give-copy-btn');
const giveExportBtn = document.getElementById('give-export-btn');

// Browse for source folder
giveBrowseBtn.addEventListener('click', async () => {
    const folder = await window.electronAPI.selectFolder();
    if (folder) {
        giveSourceInput.value = folder;
        addLog(`Selected source: ${folder}`);
    }
});

// No-max checkbox disables max size input
giveNoMaxCheckbox.addEventListener('change', (e) => {
    giveMaxSizeInput.disabled = e.target.checked;
    if (e.target.checked) {
        giveMaxSizeInput.value = '';
    }
});

// Extract structure
giveExtractBtn.addEventListener('click', async () => {
    const sourcePath = giveSourceInput.value.trim();

    // Validation
    if (!sourcePath) {
        alert('Please select a source project folder');
        addLog('Error: No source folder selected', 'error');
        return;
    }

    // Build options
    const options = {
        includeContent: giveIncludeContentCheckbox.checked,
        noIgnore: giveNoIgnoreCheckbox.checked,
        noMax: giveNoMaxCheckbox.checked,
        maxDepth: parseInt(giveMaxDepthInput.value) || 0,
        maxSize: parseInt(giveMaxSizeInput.value) || 0,
        ignorePatterns: giveIgnorePatternsInput.value.trim()
    };

    // Disable button during execution
    giveExtractBtn.disabled = true;
    giveExtractBtn.innerHTML = '<span class="btn-icon">⏳</span> Extracting...';
    setStatus('Extracting structure...');
    addLog('Starting structure extraction...', 'info');

    try {
        const result = await window.electronAPI.executeGive(sourcePath, options);

        if (result.success) {
            addLog('Structure extracted successfully!', 'success');
            setStatus('Extraction complete');

            // Display output
            giveOutputTextarea.value = result.output;
            showElement('give-output-section');

            // Scroll to output
            giveOutputSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            addLog('Failed to extract structure', 'error');
            addLog(`Error: ${result.error}`, 'error');
            setStatus('Extraction failed');
            alert(`Failed to extract structure:\n\n${result.error}`);
        }
    } catch (error) {
        addLog(`Unexpected error: ${error.message}`, 'error');
        setStatus('Error occurred');
        alert(`An error occurred:\n\n${error.message}`);
    } finally {
        // Re-enable button
        giveExtractBtn.disabled = false;
        giveExtractBtn.innerHTML = '<span class="btn-icon">🔍</span> Extract Structure';
    }
});

// Copy to clipboard
giveCopyBtn.addEventListener('click', async () => {
    const output = giveOutputTextarea.value;

    if (!output) {
        alert('No output to copy');
        return;
    }

    const result = await window.electronAPI.copyToClipboard(output);

    if (result.success) {
        addLog('Copied to clipboard', 'success');
        giveCopyBtn.innerHTML = '✓ Copied!';
        setTimeout(() => {
            giveCopyBtn.innerHTML = '📋 Copy';
        }, 2000);
    } else {
        addLog('Failed to copy to clipboard', 'error');
        alert('Failed to copy to clipboard');
    }
});

// Export to file
giveExportBtn.addEventListener('click', async () => {
    const output = giveOutputTextarea.value;

    if (!output) {
        alert('No output to export');
        return;
    }

    const result = await window.electronAPI.saveToFile(output, 'mkarchi-structure.txt');

    if (result.success) {
        addLog(`Exported to: ${result.path}`, 'success');
        alert(`Structure exported successfully to:\n${result.path}`);
    } else {
        addLog('Failed to export file', 'error');
        alert('Failed to export file');
    }
});

// ===== Keyboard Shortcuts =====

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + 1: Switch to Apply mode
    if ((e.ctrlKey || e.metaKey) && e.key === '1') {
        e.preventDefault();
        tabButtons[0].click();
    }

    // Ctrl/Cmd + 2: Switch to Give mode
    if ((e.ctrlKey || e.metaKey) && e.key === '2') {
        e.preventDefault();
        tabButtons[1].click();
    }

    // Ctrl/Cmd + L: Toggle logs
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        logsToggleBtn.click();
    }
});

// ===== Initial Setup =====

addLog('Welcome to mkarchi Desktop!', 'info');
setStatus('Ready');