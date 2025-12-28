/*************************************
 *                  TABS
 *************************************/

let numTabs = 0;
let numAlerts = 0;

const createTab = () => {
    // make a new tab, append to div and make it selected

    // if too many say fuck you
    if (numTabs > 9) {
        if (numAlerts > 0 && Math.random() * 5 < 1) {
            alert("Why does blud need so many minors 🤨📸");
        } else {
            alert("Blud thinks they're einstein taking more than 10 majors and minors");
        }
        numAlerts++;
        return;
    }
    numTabs++;

    // find the lowest index that doesn't cause a collision
    const tabNames = $(".tab-label").get().map(x => $(x).text())
    var newTabIndex = 1
    if (tabNames.length > 0) {
        while (tabNames.includes(`Major ${newTabIndex}`)) newTabIndex++
    }

    const tabTemplate = 
    `<div class="tab">
        <p class="tab-label">Major ${newTabIndex}</p>
        <button class="close-tab-btn">
            <span style="font-family: monospace">✖</span>
        </button>
    </div>`

    const newTab = $(tabTemplate)
    newTab.on("click", () => {
        $(".tab").removeClass("tab-selected")
        newTab.addClass("tab-selected")

        // insert code for showing the current tab here
    })

    newTab.children(".close-tab-btn").on("click", () => {
        if ($(".tab").length > 1) {
            if (newTab.hasClass("tab-selected")) {
                var nextOfKin // will select after this tab dies
                // pick the tab directly after unless it's the last one
                if (newTab.next().hasClass("tab")) nextOfKin = newTab.next()
                else nextOfKin = newTab.prev() 

                newTab.remove()
                nextOfKin.click() // we are so sorry for your loss
            }
            else newTab.remove()
            numTabs--;
        }
    })

    newTab.insertBefore($("#new-tab-btn"))
    newTab.click()
}
createTab()

$("#new-tab-btn").on("click", createTab)



/*************************************
 *           DEGREE SHEET
 *************************************/

// JQUERY UI AUTOCOMPLETE
// JOON CHANGE ME PLS
$(function() {
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
                <img class="ds-item-marker" src="img/class_marker.svg" />
                <div class="ds-item-box">
                    <input placeholder="Search or select class name" />
                    <button class="ds-item-dup"></button>
                    <button class="ds-item-move"></button>
                    <button class="ds-item-delete"></button>
                </div>
            </div>`)

    newRequirement.appendTo($("#ds-items-container"))                
    currentTab.addRequirement(newRequirement);
})

$("#ds-new-dept").on("click", () => { 
    const newRequirement = 
        $(`<div class="ds-item ds-item-dept">
                <img class="ds-item-marker" src="img/dept_marker.svg" />
                <div class="ds-item-box">
                    <input placeholder="Search or select department name" />
                    <button class="ds-item-dup"></button>
                    <button class="ds-item-move"></button>
                    <button class="ds-item-delete"></button>
                </div>
            </div>`)

    newRequirement.appendTo($("#ds-items-container"))                
    currentTab.addRequirement(newRequirement);
})

$("#ds-new-attr").on("click", () => { 
    const newRequirement = 
        $(`<div class="ds-item ds-item-attr">
                <img class="ds-item-marker" src="img/attr_marker.svg" />
                <div class="ds-item-box">
                    <input placeholder="Search or select attribute name" />
                    <button class="ds-item-dup"></button>
                    <button class="ds-item-move"></button>
                    <button class="ds-item-delete"></button>
                </div>
            </div>`)

    newRequirement.appendTo($("#ds-items-container"))                
    currentTab.addRequirement(newRequirement);
})

$("#ds-new-group").on("click", () => { 
    const newRequirement = 
        $(`<p> JOON CHANGE ME </p>`)

    newRequirement.appendTo($("#ds-items-container"))                
    currentTab.addRequirement(newRequirement);
})