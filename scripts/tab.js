/*************************************
 *                  TABS
 *************************************/

let numTabs = 0;
let numAlerts = 0;

class Tab {
    constructor(name, term = null) {
        this.name = name;
        this.term = term;
        this.requirements = []; // pointer to each html requirement element
        this.createdAt = new Date();
    }

    addRequirement(reqElement) {
        this.requirements.push(reqElement);
        this.updateCreditCount();
    }

    removeRequirement(index) {
        if (index >= 0 && index < this.requirements.length) {
            this.requirements.splice(index, 1);
            this.updateCreditCount();
        }
    }

    display() {
        // display all requirements in degree sheet
        $("#ds-items-container").empty();
        for (let req of this.requirements) {
            $("#ds-items-container").append(req);
        }
        this.updateCreditCount();
    }

    updateCreditCount() {
        // Calculate total credits from all requirements
        let totalCredits = 0;
        for (let req of this.requirements) {
            // Parse credit info from requirement if available
            const creditMatch = req.text().match(/(\d+)\s*credit/);
            if (creditMatch) {
                totalCredits += parseInt(creditMatch[1]);
            }
        }
        
        // Update or create credit counter
        let counter = $("#ds-major-header .credit-counter");
        if (counter.length === 0) {
            counter = $('<span class="credit-counter"></span>');
            $("#ds-major-header").append(counter);
        }
        
        counter.text(`Total: ${totalCredits} credits`);
        
        // Add warning classes based on credit count
        counter.removeClass('warning danger');
        if (totalCredits > 18) {
            counter.addClass('danger');
        } else if (totalCredits > 15) {
            counter.addClass('warning');
        }
    }
}

const tabs = [];
var currentTab = null;

const onTabChange = (newTab) => {
    currentTab = newTab || currentTab;

    // Update degree sheet to reflect current tab
    const headerText = currentTab.term ? 
        `${currentTab.name} (${currentTab.term})` : 
        currentTab.name;
    $("#ds-major-header h2").text(headerText);

    // Clear previous requirements 
    $("#ds-items-container").empty();

    // Display new requirements
    currentTab.display();
    
    // Update tab selection styling
    $(".tab").removeClass("tab-selected");
    $(`.tab:contains('${currentTab.name}')`).addClass("tab-selected");
};

const createTab = (termInfo = null) => {
    // Make a new tab, append to div and make it selected

    // If too many say something helpful
    if (numTabs > 9) {
        showNotification("Maximum tabs reached! Consider combining some terms.", "warning");
        return;
    }
    numTabs++;

    // Find the lowest index that doesn't cause a collision
    const tabNames = $(".tab-label").get().map(x => $(x).text());
    var newTabIndex = 1;
    if (tabNames.length > 0) {
        while (tabNames.includes(`Term ${newTabIndex}`)) newTabIndex++;
    }

    let tabName, termDisplay;
    if (termInfo) {
        tabName = termInfo.customName || `${termInfo.season} ${termInfo.year}`;
        termDisplay = termInfo.customName ? 
            `${termInfo.season} ${termInfo.year}` : 
            '';
    } else {
        tabName = `Term ${newTabIndex}`;
        termDisplay = '';
    }

    const tabTemplate = 
    `<div class="tab">
        <p class="tab-label">${tabName}</p>
        ${termDisplay ? `<span class="term-indicator">${termDisplay}</span>` : ''}
        <button class="close-tab-btn" title="Close tab">
            <span style="font-family: monospace">✖</span>
        </button>
    </div>`;

    const newTab = $(tabTemplate);
    
    // Tab click handler
    newTab.on("click", function(e) {
        if (!$(e.target).closest('.close-tab-btn').length) {
            onTabChange(tabs[$(".tab").get().indexOf(this)]);
        }
    });

    // Close button handler
    newTab.children(".close-tab-btn").on("click", function(e) {
        e.stopPropagation();
        if ($(".tab").length > 1) {
            showConfirmationDialog(
                "Delete Tab",
                "Are you sure you want to delete this tab?",
                () => {
                    const tabIndex = $(".tab").get().indexOf(newTab.get(0));
                    tabs.splice(tabIndex, 1);

                    if (newTab.hasClass("tab-selected")) {
                        var nextOfKin;
                        if (newTab.next().hasClass("tab")) nextOfKin = newTab.next();
                        else nextOfKin = newTab.prev();

                        newTab.remove();
                        nextOfKin.click();
                    } else {
                        newTab.remove();
                    }
                    numTabs--;
                    showNotification("Tab deleted", "info");
                }
            );
        }
    });

    // Create the corresponding Tab object
    const newTabObj = new Tab(
        termInfo?.customName || tabName, 
        termDisplay || null
    );
    tabs.push(newTabObj);
    currentTab = newTabObj;

    newTab.insertBefore($("#new-tab-btn"));
    newTab.click();
    
    showNotification(`Created new tab: ${tabName}`, "success");
};

// Helper function for notifications
function showNotification(message, type = "info") {
    const notification = $(`
        <div class="notification ${type}">
            ${message}
        </div>
    `);
    
    $("body").append(notification);
    notification.fadeIn(300).delay(3000).fadeOut(300, function() {
        $(this).remove();
    });
}

// Helper function for confirmation dialogs
function showConfirmationDialog(title, message, onConfirm) {
    const dialog = $(`
        <div class="confirmation-dialog" title="${title}">
            <p>${message}</p>
        </div>
    `);
    
    $("body").append(dialog);
    dialog.dialog({
        modal: true,
        buttons: {
            "Yes": function() {
                onConfirm();
                $(this).dialog("close");
            },
            "No": function() {
                $(this).dialog("close");
            }
        },
        close: function() {
            $(this).remove();
        }
    });
}

// Initialize with first tab
$(document).ready(function() {
    // Add CSS for notifications
    $('head').append(`
        <style>
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                background: #333;
                color: white;
                border-radius: 5px;
                z-index: 9999;
                display: none;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            }
            .notification.success { background: #28a745; }
            .notification.warning { background: #ffc107; color: #333; }
            .notification.error { background: #dc3545; }
            .notification.info { background: #17a2b8; }
            
            .confirmation-dialog {
                display: none;
            }
        </style>
    `);
    
    createTab();
});

$("#new-tab-btn").on("click", function() {
    // Show term selection dialog
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 4; i++) {
        years.push(currentYear + i);
    }
    
    const dialog = $(`
        <div class="term-dialog" title="New Term">
            <form>
                <div style="margin-bottom: 10px;">
                    <label>Season:</label>
                    <select id="new-term-season">
                        <option value="Fall">Fall</option>
                        <option value="Spring">Spring</option>
                        <option value="Summer">Summer</option>
                    </select>
                </div>
                <div style="margin-bottom: 10px;">
                    <label>Year:</label>
                    <select id="new-term-year">
                        ${years.map(y => `<option value="${y}">${y}</option>`).join('')}
                    </select>
                </div>
                <div style="margin-bottom: 10px;">
                    <label>Custom Name (optional):</label>
                    <input type="text" id="new-term-custom" placeholder="e.g., Study Abroad">
                </div>
            </form>
        </div>
    `);
    
    $("body").append(dialog);
    dialog.dialog({
        width: 400,
        modal: true,
        buttons: {
            "Create": function() {
                const season = $("#new-term-season").val();
                const year = $("#new-term-year").val();
                const custom = $("#new-term-custom").val();
                
                createTab({
                    season: season,
                    year: year,
                    customName: custom || null
                });
                
                $(this).dialog("close");
            },
            "Cancel": function() {
                $(this).dialog("close");
            }
        },
        close: function() {
            $(this).remove();
        }
    });
});

// Rename tab
$(".ds-rename-btn").on("click", () => {
    const currentName = $(".tab-selected").children(".tab-label").text();
    const newName = prompt("Enter new name for this tab:", currentName);
    
    if (newName && newName.trim() !== "") {
        const trimmedName = newName.trim();
        
        // Update UI
        $(".tab-selected").children(".tab-label").text(trimmedName);
        
        // Update Tab object
        const tabIndex = $(".tab").get().indexOf($(".tab-selected").get(0));
        tabs[tabIndex].name = trimmedName;

        // Update degree sheet header
        $("#ds-major-header h2").text(trimmedName);
        
        showNotification("Tab renamed successfully", "success");
    }
});