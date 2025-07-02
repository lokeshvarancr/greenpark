import fs from "fs";
import path from "path";

// --- CONFIGURATION ---
const SRC_DIR = path.join(__dirname, "src");
const COMPONENTS_DIR = path.join(SRC_DIR, "components");
const DASHBOARD_COMPONENTS_DIR = path.join(SRC_DIR, "dashboard", "components");
const PAGE_MAP = {
  "IndividualQuestions": "IndividualQuestions",
  "PerformanceInsights": "PerformanceInsights",
  "Performancetab": "Performancetab",
  "Section1Dashboard": "Section1Dashboard",
};
const TYPE_KEYWORDS = [
  { type: "charts", keywords: ["Chart", "Gauge", "Donut"] },
  { type: "cards", keywords: ["Card", "Badge"] },
  { type: "tables", keywords: ["Table"] },
  { type: "filters", keywords: ["Filter", "Dropdown"] },
  { type: "modals", keywords: ["Modal"] },
  { type: "layout", keywords: ["Layout"] },
];

// --- HELPERS ---
function getAllFiles(dir: string, ext = ".tsx"): string[] {
  let results: string[] = [];
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(getAllFiles(full, ext));
    } else if (file.endsWith(ext)) {
      results.push(full);
    }
  }
  return results;
}

function findComponentUsages(componentName: string, searchDirs: string[]): string[] {
  const usages: string[] = [];
  for (const dir of searchDirs) {
    for (const file of getAllFiles(dir, ".tsx")) {
      const content = fs.readFileSync(file, "utf8");
      // Simple heuristic: look for <ComponentName or import ... from '.../ComponentName'
      if (
        new RegExp(`<${componentName}[\\s>]`).test(content) ||
        new RegExp(`import .*${componentName}.*from`).test(content)
      ) {
        usages.push(file);
      }
    }
  }
  return usages;
}

function classifyType(filename: string): string {
  for (const { type, keywords } of TYPE_KEYWORDS) {
    if (keywords.some(k => filename.includes(k))) return type;
  }
  return "misc";
}

function updateImports(oldPath: string, newPath: string) {
  const allFiles = getAllFiles(SRC_DIR, ".tsx").concat(getAllFiles(SRC_DIR, ".ts"));
  for (const file of allFiles) {
    let content = fs.readFileSync(file, "utf8");
    const relOld = "./" + path.relative(path.dirname(file), oldPath).replace(/\\/g, "/").replace(/\.tsx?$/, "");
    const relNew = "./" + path.relative(path.dirname(file), newPath).replace(/\\/g, "/").replace(/\.tsx?$/, "");
    // Replace both with and without file extension
    content = content.replace(new RegExp(relOld, "g"), relNew);
    fs.writeFileSync(file, content, "utf8");
  }
}

// --- MAIN LOGIC ---
function main() {
  const componentFiles = getAllFiles(COMPONENTS_DIR, ".tsx");
  const pageDirs = Object.keys(PAGE_MAP).map(page =>
    path.join(SRC_DIR, "dashboard", "pages", `${PAGE_MAP[page]}.tsx`)
  );
  for (const file of componentFiles) {
    const name = path.basename(file, ".tsx");
    const usages = findComponentUsages(name, pageDirs);
    if (usages.length === 0) continue; // Not used in any page, skip or move to misc
    // Assign to the first page found (or enhance to support multi-page)
    const pageFile = usages[0];
    const page = Object.keys(PAGE_MAP).find(p => pageFile.includes(PAGE_MAP[p]));
    if (!page) continue;
    const type = classifyType(name);
    const destDir = path.join(DASHBOARD_COMPONENTS_DIR, page, type);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const destFile = path.join(destDir, path.basename(file));
    fs.renameSync(file, destFile);
    updateImports(file, destFile);
    console.log(`Moved ${name} to ${destDir}`);
  }
}

main();