/**
 * Degree Sheet Classes Manager
 * jQuery-based functions for adding/managing class items in the degree sheet
 */

const DegreeSheetClasses = (function($) {
    // Private variables
    let $container = null;
    let classCounter = 0;

    // Initialize container
    function getContainer() {
        if (!$container || !$container.length) {
            $container = $('#ds-items-container');
            if (!$container.length) {
                console.error('Degree sheet container not found!');
                return null;
            }
        }
        return $container;
    }

    /**
     * Add a class to the degree sheet
     * @param {Object} classData - Class information
     * @param {string} classData.name - Full class name (e.g., "COMP 11: Introduction to Computer Science")
     * @param {number|string} classData.credits - Number of credits
     * @param {string} classData.code - Class code (e.g., "COMP-001")
     * @param {string} classData.id - Optional unique ID (generated if not provided)
     * @returns {jQuery|null} - The added class element or null if failed
     */
    function addClass(classData) {
        const $container = getContainer();
        if (!$container) return null;

        // Validate required fields
        if (!classData.name) {
            console.error('Class name is required');
            return null;
        }
        if (classData.credits === undefined || classData.credits === null) {
            console.error('Class credits are required');
            return null;
        }

        // Generate unique ID if not provided
        const classId = classData.id || `class-${++classCounter}-${Date.now()}`;
        const classCode = classData.code || `CODE-${classId}`;

        // Create class item element using jQuery
        const $classItem = $('<div>', {
            'class': 'class-item',
            'data-class-id': classId,
            'data-class-code': classCode
        });

        // Add metadata if provided
        if (classData.metadata) {
            $classItem.attr('data-metadata', JSON.stringify(classData.metadata));
        }

        // Build inner structure
        const $classInfo = $('<div>', { 'class': 'class-info' });
        $('<span>', { 'class': 'class-name', text: classData.name }).appendTo($classInfo);
        $('<span>', { 'class': 'class-credits', text: classData.credits + ' credits' }).appendTo($classInfo);

        const $removeBtn = $('<button>', {
            'class': 'class-remove-btn',
            'title': 'Remove class',
            html: '<span class="remove-text">×</span>'
        });

        // Add remove functionality
        $removeBtn.on('click', function() {
            removeClass(classId);
        });

        // Assemble the class item
        $classInfo.appendTo($classItem);
        $removeBtn.appendTo($classItem);

        // Add to container
        $container.append($classItem);

        // Trigger event
        $(document).trigger('classAdded', [{
            id: classId,
            code: classCode,
            name: classData.name,
            credits: classData.credits,
            metadata: classData.metadata || {}
        }]);

        return $classItem;
    }

    /**
     * Remove a class from the degree sheet
     * @param {string} classId - The ID of the class to remove
     * @returns {boolean} - True if removed successfully
     */
    function removeClass(classId) {
        const $classItem = $(`.class-item[data-class-id="${classId}"]`);
        
        if (!$classItem.length) {
            console.warn(`Class with ID ${classId} not found`);
            return false;
        }

        // Get class data before removing
        const classData = {
            id: classId,
            code: $classItem.data('class-code'),
            name: $classItem.find('.class-name').text(),
            credits: $classItem.find('.class-credits').text().replace(' credits', '')
        };

        // Remove from DOM with fade effect (optional)
        $classItem.fadeOut(300, function() {
            $(this).remove();
        });

        // Trigger event
        $(document).trigger('classRemoved', [classData]);

        return true;
    }

    /**
     * Update an existing class
     * @param {string} classId - The ID of the class to update
     * @param {Object} updates - Updated class data
     * @returns {boolean} - True if updated successfully
     */
    function updateClass(classId, updates) {
        const $classItem = $(`.class-item[data-class-id="${classId}"]`);
        
        if (!$classItem.length) {
            console.warn(`Class with ID ${classId} not found`);
            return false;
        }

        // Update fields
        if (updates.name) {
            $classItem.find('.class-name').text(updates.name);
        }
        if (updates.credits !== undefined) {
            $classItem.find('.class-credits').text(updates.credits + ' credits');
        }
        if (updates.code) {
            $classItem.attr('data-class-code', updates.code);
        }
        if (updates.metadata) {
            $classItem.attr('data-metadata', JSON.stringify(updates.metadata));
        }

        // Trigger event
        $(document).trigger('classUpdated', [{
            id: classId,
            code: updates.code || $classItem.data('class-code'),
            name: updates.name || $classItem.find('.class-name').text(),
            credits: updates.credits || $classItem.find('.class-credits').text().replace(' credits', ''),
            metadata: updates.metadata || JSON.parse($classItem.attr('data-metadata') || '{}')
        }]);

        return true;
    }

    /**
     * Get all classes currently in the degree sheet
     * @returns {Array} - Array of class data objects
     */
    function getAllClasses() {
        const classes = [];
        $('.class-item').each(function() {
            const $item = $(this);
            classes.push({
                id: $item.data('class-id'),
                code: $item.data('class-code'),
                name: $item.find('.class-name').text(),
                credits: $item.find('.class-credits').text().replace(' credits', ''),
                metadata: JSON.parse($item.attr('data-metadata') || '{}')
            });
        });
        return classes;
    }

    /**
     * Get a specific class by ID
     * @param {string} classId - The class ID
     * @returns {Object|null} - Class data or null if not found
     */
    function getClass(classId) {
        const $classItem = $(`.class-item[data-class-id="${classId}"]`);
        if (!$classItem.length) return null;

        return {
            id: classId,
            code: $classItem.data('class-code'),
            name: $classItem.find('.class-name').text(),
            credits: $classItem.find('.class-credits').text().replace(' credits', ''),
            metadata: JSON.parse($classItem.attr('data-metadata') || '{}')
        };
    }

    /**
     * Clear all classes from the degree sheet
     */
    function clearAllClasses() {
        const $container = getContainer();
        if ($container) {
            $container.fadeOut(200, function() {
                $(this).empty().show();
            });
        }
        $(document).trigger('allClassesCleared');
    }

    /**
     * Add multiple classes at once
     * @param {Array} classesArray - Array of class data objects
     * @returns {Array} - Array of added jQuery elements
     */
    function addMultipleClasses(classesArray) {
        const added = [];
        classesArray.forEach(classData => {
            const $item = addClass(classData);
            if ($item) added.push($item);
        });
        return added;
    }

    /**
     * Enable drag-and-drop reordering using jQuery UI
     */
    function enableReordering() {
        const $container = getContainer();
        if (!$container) return;

        if ($.fn.sortable) {
            $container.sortable({
                items: '.class-item',
                handle: '.drag-handle', // You'd need to add a drag handle to the template
                placeholder: 'class-item-placeholder',
                opacity: 0.6,
                cursor: 'move',
                update: function(event, ui) {
                    // Get the new order
                    const order = [];
                    $container.find('.class-item').each(function() {
                        order.push($(this).data('class-id'));
                    });
                    $(document).trigger('classesReordered', [order]);
                }
            });

            // Add drag handles if they don't exist
            $container.find('.class-item').each(function() {
                const $item = $(this);
                if (!$item.find('.drag-handle').length) {
                    $('<span>', {
                        'class': 'drag-handle',
                        html: '⋮⋮'
                    }).prependTo($item);
                }
            });
        } else {
            console.warn('jQuery UI Sortable not available');
        }
    }

    /**
     * Disable drag-and-drop reordering
     */
    function disableReordering() {
        const $container = getContainer();
        if ($container && $.fn.sortable) {
            $container.sortable('destroy');
            $container.find('.drag-handle').remove();
        }
    }

    /**
     * Event listener wrapper
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    function on(event, callback) {
        $(document).on(event, callback);
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    function off(event, callback) {
        $(document).off(event, callback);
    }

    // Initialize on document ready
    $(document).ready(function() {
        // Add CSS if not already present
        if (!$('#degree-sheet-classes-style').length) {
            $('<style>', {
                id: 'degree-sheet-classes-style',
                text: `
                    .class-item {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 8px 12px;
                        margin: 4px 0;
                        background-color: #f5f5f5;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        transition: background-color 0.2s;
                    }
                    .class-item:hover {
                        background-color: #e9e9e9;
                    }
                    .class-info {
                        display: flex;
                        align-items: center;
                        gap: 15px;
                        flex-grow: 1;
                    }
                    .class-name {
                        font-weight: 500;
                        font-size: 14px;
                    }
                    .class-credits {
                        font-size: 12px;
                        color: #666;
                        background-color: #fff;
                        padding: 2px 6px;
                        border-radius: 12px;
                        border: 1px solid #ccc;
                    }
                    .class-remove-btn {
                        background: none;
                        border: none;
                        cursor: pointer;
                        padding: 4px 8px;
                        font-size: 18px;
                        font-weight: bold;
                        color: #999;
                        transition: color 0.2s;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .class-remove-btn:hover {
                        color: #ff4444;
                    }
                    .drag-handle {
                        cursor: move;
                        color: #999;
                        margin-right: 8px;
                        padding: 0 4px;
                        font-size: 18px;
                        user-select: none;
                    }
                    .drag-handle:hover {
                        color: #333;
                    }
                    .class-item-placeholder {
                        border: 2px dashed #ccc;
                        background-color: #fafafa;
                        height: 40px;
                        margin: 4px 0;
                    }
                `
            }).appendTo('head');
        }
    });

    // Public API
    return {
        add: addClass,
        remove: removeClass,
        update: updateClass,
        getAll: getAllClasses,
        get: getClass,
        clear: clearAllClasses,
        addMultiple: addMultipleClasses,
        enableReordering: enableReordering,
        disableReordering: disableReordering,
        on: on,
        off: off
    };

})(jQuery);

// Example usage for other JS files:
/*
// Add a single class
DegreeSheetClasses.add({
    name: 'COMP 11: Introduction to Computer Science',
    credits: 3,
    code: 'COMP-0011'
});

// Add multiple classes
DegreeSheetClasses.addMultiple([
    { name: 'MATH 32: Calculus II', credits: 4, code: 'MATH-0032' },
    { name: 'PHYS 11: Mechanics', credits: 3, code: 'PHYS-0011' }
]);

// Listen for events
DegreeSheetClasses.on('classAdded', function(event, classData) {
    console.log('Class added:', classData);
});

DegreeSheetClasses.on('classRemoved', function(event, classData) {
    console.log('Class removed:', classData);
});

// Enable drag-and-drop
DegreeSheetClasses.enableReordering();

// Get all classes
const allClasses = DegreeSheetClasses.getAll();
console.log('Current classes:', allClasses);
*/