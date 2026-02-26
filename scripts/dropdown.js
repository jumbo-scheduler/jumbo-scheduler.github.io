// Wait for document ready
$(document).ready(function () {

    // Initialize terms
    function initializeTerms() {
        const termsContainer = $('#terms-container');
        termsContainer.empty();

        // prematriculation credits
        createTermDropdown(0, `Prematriculation Credits`);

        // Create year dividers and terms
        for (let year = 1; year <= 4; year++) {
            // Year divider
            termsContainer.append(`<div class="year-divider">Year ${year}</div>`);

            // Three terms per year
            for (let sem = 1; sem <= 3; sem++) {
                const termName = ["Fall", "Spring", "Summer"][sem - 1];
                const termNumber = (year - 1) * 3 + sem;
                if (sem != 3 || year != 4) createTermDropdown(termNumber, `${termName} ${year}`);
            }
        }

        // Setup event listeners after creating terms
        setupTabSelection();
        setupCollapseListeners();
        setupRenameListeners();
        updateCreditTotals();
    }

    // Create a single term dropdown
    function createTermDropdown(termNumber, termName) {
        const termId = `term-${termNumber}`;
        const termHtml = `
            <div class="term-dropdown" id="${termId}" data-term="${termNumber}">
                <div class="term-header" data-term-id="${termId}">
                    <img class="term-arrow" src="img/dropdown.svg" alt="expand/collapse" />
                    <span class="term-title" id="${termId}-title">${termName}</span>
                    <button class="term-rename-btn" data-term="${termId}" title="Rename term">
                        <img src="img/edit.svg" alt="rename" />
                    </button>
                    <span class="term-credit-count" id="${termId}-credits">0 credits</span>
                </div>
                <div class="term-content" id="${termId}-content">
                    <div class="term-empty">No classes added yet. Add classes with the class finder on the right.</div>
                </div>
            </div>
        `;

        $('#terms-container').append(termHtml);
    }

    // Setup tab selection
    function setupTabSelection() {
        $('.term-dropdown').off('click.tabSelection').on('click.tabSelection', function (e) {
            // Don't select if clicking on rename button, credit count, or collapse arrow
            if ($(e.target).closest('.term-rename-btn').length ||
                $(e.target).closest('.term-credit-count').length ||
                $(e.target).closest('.term-arrow').length) {
                return;
            }

            // if we click on the currently selected tab, quit early to allow collapse/expand by clicking anywhere on the header
            if ($(this).hasClass('term-selected')) return

            const termDropdown = $(this);
            const termId = termDropdown.attr('id');
            const termNumber = termDropdown.data('term');
            const termName = $(`#${termId}-title`).text();

            // expand the term if it's not already expanded
            const header = termDropdown.find('.term-header');
            const content = termDropdown.find('.term-content');
            if (header.hasClass('collapsed')) {
                header.removeClass('collapsed');
                content.removeClass('collapsed');
            }

            // Remove selected class from all dropdowns
            $('.term-dropdown').removeClass('term-selected');

            // Add selected class to clicked dropdown
            termDropdown.addClass('term-selected');

            // Update currentTab variable
            currentTab = {
                id: termId,
                number: termNumber,
                name: termName,
                element: termDropdown,
                getClasses: function () {
                    return termDropdown.find('.term-class-item');
                },
                getClassCount: function () {
                    return termDropdown.find('.term-class-item').length;
                },
                getCreditCount: function () {
                    let credits = 0;
                    termDropdown.find('.term-class-item .class-credits').each(function () {
                        credits += parseInt($(this).text());
                    });
                    return credits;
                }
            };
        });
    }

    // Setup rename listeners
    function setupRenameListeners() {
        $('.term-rename-btn').off('click.rename').on('click.rename', function (e) {
            e.stopPropagation();

            const termId = $(this).data('term');
            const titleSpan = $(`#${termId}-title`);
            const currentName = titleSpan.text();

            // Create input field
            const input = $('<input>', {
                type: 'text',
                class: 'term-title-input',
                value: currentName
            });

            // Replace span with input
            titleSpan.replaceWith(input);
            input.focus();

            // Handle rename completion
            function completeRename() {
                const newName = input.val().trim() || currentName;
                const newSpan = $('<span>', {
                    class: 'term-title',
                    id: `${termId}-title`,
                    text: newName
                });
                input.replaceWith(newSpan);

                // Update currentTab if this is the selected tab
                if (currentTab && currentTab.id === termId) {
                    currentTab.name = newName;
                }
            }

            input.on('blur', completeRename);
            input.on('keypress', function (e) {
                if (e.which === 13) { // Enter key
                    e.preventDefault();
                    completeRename();
                }
            });
        });
    }

    // Setup remove class listeners with animation
    function setupRemoveListeners() {
        $(document).off('click', '.remove-class').on('click', '.remove-class', function (e) {
            e.stopPropagation();
            const classItem = $(this).closest('.term-class-item');
            const contentDiv = classItem.closest('.term-content');

            // Add removing class for animation
            classItem.addClass('removing');

            // Wait for animation to complete before removing
            setTimeout(() => {
                classItem.remove();
                updateCreditTotals();

                // Show empty state if no classes left
                if (contentDiv.find('.term-class-item').length === 0) {
                    contentDiv.prepend('<div class="term-empty">No classes added yet. Add classes with the class finder on the right.</div>');
                }
            }, 200); // Match animation duration
        });
    }

    // Update credit totals across all terms
    function updateCreditTotals() {
        let totalCredits = 0;

        $('.term-dropdown').each(function () {
            let termCredits = 0;
            const termId = $(this).attr('id');

            $(this).find('.term-class-item .class-credits').each(function () {
                const credits = parseInt($(this).text());
                termCredits += credits;
            });

            $(`#${termId}-credits`).text(`${termCredits} credits`);
            totalCredits += termCredits;
        });

        $('#total-credits').text(`${totalCredits} credits`);
    }

    
    // Update the add class method with animation
    window.addClassToTerm = function (termId, classCode, className, credits) {
        const contentDiv = $(`#${termId}-content`);
        const emptyState = contentDiv.find('.term-empty');

        // Remove empty state with animation if it exists
        if (emptyState.length) {
            emptyState.addClass('removing');
            setTimeout(() => {
                emptyState.remove();
            }, 200);
        }

        const classItem = `
        <div class="term-class-item" draggable="true" style="opacity: 0; transform: translateY(-10px);">
            <img class="class-marker" src="img/class_marker.svg" alt="class" />
            <span class="class-code">${classCode}</span>
            <span class="class-name">${className}</span>
            <span class="class-credits">${credits} credits</span>
            <img class="remove-class" src="img/trash_icon.svg" alt="remove" />
        </div>
    `;

        // Append the item
        contentDiv.append(classItem);
        const newItem = contentDiv.find('.term-class-item').last();

        // Trigger animation after a tiny delay
        setTimeout(() => {
            newItem.css({
                'opacity': '1',
                'transform': 'translateY(0)'
            });
        }, 10);

        updateCreditTotals();

        // Setup drag and drop for the new item
        setupDragDrop(newItem);
    };

    // Setup drag and drop functionality
    function setupDragDrop(element) {
        element.on('dragstart', function (e) {
            e.originalEvent.dataTransfer.setData('text/plain', $(this).index());
            $(this).addClass('dragging');
        });

        element.on('dragend', function () {
            $('.term-class-item').removeClass('dragging drag-over');
        });

        element.on('dragover', function (e) {
            e.preventDefault();
            $(this).addClass('drag-over');
        });

        element.on('dragleave', function () {
            $(this).removeClass('drag-over');
        });

        element.on('drop', function (e) {
            e.preventDefault();
            const fromIndex = e.originalEvent.dataTransfer.getData('text/plain');
            const toElement = $(this);

            // Remove drag classes
            $('.term-class-item').removeClass('dragging drag-over');

            // Here you would handle the actual reordering logic
            console.log('Drop from index:', fromIndex, 'to:', toElement.index());
        });
    }

    // Reset to default terms
    $('#reset-terms-btn').on('click', function () {
        if (confirm('Reset to default terms? This will clear all your classes.')) {
            initializeTerms();
            
            // select the first term by default
            $('.term-dropdown').first().trigger('click');
        }
    });

    // Rename track
    $('#track-rename-btn').on('click', function () {
        const headerContainer = $('#track-title-container');
        const currentH2 = $('#track-header h2');
        const currentName = currentH2.text();

        // Create input field with the same sexy styling
        const input = $('<input>', {
            type: 'text',
            class: 'track-title-input',
            value: currentName,
            placeholder: 'Enter track name'
        });

        // Replace h2 with input
        currentH2.replaceWith(input);
        input.focus();
        input.select(); // Automatically select all text for easy replacement

        // Handle rename completion
        function completeRename() {
            const newName = input.val().trim() || currentName; // Fallback to old name if empty
            const newH2 = $('<h2>', {
                text: newName
            });
            input.replaceWith(newH2);

            // Add a little celebration animation
            newH2.css({
                'transform': 'scale(1.02)',
                'transition': 'transform 0.2s ease'
            });
            setTimeout(() => {
                newH2.css('transform', 'scale(1)');
            }, 200);
        }

        // Handle blur (clicking away)  
        input.on('blur', completeRename);

        // Handle Enter key
        input.on('keypress', function (e) {
            if (e.which === 13) { // Enter key
                e.preventDefault();
                completeRename();
            }
        });
    });

    // Initialize on page load
    initializeTerms();

    // Setup remove listeners globally
    setupRemoveListeners();

    function expandAllTerms() {
        $('.term-header').each(function (index) {
            const header = $(this);
            const content = header.siblings('.term-content');


            header.removeClass('collapsed');
            content.removeClass('collapsed');
        });
    }

    function collapseAllTerms() {
        $('.term-header').each(function (index) {
            const header = $(this);
            const content = header.siblings('.term-content');


            header.addClass('collapsed');
            content.addClass('collapsed');
        })
    }

    // Update the collapse listener to ensure animation works smoothly
    function setupCollapseListeners() {
        $('.term-header').off('click.collapse').on('click.collapse', function (e) {
            // only trigger if we click on collapse arrow unless its the currently selected tab, then allow clicking anywhere on the header to toggle
            if (!$(e.target).closest('.term-arrow').length && !$(this).parent().hasClass('term-selected')) {
                return;
            }

            const header = $(this);
            const content = header.siblings('.term-content');

            header.toggleClass('collapsed');
            content.toggleClass('collapsed');
        });
    }

    // Expand all button
    $('#expand-all-btn').on('click', function () {
        expandAllTerms();
    });

    // Collapse all button
    $('#collapse-all-btn').on('click', function () {
        collapseAllTerms();
    });

    // select the first term by default
    $('.term-dropdown').first().trigger('click');
});


// Track current tab variable
let currentTab = null;
