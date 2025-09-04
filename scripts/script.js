/* script.js
 * handles back end and global variables (mostly the class catalog)
*/

// helper functions
//#region =====================================================
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

// runs fn on each element in catalog (an object) and returns the edited catalog. essentially array.map
const edit_catalogs = (fn, catalog) => {
    for (var a in catalog) {
        catalog[a] = fn(catalog[a])
    }

    return JSON.stringify(catalog, 4, ' ')
}

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

function parseCatalog(name) {
    return JSON.parse(loadFile(`/course-catalog/${name}`))
}

function mergeCatalogs(main, toMerge) {
    var output = main
    for (let subject in toMerge) {
        if (main[subject] == undefined) main[subject] = toMerge[subject]
        else {
            main[subject].offeredInSpring = main[subject].offeredInSpring || toMerge[subject].offeredInSpring
            main[subject].offeredInFall = main[subject].offeredInFall || toMerge[subject].offeredInFall
        }
    }
    return output
}
//#endregion =====================================================

const total_catalog = parseCatalog("catalog.json");

const class_names = Object.keys(total_catalog);
// tags
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

parsePrereqs(total_catalog)


const fall_catalog = {}
const spring_catalog = {}
const total_catalog_no_SMFA = {}
for (var subject in total_catalog) {
    if (total_catalog[subject].location == "Medford/Somerville") total_catalog_no_SMFA[subject] = total_catalog[subject]
    if (total_catalog[subject].offeredInFall) fall_catalog[subject] = total_catalog[subject]
    if (total_catalog[subject].offeredInSpring) spring_catalog[subject] = total_catalog[subject]
}

