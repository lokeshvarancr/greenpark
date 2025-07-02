"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
// --- CONFIGURATION ---
var SRC_DIR = path_1.default.join(__dirname, "src");
var COMPONENTS_DIR = path_1.default.join(SRC_DIR, "components");
var DASHBOARD_COMPONENTS_DIR = path_1.default.join(SRC_DIR, "dashboard", "components");
var pageFolders = [
    { name: "IndividualQuestionsElements", keywords: ["IndividualQuestions"] },
    { name: "PerformanceInsightsElements", keywords: ["PerformanceInsights"] },
    { name: "PerformancetabElements", keywords: ["Performancetab", "PerformanceTab"] },
    { name: "Section1DashboardElements", keywords: ["Section1Dashboard", "SectionOneDashboard"] },
];
var TYPE_KEYWORDS = [
    { type: "charts", keywords: ["Chart", "Gauge", "Donut"] },
    { type: "cards", keywords: ["Card", "Badge"] },
    { type: "tables", keywords: ["Table"] },
    { type: "filters", keywords: ["Filter", "Dropdown"] },
    { type: "modals", keywords: ["Modal"] },
    { type: "layout", keywords: ["Layout"] },
];
// --- HELPERS ---
function getAllFiles(dir, ext) {
    if (ext === void 0) { ext = ".tsx"; }
    var results = [];
    for (var _i = 0, _a = fs_1.default.readdirSync(dir); _i < _a.length; _i++) {
        var file = _a[_i];
        var full = path_1.default.join(dir, file);
        if (fs_1.default.statSync(full).isDirectory()) {
            results = results.concat(getAllFiles(full, ext));
        }
        else if (file.endsWith(ext)) {
            results.push(full);
        }
    }
    return results;
}
function findComponentUsages(componentName, searchDirs) {
    var usages = [];
    for (var _i = 0, searchDirs_1 = searchDirs; _i < searchDirs_1.length; _i++) {
        var dir = searchDirs_1[_i];
        for (var _a = 0, _b = getAllFiles(dir, ".tsx"); _a < _b.length; _a++) {
            var file = _b[_a];
            var content = fs_1.default.readFileSync(file, "utf8");
            // Simple heuristic: look for <ComponentName or import ... from '.../ComponentName'
            if (new RegExp("<".concat(componentName, "[\\s>]")).test(content) ||
                new RegExp("import .*".concat(componentName, ".*from")).test(content)) {
                usages.push(file);
            }
        }
    }
    return usages;
}
function classifyType(filename) {
    for (var _i = 0, TYPE_KEYWORDS_1 = TYPE_KEYWORDS; _i < TYPE_KEYWORDS_1.length; _i++) {
        var _a = TYPE_KEYWORDS_1[_i], type = _a.type, keywords = _a.keywords;
        if (keywords.some(function (k) { return filename.includes(k); }))
            return type;
    }
    return "misc";
}
function updateImports(oldPath, newPath) {
    var allFiles = getAllFiles(SRC_DIR, ".tsx").concat(getAllFiles(SRC_DIR, ".ts"));
    for (var _i = 0, allFiles_1 = allFiles; _i < allFiles_1.length; _i++) {
        var file = allFiles_1[_i];
        var content = fs_1.default.readFileSync(file, "utf8");
        var relOld = "./" + path_1.default.relative(path_1.default.dirname(file), oldPath).replace(/\\/g, "/").replace(/\.tsx?$/, "");
        var relNew = "./" + path_1.default.relative(path_1.default.dirname(file), newPath).replace(/\\/g, "/").replace(/\.tsx?$/, "");
        // Replace both with and without file extension
        content = content.replace(new RegExp(relOld, "g"), relNew);
        fs_1.default.writeFileSync(file, content, "utf8");
    }
}
// --- MAIN LOGIC ---
function main() {
    var componentFiles = getAllFiles(COMPONENTS_DIR, ".tsx");
    // Find all possible page files for usage search
    var pageDirs = getAllFiles(path_1.default.join(SRC_DIR, "dashboard", "pages"), ".tsx");
    for (var _i = 0, componentFiles_1 = componentFiles; _i < componentFiles_1.length; _i++) {
        var file = componentFiles_1[_i];
        var name_1 = path_1.default.basename(file, ".tsx");
        var usages = findComponentUsages(name_1, [SRC_DIR]); // Search all src for usage
        if (usages.length === 0)
            continue; // Not used in any page, skip or move to misc
        // Find the best matching page folder by keyword
        var matchedPageFolder = null;
        var _loop_1 = function (usage) {
            for (var _b = 0, pageFolders_1 = pageFolders; _b < pageFolders_1.length; _b++) {
                var pf = pageFolders_1[_b];
                if (pf.keywords.some(function (kw) { return usage.includes(kw); })) {
                    matchedPageFolder = pf.name;
                    break;
                }
            }
            if (matchedPageFolder)
                return "break";
        };
        for (var _a = 0, usages_1 = usages; _a < usages_1.length; _a++) {
            var usage = usages_1[_a];
            var state_1 = _loop_1(usage);
            if (state_1 === "break")
                break;
        }
        if (!matchedPageFolder)
            continue; // No match, skip
        var type = classifyType(name_1);
        var destDir = path_1.default.join(DASHBOARD_COMPONENTS_DIR, matchedPageFolder, type);
        if (!fs_1.default.existsSync(destDir))
            fs_1.default.mkdirSync(destDir, { recursive: true });
        var destFile = path_1.default.join(destDir, path_1.default.basename(file));
        fs_1.default.renameSync(file, destFile);
        updateImports(file, destFile);
        console.log("Moved ".concat(name_1, " to ").concat(destDir));
    }
}
main();
