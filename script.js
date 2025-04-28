/*
    WHAT THE FUCK IS ORGANIZATION
    809+ LINE JS FILE GO BRRRRRRRRR
*/

// use for save/load files
function loadFile(filePath) {
    let result = null;
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status == 200) result = xmlhttp.responseText;
    else { throw new Error(xmlhttp.status) }
    return result;
}

const fall_catalog = JSON.parse(loadFile("/course-catalog/fall25.json"))
const spring_catalog = JSON.parse(loadFile("/course-catalog/spring25.json"))
const total_catalog = { ...spring_catalog, ...fall_catalog };
// runs fn on each element in catalog and returns the edited catalog. essentially array.map
const edit_catalogs = (fn, catalog) => {
    for (var a in catalog) {
        catalog[a] = fn(catalog[a])
    }

    return JSON.stringify(catalog, 4, ' ')
}

const total_catalog_no_SMFA = {}
for (var subject in total_catalog) {
    if (total_catalog[subject].location == "Medford/Somerville") total_catalog_no_SMFA[subject] = total_catalog[subject]
}

const attributes = [
    "African Cult/Lang - Diasporas",
    "African Cult/Lang-Reg Origin",
    "BFA Advanced Studio",
    "BFA All Levels Studio",
    "BFA Art History",
    "BFA Intermediate Studio",
    "BFA Introductory Studio",
    "BFA Studio Art",
    "BFA-Humanities",
    "BFA-Language/Culture",
    "BFA-Science/Technology",
    "BFA-Social Science",
    "Classical Culture/Language",
    "College Writing I",
    "College Writing II",
    "Combined Degree with The Museum School",
    "East Asian Cult/Lang-Diasporas",
    "East Asian Cult/Lang-Reg Orign",
    "First Class in Multi Sequence",
    "Foreign Language Level 22+",
    "Foreign Language Level 3+",
    "French Culture/Language",
    "Full Time Equivalent",
    "Germanic Culture/Language",
    "Graduate Research Assistantship",
    "Graduate Teaching Assistantship",
    "Hispanic Cult/Lang - Diasporas",
    "Hispanic Cult/Lang-Region Orig",
    "Italian Culture/Language",
    "Judaic Culture/Language",
    "LA-Distribution-Arts",
    "LA-Distribution-Humanities",
    "LA-Distribution-Mathematics",
    "LA-Distribution-Natural Sciences",
    "LA-Distribution-Social Sciences",
    "MFA Studio Art",
    "Middle Eastern Cult/Lang",
    "Native American Culture",
    "New Course This Semester",
    "Occupational Therapy Level II Fieldwork- Full Time",
    "Part Time Equivalent",
    "Russian Culture/Language",
    "S/SoE Asia Cult/Lang-Reg Orign",
    "SOE – Pre-Registration Eligible",
    "SOE-Computing",
    "Sign Language/Deaf Culture",
    "SoE-Engineering",
    "SoE-HASS",
    "SoE-HASS-Arts",
    "SoE-HASS-Humanities",
    "SoE-HASS-Social Sciences",
    "SoE-Mathematics",
    "SoE-Natural Sciences",
    "South/Southeast Asia Cult/Lang",
    "World Civilization Requirement"
  ]
const departments = [
    "AAST",
    "ACL",
    "AFR",
    "AMER",
    "ANTH",
    "ARB",
    "ARCH",
    "AST",
    "BIO",
    "BIOE",
    "BME",
    "CEE",
    "CER",
    "CH",
    "CHBE",
    "CHEM",
    "CHNS",
    "CIS",
    "CLS",
    "CS",
    "CSHD",
    "CST",
    "CVS",
    "DATA",
    "DEIJ",
    "DH",
    "DIG",
    "DNC",
    "DRW",
    "DRWM",
    "DS",
    "EC",
    "ECS",
    "ED",
    "EDS",
    "EE",
    "EM",
    "EN",
    "ENE",
    "ENG",
    "ENP",
    "ENT",
    "ENV",
    "ES",
    "EXP",
    "FIB",
    "FMS",
    "FR",
    "GER",
    "GIS",
    "GRA",
    "GRAC",
    "GRK",
    "HAA",
    "HEB",
    "HIST",
    "IDIS",
    "ILCS",
    "ILVS",
    "INTR",
    "ITAL",
    "JPN",
    "JS",
    "LAS",
    "LAT",
    "LING",
    "LST",
    "MATH",
    "MDIA",
    "ME",
    "MES",
    "MSE",
    "MTL",
    "MUS",
    "NU",
    "OTS",
    "PAI",
    "PAIM",
    "PE",
    "PHIL",
    "PHT",
    "PHTM",
    "PHY",
    "POR",
    "PRT",
    "PS",
    "PSY",
    "RCD",
    "REL",
    "RS",
    "RUS",
    "SCP",
    "SMFA",
    "SOC",
    "SPN",
    "STS",
    "TCS",
    "TML",
    "TPS",
    "UCOE",
    "UCPC",
    "UEP",
    "VMS",
    "WGSS",
    "MDVL",
    "ML",
    "SKT"
]

/*  Year
 *
 *  Purpose: Contains all data for a year of classes and displays them
 *           in a table
 *  Input:   Name of the year (i.e., Freshman, Sophomore, etc.)
 *           Two arrays of Courses from the course catalog; fall classes
 *           and spring classes
 */
class Year {
    constructor(name, fall_classes, spring_classes) {
        this.fall_classes = fall_classes
        this.spring_classes = spring_classes

        this.name = name;
        this.parent = $(`#${name}`);
    }

    createDisplay() {
        $(this.parent).empty();

        var title = $("<h2>").text(`${this.name[0].toUpperCase()}${this.name.slice(1)} Year`);
        $(this.parent).append(title);

        // create table and tbody
        this.table = $("<table>");
        var tblBody = $("<tbody>");

        var row = $("<tr>");

        var fall_header = $("<th>").text("FALL");
        row.append(fall_header);

        var spring_header = $("<th>").text("SPRING");
        row.append(spring_header);

        tblBody.append(`
            <tr>
                <th>FALL</th>
                <td>Credits</td>
                <th>SPRING</th>
                <td>Credits</td>
            </tr>    
        `);

        for (var i = 0; i < Math.max(this.fall_classes.length, this.spring_classes.length); i++) {
            tblBody.append(`
                <tr>
                    <td>
                        ${i < this.fall_classes.length ? this.fall_classes[i].name : ""}
                    </td>
                    <td class="credit_count">
                        ${i < this.fall_classes.length ? this.fall_classes[i].credits : ""}
                    </td>
                    <td>
                        ${i < this.spring_classes.length ? this.spring_classes[i].name : ""}
                    </td>
                    <td class="credit_count">
                        ${i < this.spring_classes.length ? this.spring_classes[i].credits : ""}
                    </td>
                </tr>
            `)
        }

        // append the tbody inside the table
        this.table.append(tblBody);
        // put table in the parent
        $(this.parent).append(this.table);
    }
}

/*  verifyTerm
 *  
 *  Purpose: Verifies that the number of credits are valid for a term
 *  Input:   An array of Courses from the course catalog
 */
const verifyTerm = (term, upperBound = 18) => {
    var totalCredits = 0
    for (var subject of term) totalCredits += subject.credits
    return 12 <= totalCredits && totalCredits <= upperBound
}



// temp DO NOT TOUCH ========================================================
const a = (catalog) => {
    do {
        var output = []

        const max_classes = 6 - Math.floor(3.0 *Math.random())
        for (var i = 0; i < max_classes; i++) {
            var selection = Object.keys(catalog)[Math.floor(Math.random() * Object.keys(catalog).length)]
            output.push(catalog[selection])
        }
    } while (!verifyTerm(output))
    return output
}


var track = [
    new Year("freshman", a(fall_catalog), a(spring_catalog)),
    new Year("sophomore", a(fall_catalog), a(spring_catalog)),
    new Year("junior", a(fall_catalog), a(spring_catalog)),
    new Year("senior", a(fall_catalog), a(spring_catalog))
]

for (const year of track) year.createDisplay()
// ==========================================================================



const create_dropdown_data = (catalog) => {
    var dropdown_data = []
    for (var class_name in catalog) {
        dropdown_data.push({
            id: class_name,
            text: catalog[class_name].name
        })
    }
    return dropdown_data
}

const smfaCheckbox = $("#allow-smfa").find('input')
smfaCheckbox.prop('checked', true)
const dropdowns = {
    all_classes: create_dropdown_data(total_catalog),
    no_smfa: create_dropdown_data(total_catalog_no_SMFA),
    departments: departments,
    attributes: attributes
}

const edit_tab_name = (tab, newName) => {
    var oldID = tab.attr("id")
    tab.find(".tab-title")[0].innerText = newName
    tab.attr("id", newName)
    tab.find(`#${oldID}-requirements`).attr("id", `${newName}-requirements`)

    // button change
    const tabIndex = requirements_ids.indexOf(oldID)
    requirements_ids[tabIndex] = newName
    $("#requirements").children("button")[tabIndex].innerText = newName
}

const delete_tab = (tab) => {
    const id = tab.attr("id")
    const tabIndex = requirements_ids.indexOf(id)

    // remove button
    requirements_ids.splice(tabIndex, 1)
    $($("#requirements").children("button")[tabIndex]).remove()

    // remove tab data
    $(`#${id}`).remove()
    
    // select another tab
    $("#requirements").children("button")[tabIndex < requirements_ids.length ? tabIndex : tabIndex - 1].click()
}

var requirements_ids = []
const create_requirements_tab = (id) => {
    const tab = $(`
         <div class="requirements-tab" id=${id}>
            <h3>
                <span class=tab-title>${id}</span> 
                <button class="rename-tab-button">✏️</button>
                <button class="delete-tab-button">❌</button>
            </h3>

            <div id="${id}-requirements">
                <table>
                </table>
            </div>
            <br>

            <div>
                Add new requirements <br>
                <button class="new-class-button">By class name</button>
                <button class="new-department-button">By department</button>
                <button class="new-attribute-button">By attribute</button>
                <button class="new-multi-class-button">"Pick one of..."</button>
            </div>
        </div>    
    `)

    // make a new subject
    const create_dropdown = (dropdown_class, data, placeholder_text, preface = "", attach_to = "") => () => {
        // Create dropdown container
        const containerId = `dropdown-${Date.now()}`;
        var borderAddition =  ``
        if (dropdown_class != 'multi-class' && dropdown_class != 'multi-attribute' && dropdown_class != 'multi-department') {
            borderAddition = `class="dropdown-separator"`
        }
        const container = $(`
            <tr ${borderAddition}>
                <div class="dropdown-container" id="${containerId}">
                    <td>
                        ${preface}
                        <select class="select ${dropdown_class}-select" data-id="${containerId}">
                            <option value=""></option>
                        </select>
                    </td>
                    <td>
                        <button class="up-btn" data-container="${containerId}">🔼</button>
                        <button class="down-btn" data-container="${containerId}">🔽</button>
                        <button class="remove-btn" data-container="${containerId}">❌</button>
                        <button class="duplicate-btn" data-container="${containerId}">📋</button>

                        <span class="prereqs"></span>
                    </td>
                </div>
            </tr>
        `);
        
        if (attach_to == "") reqirements_contents.children("table").append(container)
        else $(attach_to).children("table").append(container)

        var selector = container.find("select")
        selector.select2({
            data: data,
            placeholder: placeholder_text,
            allowClear: true,
            width: '100%'
        });

        container.find(".up-btn").click(() => { container.insertBefore(container.prev()) })
        container.find(".down-btn").click(() => { container.insertAfter(container.next()) })
        container.find(".remove-btn").click(() => { container.remove(); fetch_classes() })
        container.find(".duplicate-btn").click(() => {
            var duplicate = create_dropdown(dropdown_class, data, placeholder_text, preface)()

            duplicate.find("select").val(selector.val()).trigger("change")
            duplicate.insertAfter(container)

            fetch_classes()
        })


        // Handle selection change
        container.find("select").on("change", function () {
            fetch_classes()
        });

        return container
    }

    tab.find(".rename-tab-button").click(() => {
        // ensure no duplicate names
        var newName = prompt("Enter new name for requirement")
        if (newName.length == 0 || newName == null || newName == undefined) return

        var duplicateNumber = 2
        while (requirements_ids.includes(newName)) {newName = `${newName}${duplicateNumber++}`}
        
        // edit the header and shit
        // id change
        edit_tab_name(tab, newName)
    })
    tab.find(".delete-tab-button").click(() => {
        if (requirements_ids.length == 1) return

        delete_tab(tab)
    })

    tab.find(".new-class-button").click(create_dropdown("class", smfaCheckbox.is(':checked') ? dropdowns.all_classes : dropdowns.no_smfa, "Search or select class name"));
    tab.find(".new-department-button").click(create_dropdown("department", dropdowns.departments, "Search or select department", "Any class in "));
    tab.find(".new-attribute-button").click(create_dropdown("attribute", dropdowns.attributes, "Search or select attribute", "Any class with attribute "));
    tab.find(".new-multi-class-button").click(() => {
        const containerId = `multi-select-${Date.now()}`;
        const container = $(`
            <tr class="dropdown-separator">
                <div>
                    <td>
                    One of:
                    <button class="new-multi-class-button">By class name</button>
                    <button class="new-multi-department-button">By department</button>
                    <button class="new-multi-attribute-button">By attribute</button>
                        <div id=${containerId}>
                            <table class="multi-select">
                            </table>
                        </div>
                    </td>

                    <td>
                        <button class="up-btn">🔼</button>
                        <button class="down-btn">🔽</button>
                        <button class="remove-btn">❌</button>
                        <button class="duplicate-btn">📋</button>
                    </td>
                </div>
            </tr>
        `)
        // multiselect add new class buttons
        container.find(".new-multi-class-button").click(create_dropdown("multi-class", dropdowns.all_classes, "Search or select class name", "", `#${containerId}`));
        container.find(".new-multi-department-button").click(create_dropdown("multi-department", dropdowns.departments, "Search or select department", "Any class in ", `#${containerId}`));
        container.find(".new-multi-attribute-button").click(create_dropdown("multi-attribute", dropdowns.attributes, "Search or select attribute", "Any class with attribute ", `#${containerId}`));
        // multiselect edit class buttons
        container.find(".up-btn").click(() => { container.insertBefore(container.prev()) })
        container.find(".down-btn").click(() => { container.insertAfter(container.next()) })
        container.find(".remove-btn").click(() => { container.remove(); fetch_classes() })
        container.find(".duplicate-btn").click(() => {
            var duplicate = create_dropdown(dropdown_class, data, placeholder_text, preface)()

            duplicate.find("select").val(selector.val()).trigger("change")
            duplicate.insertAfter(container)

            fetch_classes()
        })

        reqirements_contents.children("table").append(container)

        container.click(() => { if (container.find(".multi-select").children().length == 0) container.remove() })
    });

    $("#requirement-tabs").prepend(tab)
    const reqirements_contents = $(`#${id}-requirements`)

    return tab
}

const update_tab_selection = () => {
    const tabs = $("#requirements")

    for (var i = 0; i < tabs.children().length - 1; i++) {
        const button = $(tabs.children()[i])
        var selected_requirement = requirements_ids[i]
        if (button.hasClass("active")) $(`#${selected_requirement}`).attr("style", "display:block;")
        else $(`#${selected_requirement}`).attr("style", "display:none;")
    }
}

const new_tab_button = $("#new-requirement")
const create_new_tab = (name="Minor") => {
    var tab_name = name
    var index = 2
    while (requirements_ids.includes(tab_name)) tab_name = `Minor${index++}`
    requirements_ids.push(tab_name)

    const tab = $(`<button class="tab">${tab_name}</button>`)
    tab.click(() => {
        $(".tab").removeClass("active")
        tab.addClass("active")
        update_tab_selection()
    })
    tab.insertBefore(new_tab_button)

    return create_requirements_tab(tab_name)
}
new_tab_button.click(() => {create_new_tab()})

create_new_tab("Major")
$($("#requirements").find("button")[0]).click()


const updateClassSelection = () => {
    $(".class-select").empty().select2({
        data: smfaCheckbox.is(':checked') ? dropdowns.all_classes : dropdowns.no_smfa,
        placeholder: "Search or select class name",
        allowClear: true,
        width: '100%'
    })
}
smfaCheckbox.click(updateClassSelection)
updateClassSelection()


const dropdown_enum = {
    class: 0,
    attribute: 1,
    subject: 2,
    department: 3,
    multi: 4,
}

class Selection {
    constructor(type, config) {
        this.type = type
        this.config = config;

        this.locked = type == dropdown_enum.class;
    }
}

var selected_requirements = []
const fetch_classes = () => {
    selected_requirements = []
    var output = []

    for (const requirements_id of requirements_ids) {
        var classes = []
        var attributes = []
        var departments = []
        var multis = []

        const req_tab = $($(`#${requirements_id}`)[0])
        const classSelects = req_tab.find(`.class-select`)
        for (var i = 0; i < classSelects.length; i++) {
            const selection = $(classSelects[i]).select2("data")
            if (selection.length > 0 && selection[0].text != '') {
                const entry = new Selection(dropdown_enum.class, [selection[0].text.split(':')[0]])
                classes.push(entry)
                selected_requirements.push(entry)
            }
        }

        const attributeSelects = req_tab.find(`.attribute-select`)
        for (var i = 0; i < attributeSelects.length; i++) {
            const selection = $(attributeSelects[i]).select2("data")
            if (selection.length > 0 && selection[0].text != '') {
                const entry = new Selection(dropdown_enum.attribute, [selection[0].text])
                attributes.push(entry)
                selected_requirements.push(entry)
            }
        }

        const departmentSelects = req_tab.find(`.department-select`)
        for (var i = 0; i < departmentSelects.length; i++) {
            const selection = $(departmentSelects[i]).select2("data")
            if (selection.length > 0 && selection[0].text != '') {
                const entry = new Selection(dropdown_enum.department, [selection[0].text])
                departments.push(entry)
                selected_requirements.push(entry)
            }
        }

        const multiSelects = req_tab.find(`.multi-select`)
        for (var i = 0; i < multiSelects.length; i++) {
            const selects = $(multiSelects[i]).find("select")
            const selections = []

            for (var j = 0; j < selects.length; j++) {
                const selection = $(selects[j]).select2("data")
                if (selection.length > 0 && selection[0].text != '') {
                    selections.push(selection[0].text.split(':')[0])
                }
            }

            if (selections.length > 0) {
                const entry = new Selection(dropdown_enum.multi, selections)
                multis.push(entry)
                selected_requirements.push(entry)
            }
        }
        
        if (classes.length > 0 || attributes.length > 0 || departments.length > 0 || multis.length > 0) {
            output.push({
                name: requirements_id,
                classes: classes,
                attributes: attributes,
                departments: departments,
                multis: multis
            })
        }
    }

    exportReq(output)
}


const exportReq = (input) => {
    var output = ""

    for (const tab of input) {
        output += `${tab.name} requires\n`

        const classes = tab.classes
        if (classes.length > 0) {
            output += "\tTHE FOLLOWING CLASSES:\n"
            for (const subject of classes) output += `\t\t${subject.config[0]}\n`
        }

        const attributes = tab.attributes
        if (attributes.length > 0) {
            output += "\tONE CLASS WITH ATTRIBUTES:\n"
            for (const attribute of attributes) output += `\t\t${attribute.config[0]}\n`
        }

        const departments = tab.departments
        if (departments.length > 0) {
            output += "\tONE CLASS IN DEPARTMENT:\n"
            for (const department of departments) output += `\t\t${department.config[0]}\n`
        }

        const multis = tab.multis
        if (multis.length > 0) {
            for (const multi of multis) {
                output += "\tONE OF THE FOLLOWING CLASSES:\n"
                for (const option of multi.config) output += `\t\t${option}\n`
            }
        }
    }

    var file = new Blob([output], {type: "text/plain"});
    const downloadButton = $("#export-req")[0]
    downloadButton.href = URL.createObjectURL(file)
    downloadButton.download = "course-requirements.txt"
}

const requirementInput = $("#import-req").find("input")
requirementInput.change(() => {
    const file = requirementInput.prop('files')[0]
    if (file != null) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const contents = e.target.result.split('\n').map(x => x.split('\t').join(''));
            
            const get_category = (line) => (
                {
                    "THE FOLLOWING CLASSES:": "CLASSES",
                    "ONE CLASS WITH ATTRIBUTES:": "ATTRIBUTES",
                    "ONE CLASS IN DEPARTMENT:": "DEPARTMENTS",
                    "ONE OF THE FOLLOWING CLASSES:": "MULTI"
                }[line]
            )

            var category = undefined
            var current_tab = null
            var current_multi_box = null
            smfaCheckbox.prop('checked', true)

            // parse input
            for (const line of contents) {
                if (line.length == 0) break 
                // category
                if (get_category(line) != undefined) {
                    category = get_category(line)
                    if (category == "MULTI") {
                        if (current_tab == null) window.location.reload() // oops

                        if (current_multi_box != null) {
                            var delete_buttons = current_multi_box.find(".remove-btn")
                            $(delete_buttons[delete_buttons.length - 1]).click()
                        }

                        current_tab.find(".new-multi-class-button").click()

                        current_multi_box = $(current_tab.find(".multi-select")[current_tab.find(".multi-select").length - 1])
                        current_multi_box.find(".remove-btn")[1].click()
                    }
                }
                // name
                else if (line.includes(" requires")) {
                    if (current_multi_box != null) {
                        var delete_buttons = current_multi_box.find(".remove-btn")
                        $(delete_buttons[delete_buttons.length - 1]).click()
                        current_multi_box = null
                    }

                    const tab_name = line.slice(0, line.length - 9)
                    current_tab = create_new_tab(tab_name)
                    $("#requirements").find("button")[requirements_ids.length - 1].click()
                }
                // everything else
                else {
                    if (current_tab == null) window.location.reload() // oops

                    switch(category) {
                        case "CLASSES":
                            if (!Object.keys(total_catalog).includes(line)) {
                                console.error(`Unknown class "${line}". Was it removed from the catalog?`)
                                break
                            }
                            current_tab.find(".new-class-button").click()

                            var dropdowns = current_tab.find("select")
                            $(dropdowns[dropdowns.length - 1]).val(line).trigger("change")
                            break
                        case "ATTRIBUTES":
                            if (!attributes.includes(line)) {
                                console.error(`Unknown attribute "${line}".`)
                                break
                            }
                            current_tab.find(".new-attribute-button").click()

                            var dropdowns = current_tab.find("select")
                            $(dropdowns[dropdowns.length - 1]).val(line).trigger("change")
                            break
                        case "DEPARTMENTS":
                            if (!departments.includes(line)) {
                                console.error(`Unknown department "${line}".`)
                                break
                            }
                            current_tab.find(".new-department-button").click()

                            var dropdowns = current_tab.find("select")
                            $(dropdowns[dropdowns.length - 1]).val(line).trigger("change")
                            break
                        case "MULTI":
                            if (current_multi_box == null) window.location.reload() // oops

                            var dropdowns = current_multi_box.find("Select")
                            $(dropdowns[dropdowns.length - 1]).val(line).trigger("change")

                            var duplication_buttons = current_multi_box.find(".duplicate-btn")
                            $(duplication_buttons[duplication_buttons.length - 1]).click()
                            break
                    }
                }
            }

            if (current_multi_box != null) {
                var delete_buttons = current_multi_box.find(".remove-btn")
                $(delete_buttons[delete_buttons.length - 1]).click()
            }
        };
        
        // clear all tabs
        $(".delete-tab-button").click()
        edit_tab_name($(`#${requirements_ids[0]}`), `delete-me`)
        try {delete_tab($(`#delete-me`))}
        catch(err) {}

        reader.readAsText(file);
    }
})