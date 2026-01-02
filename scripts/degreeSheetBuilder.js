/*************************************
 *           DEGREE SHEET
 *************************************/

let showColorMarkers = false;


// JQUERY UI INITIALIZATIONS
$(function() {
    // JQUERY UI AUTOCOMPLETE -------------------------------
    // JOON CHANGE ME PLS
    let classesArr = Object.keys(total_catalog).map(key => total_catalog[key].name);
    let deptsArr = Object.keys(departmentsPlaintext).map(key => `${key}: ${departmentsPlaintext[key]}`);

    $(".ds-item-CLASS").find("input").autocomplete({
        source: classesArr
    });
    $(".ds-item-DEPT").find("input").autocomplete({
        source: deptsArr
    });
    $(".ds-item-ATTR").find("input").autocomplete({
        source: allAttributes
    });
});


// new requirement buttons
$("#ds-new-class").on("click", () => { 
    const newRequirement = 
        $(`<div class="ds-item ds-item-class">
                <img class="ds-item-marker" src="${showColorMarkers ? "img/class_marker_color.svg" : "img/class_marker.svg"}" />
                <div class="ds-item-box">
                    <input placeholder="Search or select class name" />
                    <button class="ds-item-btn ds-item-dup"><img src="img/dup_icon.svg" /></button>
                    <button class="ds-item-btn ds-item-delete"><img src="img/trash_icon.svg" /></button>
                    <button class="ds-item-btn ds-item-move"><img src="img/drag_icon.svg" /></button>
                </div>
            </div>`)

    newRequirement.appendTo($("#ds-items-container"))                
    currentTab.addRequirement(newRequirement);
})

$("#ds-new-dept").on("click", () => { 
    const newRequirement = 
        $(`<div class="ds-item ds-item-dept">
                <img class="ds-item-marker" src="${showColorMarkers ? "img/dept_marker_color.svg" : "img/dept_marker.svg"}" />
                <div class="ds-item-box">
                    <input placeholder="Search or select department name" />
                    <button class="ds-item-btn ds-item-dup"><img src="img/dup_icon.svg" /></button>
                    <button class="ds-item-btn ds-item-delete"><img src="img/trash_icon.svg" /></button>
                    <button class="ds-item-btn ds-item-move"><img src="img/drag_icon.svg" /></button>
                </div>
            </div>`)

    newRequirement.appendTo($("#ds-items-container"))                
    currentTab.addRequirement(newRequirement);
})

$("#ds-new-attr").on("click", () => { 
    const newRequirement = 
        $(`<div class="ds-item ds-item-attr">
                <img class="ds-item-marker" src="${showColorMarkers ? "img/attr_marker_color.svg" : "img/attr_marker.svg"}" />
                <div class="ds-item-box">
                    <input placeholder="Search or select attribute name" />
                    <button class="ds-item-btn ds-item-dup"><img src="img/dup_icon.svg" /></button>
                    <button class="ds-item-btn ds-item-delete"><img src="img/trash_icon.svg" /></button>
                    <button class="ds-item-btn ds-item-move"><img src="img/drag_icon.svg" /></button>
                </div>
            </div>`)

    newRequirement.appendTo($("#ds-items-container"))                
    currentTab.addRequirement(newRequirement);
})

$("#ds-new-group").on("click", () => { 
    const newRequirement = 
        $(`<div class="ds-item ds-item-group">
                <div class="ds-group-box">
                    <div class="ds-group-header">
                        <div class="ds-group-header-left">
                            <button class="ds-collapse-btn">
                            <img src="img/dropdown.svg" />
                            </button>
                            <h2>GROUP NAME HERE</h2>
                            <button class="ds-rename-btn">
                                <img src="img/edit.svg" />
                            </button>
                            <input type="color" class="group-color" value="#fff" colorspace="limited-rgb" />
                        </div>
                        <div class="ds-group-header-right">
                            <button class="ds-item-btn ds-item-dup"><img src="img/dup_icon.svg" /></button>
                            <button class="ds-item-btn ds-item-delete"><img src="img/trash_icon.svg" /></button>
                            <button class="ds-item-btn ds-item-move"><img src="img/drag_icon.svg" /></button>
                        </div>
                    </div>
                    <div class="ds-group-content">
                        <div class="ds-item ds-item-attr">
                            <img class="ds-item-marker" src="img/attr_marker.svg" />
                            <div class="ds-item-box">
                                <input placeholder="Search or select attribute name" />
                                <button class="ds-item-btn ds-item-dup"><img src="img/dup_icon.svg" /></button>
                                <button class="ds-item-btn ds-item-delete"><img src="img/trash_icon.svg" /></button>
                                <button class="ds-item-btn ds-item-move"><img src="img/drag_icon.svg" /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`)

    newRequirement.appendTo($("#ds-items-container"))                
    currentTab.addRequirement(newRequirement);
})