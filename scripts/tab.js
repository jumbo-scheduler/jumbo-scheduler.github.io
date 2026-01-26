/*************************************
 *                  TABS
 *************************************/

let numTabs = 0;
let numAlerts = 0;

class Tab {
    constructor(name) {
        this.name = name;
        this.requirements = [] // pointer to each html requirement element
    }

    addRequirement(reqElement) {
        this.requirements.push(reqElement);
    }

    display() {
        // display all requirements in degree sheet
        for (let req of this.requirements) {
            $("#ds-items-container").append(req)
        }
    }
}

const tabs = []
var currentTab = null;

const onTabChange = (newTab) => {
    currentTab = newTab || currentTab

    // update degree sheet to reflect current tab
    $("#ds-major-header h2").text(currentTab.name)

    // clear previous requirements 
    $("#ds-items-container").empty()

    // display new requirements
    currentTab.display()
}

const createTab = () => {
    // make a new tab, append to div and make it selected

    // if too many say fuck you
    if (numTabs > 9) {
        alert("Bro is NOT graduating")
        return;
    }
    numTabs++;

    // find the lowest index that doesn't cause a collision
    const tabNames = $(".tab-label").get().map(x => $(x).text())
    var newTabIndex = 1
    if (tabNames.length > 0) {
        while (tabNames.includes(`Term ${newTabIndex}`)) newTabIndex++
    }

    const tabTemplate = 
    `<div class="tab">
        <p class="tab-label">Term ${newTabIndex}</p>
        <button class="close-tab-btn">
            <span style="font-family: monospace">✖</span>
        </button>
    </div>`

    const newTab = $(tabTemplate)
    newTab.on("click", () => {
        $(".tab").removeClass("tab-selected")
        newTab.addClass("tab-selected")

        onTabChange(tabs[$(".tab").get().indexOf(newTab.get(0))])
    })

    newTab.children(".close-tab-btn").on("click", () => {
        if ($(".tab").length > 1 && confirm("Are you sure you want to delete this tab?")) {
            // remove from tabs array
            const tabIndex = $(".tab").get().indexOf(newTab.get(0))
            tabs.splice(tabIndex, 1)

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

    // create the corresponding Tab object
    currentTab = new Tab(`Term ${newTabIndex}`)
    tabs.push(currentTab)

    newTab.insertBefore($("#new-tab-btn"))
    newTab.click()
}
createTab()

$("#new-tab-btn").on("click", createTab)

// rename tab
$(".ds-rename-btn").on("click", () => {
    const newName = prompt("Enter new name for this major/minor (JOON UN-UGLY THIS PLS):", $(".tab-selected").children(".tab-label").text())
    if (newName != null && newName.trim() != "") {
        $(".tab-selected").children(".tab-label").text(newName.trim())
        // also rename the Tab object
        const tabIndex = $(".tab").get().indexOf($(".tab-selected").get(0))
        tabs[tabIndex].name = newName.trim()

        // also rename the degree sheet header
        $("#ds-major-header h2").text(newName.trim())
    }
})