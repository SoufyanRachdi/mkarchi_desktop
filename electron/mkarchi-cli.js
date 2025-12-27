const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

/**
 * Check if mkarchi CLI is installed
 * @returns {Promise<{installed: boolean, version: string|null, error: string|null}>}
 */
async function checkInstallation() {
  return new Promise((resolve) => {
    exec('mkarchi --version', (error, stdout, stderr) => {
      if (error) {
        resolve({
          installed: false,
          version: null,
          error: 'mkarchi is not installed or not in PATH'
        });
        return;
      }

      const version = stdout.trim();
      resolve({
        installed: true,
        version: version,
        error: null
      });
    });
  });
}

/**
 * Execute mkarchi apply command
 * @param {string} treeContent - The architecture tree content
 * @param {string} destination - Destination folder path
 * @returns {Promise<{success: boolean, output: string, error: string|null}>}
 */
async function executeApply(treeContent, destination) {
  try {
    // Create temporary tree file
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `mkarchi-tree-${Date.now()}.txt`);

    await fs.writeFile(tempFile, treeContent, 'utf8');

    return new Promise((resolve) => {
      const command = `mkarchi apply "${tempFile}"`;

      exec(command, {
        maxBuffer: 1024 * 1024 * 10,
        cwd: destination,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
      }, async (error, stdout, stderr) => {
        // Clean up temp file
        try {
          await fs.unlink(tempFile);
        } catch (e) {
          console.error('Failed to delete temp file:', e);
        }

        if (error) {
          resolve({
            success: false,
            output: stdout || '',
            error: stderr || error.message
          });
          return;
        }

        resolve({
          success: true,
          output: stdout || 'Project created successfully!',
          error: null
        });
      });
    });
  } catch (error) {
    return {
      success: false,
      output: '',
      error: error.message
    };
  }
}

/**
 * Execute mkarchi give command
 * @param {string} sourcePath - Source project path
 * @param {object} options - Command options
 * @param {boolean} options.includeContent - Include file content (-c flag)
 * @param {number} options.maxDepth - Maximum depth
 * @param {string} options.ignorePatterns - Comma-separated ignore patterns
 * @param {number} options.maxSize - Max file size in KB
 * @param {boolean} options.noMax - Disable max size limit
 * @param {boolean} options.noIgnore - Include ignored files
 * @returns {Promise<{success: boolean, output: string, error: string|null}>}
 */
async function executeGive(sourcePath, options = {}) {
  return new Promise((resolve) => {
    let command = 'mkarchi give';

    // Add flags based on options
    if (options.includeContent) {
      command += ' -c';
    }

    if (options.maxDepth && options.maxDepth > 0) {
      command += ` --depth ${options.maxDepth}`;
    }

    if (options.ignorePatterns && options.ignorePatterns.trim()) {
      command += ` --ignore "${options.ignorePatterns}"`;
    }

    if (options.noMax) {
      command += ' --no-max';
    } else if (options.maxSize && options.maxSize > 0) {
      command += ` -max=${options.maxSize}`;
    }

    if (options.noIgnore) {
      command += ' --no-ignore';
    }

    exec(command, {
      maxBuffer: 1024 * 1024 * 10,
      cwd: sourcePath,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    }, (error, stdout, stderr) => {
      if (error) {
        resolve({
          success: false,
          output: stdout || '',
          error: stderr || error.message
        });
        return;
      }

      resolve({
        success: true,
        output: stdout,
        error: null
      });
    });
  });
}

/**
 * Get installation instructions URL
 * @returns {string}
 */
function getInstallationUrl() {
  return 'https://mkarchi.vercel.app/learn/0.1.7#installation';
}

module.exports = {
  checkInstallation,
  executeApply,
  executeGive,
  getInstallationUrl
};
