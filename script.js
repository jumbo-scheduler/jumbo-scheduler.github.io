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


const attributes = [
    "BFA-Language/Culture",
    "BFA-Social Science",
    "LA-Distribution-Social Sciences",
    "SoE-HASS",
    "SoE-HASS-Social Sciences",
    "World Civilization Requirement",
    "BFA-Science/Technology",
    "LA-Distribution-Natural Sciences",
    "Native American Culture",
    "African Cult/Lang - Diasporas",
    "LA-Distribution-Arts",
    "SoE-HASS-Arts",
    "African Cult/Lang-Reg Origin",
    "Middle Eastern Cult/Lang",
    "BFA-Humanities",
    "LA-Distribution-Humanities",
    "SoE-HASS-Humanities",
    "First Class in Multi Sequence",
    "Foreign Language Level 3+",
    "Foreign Language Level 22+",
    "Judaic Culture/Language",
    "BFA Art History",
    "Classical Culture/Language",
    "Italian Culture/Language",
    "East Asian Cult/Lang-Reg Orign",
    "SoE-Natural Sciences",
    "LA-Distribution-Mathematics",
    "SoE-Engineering",
    "Part Time Equivalent",
    "Full Time Equivalent",
    "Graduate Teaching Assistantship",
    "Graduate Research Assistantship",
    "SOE – Pre-Registration Eligible",
    "SOE-Computing",
    "SoE-Mathematics",
    "BFA Studio Art",
    "MFA Studio Art",
    "BFA Advanced Studio",
    "East Asian Cult/Lang-Diasporas",
    "S/SoE Asia Cult/Lang-Reg Orign",
    "South/Southeast Asia Cult/Lang",
    "Sign Language/Deaf Culture",
    "New Course This Semester",
    "BFA Intermediate Studio",
    "BFA All Levels Studio",
    "BFA Introductory Studio",
    "College Writing I",
    "College Writing II",
    "Germanic Culture/Language",
    "Russian Culture/Language",
    "Hispanic Cult/Lang - Diasporas",
    "French Culture/Language",
    "Hispanic Cult/Lang-Region Orig",
    "Occupational Therapy Level II Fieldwork- Full Time",
    "Combined Degree with The Museum School"
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

class Year {
    constructor(name, fall_classes, spring_classes) {
        this.fall_classes = fall_classes
        this.spring_classes = spring_classes

        this.name = name;
        this.parent = $(`#${name}`);
    }

    createDisplay() {
        $(this.parent).empty();

        var title = $('<h2>').text(`${this.name[0].toUpperCase()}${this.name.slice(1)} Year`);
        $(this.parent).append(title);

        // create table and tbody
        this.table = $('<table>');
        var tblBody = $('<tbody>');

        var row = $('<tr>');

        var fall_header = $('<th>').text("FALL");
        row.append(fall_header);

        var spring_header = $('<th>').text("SPRING");
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

const verifyTerm = (term) => {
    var totalCredits = 0
    for (var subject of term) totalCredits += subject.credits
    return 12 <= totalCredits && totalCredits <= 18
}

// temp
const a = (catalog) => {
    do {
        var output = []
        for (var i = 0; i < 6; i++) {
            var selection = Object.keys(catalog)[Math.floor(Math.random() * Object.keys(catalog).length)]
            output.push(catalog[selection])
        }
    } while (!verifyTerm(output))
    return output
}


var track = [
    new Year('freshman', a(fall_catalog), a(spring_catalog)),
    new Year('sophomore', a(fall_catalog), a(spring_catalog)),
    new Year('junior', a(fall_catalog), a(spring_catalog)),
    new Year('senior', a(fall_catalog), a(spring_catalog))
]

for (const year of track) year.createDisplay()

const create_dropdown_data = (catalog) => {
    var dropdown_data = []
    var index = 0
    for (var class_name in total_catalog) {
        dropdown_data.push({
            id: index++,
            text: catalog[class_name].name
        })
    }
    return dropdown_data
}

const dropdowns = {
    all_classes: create_dropdown_data(total_catalog),
    departments: departments,
    attributes: attributes
}

var requirements_ids = ["Major"]
const create_requirements_tab = (id='Minor') => {
    const tab = $(`
         <div class="requirements-tab" id=${id}>
            <h3>${id}</h3>

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
                <button class="new-wildcard-button">"Pick one of..."</button>
            </div>
        </div>    
    `)
    
    // make a new subject
    const create_dropdown = (dropdown_class, data, placeholder_text, preface = '', parent = `#${id}-requirements`) => () => {
        // Create dropdown container
        const containerId = `dropdown-${Date.now()}`;
        const container = $(`
            <tr>
                <div class="dropdown-container" id="${containerId}">
                    <td>
                        ${preface}
                        <select class="${dropdown_class}-select" data-id="${containerId}" style="width: 50%">
                            <option value=""></option>
                        </select>
                    </td>
                    <td>
                        <button class="up-btn" data-container="${containerId}">U</button>
                        <button class="down-btn" data-container="${containerId}">D</button>
                        <button class="remove-btn" data-container="${containerId}">X</button>
                        <button class="duplicate-btn" data-container="${containerId}">Duplicate</button>

                        <span class="prereqs"></span>
                    </td>
                </div>
            </tr>
        `);
        $(parent).children('table').append(container)

        var selector = container.find('select')
        selector.select2({
            data: data,
            placeholder: placeholder_text,
            allowClear: true
        });

        container.find('.up-btn').click(() => { container.insertBefore(container.prev()) })
        container.find('.down-btn').click(() => { container.insertAfter(container.next()) })
        container.find('.remove-btn').click(() => { container.remove() })
        container.find(".duplicate-btn").click(() => {
            var duplicate = create_dropdown(dropdown_class, data, placeholder_text, preface)()

            duplicate.find('select').val(selector.val()).trigger('change')
            duplicate.insertAfter(container)
        })


        // Handle selection change
        // prereqs
        container.find('select').on('change', function () {
            const selected = $(this).val();
            // container.find('.prereqs').text(data[selected] == undefined ? '' : `Prereqs: ${total_catalog[data[selected].text.split(':')[0]].prereqs}`)
        });

        return container
    }

    tab.find('.new-class-button').click(create_dropdown("class", dropdowns.all_classes, "Search or select class name"));
    tab.find('.new-department-button').click(create_dropdown("department", dropdowns.departments, "Search or select department", 'Any class in '));
    tab.find('.new-attribute-button').click(create_dropdown("attribute", dropdowns.attributes, "Search or select attribute", 'Any class with attribute '));
    tab.find('.new-wildcard-button').click(() => {
        const containerId = `multi-select-${Date.now()}`;
        const container = $(`
            <tr>
                <div class="multi-select">
                    <td>
                    One of:            
                        <div id=${containerId}>
                            <table class="multi-selections">
                            </table>
                        </div>
                    </td>

                    <td>
                        <button class="up-btn">U</button>
                        <button class="down-btn">D</button>
                        <button class="remove-btn">X</button>
                    </td>
                </div>
            </tr>
        `)
        container.find('.up-btn').click(() => { container.insertBefore(container.prev()) })
        container.find('.down-btn').click(() => { container.insertAfter(container.next()) })
        container.find('.remove-btn').click(() => { container.remove() })

        $(`#${id}-requirements`).children('table').append(container)

        create_dropdown("class", dropdowns.all_classes, "Search or select class name", '', `#${containerId}`)()
        create_dropdown("class", dropdowns.all_classes, "Search or select class name", '', `#${containerId}`)()

        container.click(() => { if (container.find('.multi-selections').children().length == 0) container.remove() })
    });

    $('#requirement-tabs').append(tab)

    return tab
}

var major = create_requirements_tab('Major')
const update_tab_selection = () => {
    const tabs = $('#requirements')

    for (var i = 0; i < tabs.children().length - 1; i++) {
        const button = $(tabs.children()[i])
        var selected_requirement = requirements_ids[i]
        if (button.hasClass('active')) $(`#${selected_requirement}`).attr('style', 'display:block;')
        else $(`#${selected_requirement}`).attr('style', 'display:none;')
    }
}
update_tab_selection();