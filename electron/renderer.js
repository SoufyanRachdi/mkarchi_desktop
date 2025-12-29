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

/**
 * Simple version comparison (e.g. "0.1.7" vs "0.1.6")
 * Returns -1 if v1 < v2, 0 if v1 == v2, 1 if v1 > v2
 */
function compareVersions(v1, v2) {
    if (!v1 || !v2) return 0;
    const parts1 = v1.match(/(\d+)/g)?.map(Number) || [];
    const parts2 = v2.match(/(\d+)/g)?.map(Number) || [];
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;
        if (p1 < p2) return -1;
        if (p1 > p2) return 1;
    }
    return 0;
}

let currentMkarchiVersion = null;

async function checkMkarchiInstallation() {
    addLog('Checking mkarchi installation...');
    const result = await window.electronAPI.checkMkarchiInstalled();

    const statusElement = document.getElementById('mkarchi-status');
    const maxSizeGroup = document.getElementById('option-max-size-group');
    const noMaxGroup = document.getElementById('option-no-max-group');

    if (result.installed) {
        currentMkarchiVersion = result.version;
        statusElement.textContent = `mkarchi ${result.version} installed ✓`;
        statusElement.className = 'installed';
        addLog(`mkarchi ${result.version} detected`, 'success');

        // Sync version with Main process for the menu
        window.electronAPI.syncVersion(result.version);

        // Check if upgrade is needed (< 0.1.6)
        if (compareVersions(result.version, '0.1.6') < 0) {
            const upgrade = confirm(
                `A new version of mkarchi is required.\n\n` +
                `Current: ${result.version}\n` +
                `Required: 0.1.6 or higher\n\n` +
                `Would you like to upgrade automatically?`
            );
            if (upgrade) {
                await performAutoInstallation(true);
            }
        }

        // Feature Toggling: Max size features only in 0.1.7+
        if (compareVersions(result.version, '0.1.7') < 0) {
            maxSizeGroup.style.display = 'none';
            noMaxGroup.style.display = 'none';
        } else {
            maxSizeGroup.style.display = 'block';
            noMaxGroup.style.display = 'flex';
        }

    } else {
        statusElement.textContent = 'mkarchi not installed ✗';
        statusElement.className = 'not-installed';
        addLog('mkarchi is not installed. You can open the guide or install it automatically.', 'error');
        await performAutoInstallation();
    }
}

async function performAutoInstallation(isUpgrade = false) {
    // Prefer native 3-button prompt if available via IPC
    if (window.electronAPI &&
        typeof window.electronAPI.promptInstallMkarchi === 'function' &&
        typeof window.electronAPI.installMkarchi === 'function') {

        const promptRes = await window.electronAPI.promptInstallMkarchi();
        // Buttons: ['Annuler', 'OK', 'Auto'] -> 0, 1, 2
        if (promptRes && promptRes.response === 1) {
            await window.electronAPI.openExternal('https://mkarchi.vercel.app/learn/0.1.7#installation');
        } else if (promptRes && promptRes.response === 2) {
            try {
                const action = isUpgrade ? 'Upgrading' : 'Installing';
                setStatus(`${action} mkarchi via pip...`);
                addLog(`Attempting to ${action.toLowerCase()} mkarchi automatically (pip)...`, 'info');

                const installRes = await window.electronAPI.installMkarchi();
                if (installRes && installRes.success) {
                    addLog(`mkarchi ${isUpgrade ? 'upgraded' : 'installed'} successfully. Re-checking...`, 'success');
                    if (installRes.output) addLog(installRes.output, 'info');
                    await checkMkarchiInstallation();
                } else {
                    addLog(`Automatic ${action.toLowerCase()} failed.`, 'error');
                    if (installRes && installRes.output) addLog(installRes.output, 'error');
                    alert(`Automatic ${action.toLowerCase()} failed. Opening installation guide.`);
                    await window.electronAPI.openExternal('https://mkarchi.vercel.app/learn/0.1.7#installation');
                }
            } catch (e) {
                addLog(`Automatic installation error: ${e.message}`, 'error');
                alert('Automatic installation encountered an error. Opening installation guide.');
                await window.electronAPI.openExternal('https://mkarchi.vercel.app/learn/0.1.7#installation');
            } finally {
                setStatus('Ready');
            }
        } else {
            addLog('Installation cancelled by user.', 'info');
        }
    } else {
        // Fallback to simple confirm if IPC prompt not available
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
const giveAutoCopyCheckbox = document.getElementById('give-auto-copy');
const giveDeleteAfterCheckbox = document.getElementById('give-delete-after');
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
        maxDepth: parseInt(giveMaxDepthInput.value) || 0
    };

    // 0.1.7+ features
    if (currentMkarchiVersion && compareVersions(currentMkarchiVersion, '0.1.7') >= 0) {
        options.noMax = giveNoMaxCheckbox.checked;
        options.maxSize = parseInt(giveMaxSizeInput.value) || 0;
    }

    // New features: Delete after
    options.deleteAfter = giveDeleteAfterCheckbox.checked;

    // Disable button during execution

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

            // Auto-copy if enabled
            if (giveAutoCopyCheckbox.checked) {
                giveCopyBtn.click();
            }
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
        addLog('Copied structure to clipboard', 'success');

        // Visual feedback
        const toast = document.getElementById('copy-toast');
        toast.classList.add('show');

        const originalHtml = giveCopyBtn.innerHTML;
        giveCopyBtn.innerHTML = '<span class="btn-icon">✓</span> Copied!';
        giveCopyBtn.classList.add('success');

        setTimeout(() => {
            toast.classList.remove('show');
            giveCopyBtn.innerHTML = '<span class="btn-icon">📋</span> Copy Architecture';
            giveCopyBtn.classList.remove('success');
        }, 2500);
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