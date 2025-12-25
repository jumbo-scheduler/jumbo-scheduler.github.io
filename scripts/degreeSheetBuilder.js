/*************************************
 *                  TABS
 *************************************/

const createTab = () => {
    // make a new tab, append to div and make it selected

    // find the lowest index that doesn't cause a collision
    const tabNames = $(".tab-label").get().map(x => $(x).text())
    var newTabIndex = 1
    if (tabNames.length > 0) {
        while (tabNames.includes(`Major ${newTabIndex}`)) newTabIndex++
    }

    const tabTemplate = 
    `<div class="tab">
        <p class="tab-label">Major ${newTabIndex}</p>
        <button class="close-tab-button">
            <span style="font-family: monospace">✖</span>
        </button>
    </div>`

    const newTab = $(tabTemplate)
    newTab.on("click", () => {
        $(".tab").removeClass("tab-selected")
        newTab.addClass("tab-selected")

        // insert code for showing the current tab here
    })

    newTab.children(".close-tab-button").on("click", () => {
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
        }
    })

    newTab.insertBefore($("#new-tab-button"))
    newTab.click()
}
createTab()

$("#new-tab-button").on("click", createTab)