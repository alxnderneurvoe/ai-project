/**
 * ui.js
 * UI helper functions: feedback alerts, icons, and HTML escaping.
 */

/**
 * Displays a dismissible Bootstrap alert above the form.
 * @param {string} msg   - HTML message content
 * @param {'success'|'danger'|'warning'|'info'} type - Bootstrap alert type
 */
function showFeedback(msg, type) {
    const existingAlert = document.getElementById('formAlert');
    if (existingAlert) existingAlert.remove();

    const alertHtml = `
        <div id="formAlert" class="alert alert-${type} alert-dismissible fade show" role="alert"
             style="border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <div class="d-flex align-items-center">
                <i class="fas ${getAlertIcon(type)} me-3" style="font-size: 1.3rem;"></i>
                <div>${msg}</div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    const form = document.getElementById('handoverForm');
    form.insertAdjacentHTML('beforebegin', alertHtml);

    document.getElementById('formAlert').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Returns the Font Awesome icon class for the given alert type.
 * @param {'success'|'danger'|'warning'|'info'} type
 * @returns {string}
 */
function getAlertIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'danger':  return 'fa-exclamation-triangle';
        case 'warning': return 'fa-exclamation-circle';
        default:        return 'fa-info-circle';
    }
}

/**
 * Escapes a string for safe insertion into HTML attributes and text nodes.
 * @param {string|null|undefined} str
 * @returns {string}
 */
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#039;');
}
