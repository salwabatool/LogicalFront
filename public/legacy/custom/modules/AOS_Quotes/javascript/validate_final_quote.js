/**
 * Frontend validation to prevent saving a second quote with "Closed Accepted" stage
 * This intercepts form submission and checks before allowing save
 */
(function() {
    'use strict';
    
    var finalStage = 'Closed Accepted';
    var intervals = []; // Store all interval IDs for cleanup
    var timeouts = []; // Store all timeout IDs for cleanup
    var isInitialized = false; // Prevent multiple initializations
    var validationFailed = false; // Track if validation has failed
    var validationInitDone = false; // Track if validation initialization is done
    var hideButtonInitDone = false; // Track if hide button initialization is done
    var currentModal = null; // Track current modal instance
    var initialStageValue = null; // Store initial stage value to avoid checking form changes
    
    /**
     * Show error message in a modal dialog
     * @param {string} message - The error message to display
     * @param {function} onClose - Optional callback when modal is closed
     */
    function showErrorModal(message, onClose) {
        // Remove existing modal if present
        if (currentModal) {
            var existingModal = document.getElementById('quote-validation-modal');
            if (existingModal) {
                existingModal.remove();
            }
            var existingBackdrop = document.querySelector('.quote-validation-modal-backdrop');
            if (existingBackdrop) {
                existingBackdrop.remove();
            }
        }
        
        // Create backdrop
        var backdrop = document.createElement('div');
        backdrop.className = 'quote-validation-modal-backdrop';
        backdrop.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 1040;';
        document.body.appendChild(backdrop);
        
        // Create modal container
        var modal = document.createElement('div');
        modal.id = 'quote-validation-modal';
        modal.className = 'quote-validation-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'quote-validation-modal-title');
        modal.setAttribute('aria-modal', 'true');
        modal.style.cssText = 'position: fixed; top: 7%; left: 0; width: 100%; height: 100%; z-index: 1050; display: flex; justify-content: center;';
        
        // Create modal dialog
        var modalDialog = document.createElement('div');
        modalDialog.className = 'quote-validation-modal-dialog';
        modalDialog.style.cssText = 'position: relative; width: 90%; max-width: 500px; margin: 1.75rem auto;';
        
        // Create modal content
        var modalContent = document.createElement('div');
        modalContent.className = 'quote-validation-modal-content';
        modalContent.style.cssText = 'position: relative; display: flex; flex-direction: column; width: 100%; background-color: #fff; border: 1px solid rgba(0, 0, 0, 0.2); border-radius: 0.3rem; box-shadow: 0 3px 9px rgba(0, 0, 0, 0.5);';
        
        // Create modal header
        var modalHeader = document.createElement('div');
        modalHeader.className = 'quote-validation-modal-header';
        modalHeader.style.cssText = 'display: flex; align-items: flex-start; justify-content: space-between; padding: 1rem; border-bottom: 1px solid #dee2e6; border-top-left-radius: 0.3rem; border-top-right-radius: 0.3rem; background-color: #f8d7da;';
        
        var modalTitle = document.createElement('h5');
        modalTitle.id = 'quote-validation-modal-title';
        modalTitle.className = 'quote-validation-modal-title';
        modalTitle.textContent = 'Error';
        modalTitle.style.cssText = 'margin: 0; font-size: 1.25rem; font-weight: 500; color: #721c24;';
        modalHeader.appendChild(modalTitle);
        
        var closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'quote-validation-modal-close';
        closeButton.setAttribute('aria-label', 'Close');
        closeButton.innerHTML = '&times;';
        closeButton.style.cssText = 'padding: 1rem; margin: -1rem -1rem -1rem auto; background-color: transparent; border: 0; font-size: 1.5rem; font-weight: 700; line-height: 1; color: #721c24; opacity: 0.5; cursor: pointer;';
        closeButton.onclick = function() {
            closeErrorModal();
            if (onClose) onClose();
        };
        modalHeader.appendChild(closeButton);
        
        // Create modal body
        var modalBody = document.createElement('div');
        modalBody.className = 'quote-validation-modal-body';
        modalBody.style.cssText = 'position: relative; flex: 1 1 auto; padding: 1rem; color: #721c24;';
        modalBody.textContent = message;
        
        // Create modal footer
        var modalFooter = document.createElement('div');
        modalFooter.className = 'quote-validation-modal-footer';
        modalFooter.style.cssText = 'display: flex; align-items: center; justify-content: flex-end; padding: 1rem; border-top: 1px solid #dee2e6; border-bottom-right-radius: 0.3rem; border-bottom-left-radius: 0.3rem;';
        
        var okButton = document.createElement('button');
        okButton.type = 'button';
        okButton.className = 'quote-validation-modal-ok btn btn-primary';
        okButton.textContent = 'OK';
        okButton.style.cssText = 'padding: 0.375rem 0.75rem; font-size: 1rem; line-height: 1.5; border-radius: 0.25rem; border: 1px solid #007bff; background-color: #007bff; color: #fff; cursor: pointer;';
        okButton.onclick = function() {
            closeErrorModal();
            if (onClose) onClose();
        };
        modalFooter.appendChild(okButton);
        
        // Assemble modal
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalContent.appendChild(modalFooter);
        modalDialog.appendChild(modalContent);
        modal.appendChild(modalDialog);
        document.body.appendChild(modal);
        
        currentModal = modal;
        
        // Close on backdrop click
        backdrop.onclick = function(e) {
            if (e.target === backdrop) {
                closeErrorModal();
                if (onClose) onClose();
            }
        };
        
        // Close on Escape key
        var escapeHandler = function(e) {
            if (e.key === 'Escape' && currentModal) {
                closeErrorModal();
                if (onClose) onClose();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        // Focus the OK button
        setTimeout(function() {
            okButton.focus();
        }, 100);
    }
    
    /**
     * Close the error modal
     */
    function closeErrorModal() {
        if (currentModal) {
            currentModal.remove();
            currentModal = null;
        }
        var backdrop = document.querySelector('.quote-validation-modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        // Remove modal-open class from body if no other modals
        if (document.querySelectorAll('.quote-validation-modal').length === 0) {
            document.body.classList.remove('modal-open');
        }
    }
    
    /**
     * Check if another quote already has "Closed Accepted" stage (synchronous AJAX)
     * Returns object with {exists: boolean, count: number, totalCount: number}
     */
    function checkExistingFinalQuote(opportunityId, currentQuoteId) {
        if (!opportunityId) {
            return {exists: false, count: 0, totalCount: 0};
        }
        
        var url = 'index.php?module=AOS_Quotes&action=CheckFinalQuote&opportunity_id=' + encodeURIComponent(opportunityId);
        if (currentQuoteId) {
            url += '&current_quote_id=' + encodeURIComponent(currentQuoteId);
        }
        
        var result = {exists: false, count: 0, totalCount: 0};
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false); // Synchronous request
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    result = {
                        exists: data.exists === true,
                        count: data.count || 0,
                        totalCount: data.totalCount || (data.count || 0) + 1
                    };
                } catch(e) {
                    result = {exists: false, count: 0, totalCount: 0};
                }
            }
        };
        try {
            xhr.send();
        } catch(e) {
            return {exists: false, count: 0, totalCount: 0};
        }
        return result;
    }
    
    /**
     * Check if opportunity is Closed Won (synchronous AJAX)
     * Returns false if validation has failed to prevent further calls
     */
    function checkOpportunityClosedWon(opportunityId) {
        if (!opportunityId || validationFailed) {
            return false;
        }
        
        var url = 'index.php?module=AOS_Quotes&action=CheckOpportunityStatus&opportunity_id=' + encodeURIComponent(opportunityId);
        var isClosedWon = false;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false); // Synchronous request
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    isClosedWon = data.isClosedWon === true;
                } catch(e) {
                    isClosedWon = false;
                }
            }
        };
        try {
            xhr.send();
        } catch(e) {
            return false;
        }
        return isClosedWon;
    }
    
    /**
     * Validate before form submission
     */
    function validateBeforeSave(form) {
        // Get opportunity ID
        var opportunityId = '';
        var oppField = form.opportunity_id || form['opportunity_id'] || document.getElementById('opportunity_id') || document.querySelector('[name="opportunity_id"]');
        if (oppField) {
            if (oppField.value !== undefined) {
                opportunityId = oppField.value;
            } else if (oppField.options && oppField.selectedIndex >= 0) {
                opportunityId = oppField.options[oppField.selectedIndex].value;
            }
        }
        
        // Get current quote ID
        var currentQuoteId = '';
        var recordField = form.record || form['record'] || document.getElementById('record') || document.querySelector('[name="record"]');
        if (recordField && recordField.value) {
            currentQuoteId = recordField.value;
        }
        
        // Get stage value
        var stageField = form.stage || form['stage'] || document.getElementById('stage') || document.querySelector('[name="stage"]');
        var stageValue = '';
        if (stageField) {
            if (stageField.value !== undefined) {
                stageValue = stageField.value;
            } else if (stageField.options && stageField.selectedIndex >= 0) {
                stageValue = stageField.options[stageField.selectedIndex].value;
            }
        }
        
        // Check if this is a final quote (has "Closed Accepted" stage)
        var isFinalQuote = (stageValue === finalStage);
        
        // If it's a final quote and opportunity is Closed Won, prevent editing
        if (isFinalQuote && opportunityId) {
            if (checkOpportunityClosedWon(opportunityId)) {
                validationFailed = true;
                clearAllIntervals();
                var errorMsg = "Only one quote can be Final per opportunity.";
                showErrorModal(errorMsg, function() {
                    setTimeout(function() {
                        window.history.back();
                    }, 100);
                });
                return false;
            }
        }
        
        // Check for duplicate final quotes (only if setting to "Closed Accepted")
        if (stageValue === finalStage && opportunityId) {
            var checkResult = checkExistingFinalQuote(opportunityId, currentQuoteId);
            if (checkResult.exists) {
                validationFailed = true;
                clearAllIntervals();
                var errorMsg = "Only one quote can be Final per opportunity.";
                showErrorModal(errorMsg);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Check and prevent edit view from loading if opportunity is Closed Won
     * This only checks the INITIAL saved value, not current form values
     * Validation of form changes happens only on save button click
     */
    function preventEditViewIfClosedWon() {
        var isEditView = window.location.href.indexOf('/edit/') > -1 || 
                        window.location.href.indexOf('action=EditView') > -1 ||
                        document.querySelector('#EditView') ||
                        document.querySelector('form[name="EditView"]');
        
        if (!isEditView) {
            return;
        }
        
        var opportunityId = '';
        var oppField = document.querySelector('[name="opportunity_id"]') || 
                       document.getElementById('opportunity_id') ||
                       document.querySelector('input[type="hidden"][name*="opportunity"]');
        if (oppField) {
            opportunityId = oppField.value || (oppField.getAttribute ? oppField.getAttribute('value') : '');
        }
        
        if (!opportunityId) {
            var urlParams = new URLSearchParams(window.location.search);
            opportunityId = urlParams.get('opportunity_id') || urlParams.get('relate_id');
        }
        
        if (!opportunityId) {
            return;
        }
        
        // Only check the INITIAL stage value (from when page loaded)
        // Don't check current dropdown value - that validation happens on save button click
        var stageValue = '';
        var stageField = document.querySelector('[name="stage"]') || document.getElementById('stage');
        
        // Use stored initial value if available, otherwise get it once and store it
        if (initialStageValue !== null) {
            stageValue = initialStageValue;
        } else if (stageField) {
            // Get initial value once when page loads
            if (stageField.value !== undefined) {
                stageValue = stageField.value;
            } else if (stageField.options && stageField.selectedIndex >= 0) {
                stageValue = stageField.options[stageField.selectedIndex].value;
            }
            // Store initial value so we don't check form changes
            initialStageValue = stageValue;
            
            // Mark field so we know when user changes it
            if (stageField.addEventListener) {
                stageField.addEventListener('change', function() {
                    stageField.setAttribute('data-user-changed', 'true');
                }, { once: true });
            }
        }
        
        var isFinalQuote = (stageValue === finalStage);
        
        if (!isFinalQuote) {
            return;
        }
        
        // Only make API call for initial check (quote already has Closed Accepted when page loads)
        // Don't make API calls when user changes the field - validation happens on save
        if (initialStageValue === finalStage && (!stageField || stageField.getAttribute('data-user-changed') !== 'true')) {
            if (checkOpportunityClosedWon(opportunityId)) {
                showErrorModal("Only one quote can be Final per opportunity.", function() {
                    window.history.back();
                });
            }
        }
    }
    
    /**
     * Attach validation to form submission
     */
    function attachValidation() {
        var form = document.getElementById('EditView') || 
                   document.getElementById('form_EditView_AOS_Quotes') ||
                   document.querySelector('form[name="EditView"]') ||
                   document.querySelector('form#EditView');
        
        if (!form) {
            return false;
        }
        
        if (form._quoteValidationAttached) {
            return true;
        }
        
        var originalOnSubmit = form.onsubmit;
        form.onsubmit = function(e) {
            if (!validateBeforeSave(form)) {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                return false;
            }
            if (originalOnSubmit) {
                return originalOnSubmit.call(this, e);
            }
            return true;
        };
        
        if (typeof SUGAR !== 'undefined' && SUGAR.ajaxUI && SUGAR.ajaxUI.submitForm) {
            var originalSubmitForm = SUGAR.ajaxUI.submitForm;
            SUGAR.ajaxUI.submitForm = function(formElement) {
                if (!formElement) {
                    formElement = form;
                }
                if (formElement && !validateBeforeSave(formElement)) {
                    return false;
                }
                return originalSubmitForm.apply(this, arguments);
            };
        }
        
        if (typeof window.check_form === 'function') {
            var originalCheckForm = window.check_form;
            window.check_form = function(formname) {
                var formToCheck = document.forms[formname] || document.getElementById(formname);
                if (formToCheck && !validateBeforeSave(formToCheck)) {
                    return false;
                }
                return originalCheckForm.apply(this, arguments);
            };
        }
        
        var saveButtons = document.querySelectorAll(
            'input[type="submit"][name="button"][value*="Save"], ' +
            'input[type="submit"][id*="save"], ' +
            'button[type="submit"][id*="save"], ' +
            'button.btn-primary[type="submit"]'
        );
        
        for (var i = 0; i < saveButtons.length; i++) {
            var btn = saveButtons[i];
            if (!btn._quoteValidationAttached) {
                btn.addEventListener('click', function(e) {
                    if (!validateBeforeSave(form)) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        return false;
                    }
                }, true);
                btn._quoteValidationAttached = true;
            }
        }
        
        form._quoteValidationAttached = true;
        return true;
    }
    
    /**
     * Prevent inline editing if opportunity is Closed Won
     * This only runs on detail view, not edit view
     */
    function preventInlineEditing() {
        // Don't run if validation has failed
        if (validationFailed) {
            return;
        }
        
        // Only run on detail view, not edit view (to avoid API calls when user changes fields)
        var isEditView = window.location.href.indexOf('/edit/') > -1 || 
                        window.location.href.indexOf('action=EditView') > -1 ||
                        document.querySelector('#EditView') ||
                        document.querySelector('form[name="EditView"]');
        if (isEditView) {
            return; // Don't run in edit view - validation happens on save
        }
        
        var opportunityId = '';
        var oppField = document.querySelector('[name="opportunity_id"]') || 
                       document.getElementById('opportunity_id') ||
                       document.querySelector('input[type="hidden"][name*="opportunity"]');
        if (oppField) {
            opportunityId = oppField.value || (oppField.getAttribute ? oppField.getAttribute('value') : '');
        }
        
        if (!opportunityId) {
            var urlParams = new URLSearchParams(window.location.search);
            opportunityId = urlParams.get('opportunity_id') || urlParams.get('relate_id');
        }
        
        if (!opportunityId) {
            var oppLink = document.querySelector('a[href*="module=Opportunities"][href*="action=DetailView"]');
            if (oppLink && oppLink.href) {
                var match = oppLink.href.match(/record=([a-f0-9-]+)/i);
                if (match && match[1]) {
                    opportunityId = match[1];
                }
            }
        }
        
        if (!opportunityId) {
            return;
        }
        
        var stageValue = '';
        var stageField = document.querySelector('[name="stage"]') || 
                        document.getElementById('stage') ||
                        document.querySelector('td[field="stage"]') ||
                        document.querySelector('.detail-view [data-field="stage"]') ||
                        document.querySelector('[data-fieldname="stage"]');
        if (stageField) {
            stageValue = stageField.value || stageField.textContent || stageField.innerText || '';
            stageValue = stageValue.trim();
        }
        
        var isFinalQuote = (stageValue === finalStage);
        
        if (!isFinalQuote) {
            return;
        }
        
        if (checkOpportunityClosedWon(opportunityId)) {
            var editableFields = document.querySelectorAll(
                '[contenteditable="true"], ' +
                '.inline-edit, ' +
                '[data-inline-edit], ' +
                '.field-edit'
            );
            
            for (var i = 0; i < editableFields.length; i++) {
                editableFields[i].setAttribute('contenteditable', 'false');
                editableFields[i].style.cursor = 'default';
                if (!editableFields[i]._inlineEditBlocked) {
                    editableFields[i]._inlineEditBlocked = true;
                    editableFields[i].addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        showErrorModal("Only one quote can be Final per opportunity.");
                        return false;
                    }, true);
                }
            }
        }
    }
    
    /**
     * Check if opportunity is Closed Won and hide edit button if quote is final
     */
    function checkAndHideEditButton() {
        // Don't run if validation has failed
        if (validationFailed) {
            return;
        }
        
        var isDetailView = window.location.href.indexOf('/detail/') > -1 || 
                          window.location.href.indexOf('action=DetailView') > -1 ||
                          document.querySelector('.detail-view');
        
        if (!isDetailView) {
            return;
        }
        
        var opportunityId = '';
        var oppField = document.querySelector('[name="opportunity_id"]') || 
                       document.getElementById('opportunity_id') ||
                       document.querySelector('input[type="hidden"][name*="opportunity"]');
        if (oppField) {
            opportunityId = oppField.value || (oppField.getAttribute ? oppField.getAttribute('value') : '');
        }
        
        if (!opportunityId) {
            var oppLink = document.querySelector('a[href*="module=Opportunities"][href*="action=DetailView"]');
            if (oppLink && oppLink.href) {
                var match = oppLink.href.match(/record=([a-f0-9-]+)/i);
                if (match && match[1]) {
                    opportunityId = match[1];
                }
            }
        }
        
        if (!opportunityId) {
            var urlParams = new URLSearchParams(window.location.search);
            opportunityId = urlParams.get('opportunity_id') || urlParams.get('relate_id');
        }
        
        if (!opportunityId) {
            return;
        }
        
        var stageValue = '';
        var stageField = document.querySelector('[name="stage"]') || 
                        document.getElementById('stage') ||
                        document.querySelector('td[field="stage"]') ||
                        document.querySelector('.detail-view [data-field="stage"]');
        if (stageField) {
            stageValue = stageField.value || stageField.textContent || stageField.innerText || '';
            stageValue = stageValue.trim();
        }
        
        var isFinalQuote = (stageValue === finalStage);
        
        if (!isFinalQuote) {
            return;
        }
        
        var url = 'index.php?module=AOS_Quotes&action=CheckOpportunityStatus&opportunity_id=' + encodeURIComponent(opportunityId);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    if (data.isClosedWon === true) {
                        var selectors = [
                            'a[href*="action=EditView"]',
                            'button[onclick*="EditView"]',
                            'input[value*="Edit"]',
                            '.actions-container a[href*="edit"]',
                            '[data-action="edit"]',
                            '.action-edit',
                            'button#edit_button',
                            'input#edit_button',
                            'a.button[href*="EditView"]'
                        ];
                        
                        for (var s = 0; s < selectors.length; s++) {
                            try {
                                var editButtons = document.querySelectorAll(selectors[s]);
                                for (var i = 0; i < editButtons.length; i++) {
                                    editButtons[i].style.display = 'none';
                                    if (editButtons[i].parentElement) {
                                        editButtons[i].parentElement.style.display = 'none';
                                    }
                                }
                            } catch(e) {}
                        }
                    }
                } catch(e) {}
            }
        };
        xhr.send();
    }
    
    /**
     * Clear all intervals and timeouts
     */
    function clearAllIntervals() {
        for (var i = 0; i < intervals.length; i++) {
            clearInterval(intervals[i]);
        }
        intervals = [];
        
        for (var j = 0; j < timeouts.length; j++) {
            clearTimeout(timeouts[j]);
        }
        timeouts = [];
    }
    
    /**
     * Initialize validation
     */
    function initValidation() {
        // Prevent multiple initializations
        if (validationInitDone || validationFailed) {
            return;
        }
        validationInitDone = true;
        
        preventEditViewIfClosedWon();
        
        var attempts = 0;
        var maxAttempts = 100;
        
        var checkForm = setInterval(function() {
            attempts++;
            if (attachValidation() || attempts >= maxAttempts || validationFailed) {
                clearInterval(checkForm);
            }
        }, 100);
        intervals.push(checkForm);
        
        var timeout1 = setTimeout(function() {
            if (!validationFailed) {
                checkAndHideEditButton();
            }
        }, 1000);
        timeouts.push(timeout1);
        
        var timeout2 = setTimeout(function() {
            if (!validationFailed) {
                preventInlineEditing();
            }
        }, 1500);
        timeouts.push(timeout2);
    }
    
    function initHideEditButton() {
        // Prevent multiple initializations
        if (hideButtonInitDone || validationFailed) {
            return;
        }
        hideButtonInitDone = true;
        
        if (!validationFailed) {
            checkAndHideEditButton();
        }
        
        var timeout1 = setTimeout(function() {
            if (!validationFailed) {
                checkAndHideEditButton();
            }
        }, 2000);
        timeouts.push(timeout1);
        
        if (!validationFailed) {
            preventInlineEditing();
        }
        
        var timeout2 = setTimeout(function() {
            if (!validationFailed) {
                preventInlineEditing();
            }
        }, 2000);
        timeouts.push(timeout2);
    }
    
    // Main initialization - only run once
    function initialize() {
        if (isInitialized) {
            return;
        }
        isInitialized = true;
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                initValidation();
                initHideEditButton();
            });
        } else {
            var timeout1 = setTimeout(function() {
                initValidation();
                initHideEditButton();
            }, 500);
            timeouts.push(timeout1);
        }
        
        var timeout2 = setTimeout(function() {
            initValidation();
            initHideEditButton();
        }, 2000);
        timeouts.push(timeout2);
        
        // Only set up the interval if we're not in a failed state
        // Run it less frequently and with a check
        var preventInlineInterval = setInterval(function() {
            if (!validationFailed) {
                preventInlineEditing();
            } else {
                clearInterval(preventInlineInterval);
            }
        }, 5000); // Increased from 3000 to 5000 to reduce frequency
        intervals.push(preventInlineInterval);
    }
    
    initialize();
})();
