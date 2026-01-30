/**
 * Frontend validation to prevent saving a second quote with "Closed Accepted" stage
 * This intercepts form submission and checks before allowing save
 */
(function() {
    'use strict';
    
    var finalStage = 'Closed Accepted';
    
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
     */
    function checkOpportunityClosedWon(opportunityId) {
        if (!opportunityId) {
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
                var errorMsg = "This quote cannot be edited because the related Opportunity is 'Closed Won'.";
                alert(errorMsg);
                setTimeout(function() {
                    window.history.back();
                }, 100);
                return false;
            }
        }
        
        // Check for duplicate final quotes (only if setting to "Closed Accepted")
        if (stageValue === finalStage && opportunityId) {
            var checkResult = checkExistingFinalQuote(opportunityId, currentQuoteId);
            if (checkResult.exists) {
                var errorMsg = "Exactly 1 quote must be set to final. Currently " + (checkResult.totalCount - 1) + " quotes are set as final.";
                alert(errorMsg);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Check and prevent edit view from loading if opportunity is Closed Won
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
        
        var stageValue = '';
        var stageField = document.querySelector('[name="stage"]') || document.getElementById('stage');
        if (stageField) {
            if (stageField.value !== undefined) {
                stageValue = stageField.value;
            } else if (stageField.options && stageField.selectedIndex >= 0) {
                stageValue = stageField.options[stageField.selectedIndex].value;
            }
        }
        
        var isFinalQuote = (stageValue === finalStage);
        
        if (!isFinalQuote) {
            return;
        }
        
        if (checkOpportunityClosedWon(opportunityId)) {
            alert("This quote cannot be edited because the related Opportunity is 'Closed Won'.");
            window.history.back();
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
     */
    function preventInlineEditing() {
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
                        alert("This quote cannot be edited because the related Opportunity is 'Closed Won'.");
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
     * Initialize validation
     */
    function initValidation() {
        preventEditViewIfClosedWon();
        
        var attempts = 0;
        var maxAttempts = 100;
        
        var checkForm = setInterval(function() {
            attempts++;
            if (attachValidation() || attempts >= maxAttempts) {
                clearInterval(checkForm);
            }
        }, 100);
        
        setTimeout(checkAndHideEditButton, 1000);
        setTimeout(preventInlineEditing, 1500);
    }
    
    function initHideEditButton() {
        checkAndHideEditButton();
        setTimeout(checkAndHideEditButton, 2000);
        preventInlineEditing();
        setTimeout(preventInlineEditing, 2000);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initValidation();
            initHideEditButton();
        });
    } else {
        setTimeout(function() {
            initValidation();
            initHideEditButton();
        }, 500);
    }
    
    setTimeout(function() {
        initValidation();
        initHideEditButton();
    }, 2000);
    
    setInterval(function() {
        preventInlineEditing();
    }, 3000);
})();
