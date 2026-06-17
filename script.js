const searchInput = document.querySelector("#manual-search");
const sections = Array.from(document.querySelectorAll(".doc-section"));
const sidebarLinks = Array.from(document.querySelectorAll(".manual-sidebar a"));

const emptyState = document.createElement("p");
emptyState.className = "search-empty";
emptyState.hidden = true;
emptyState.textContent = "No matching manual sections.";
document.querySelector(".manual-content")?.prepend(emptyState);

function sectionText(section) {
  return `${section.textContent || ""} ${section.dataset.searchText || ""}`.toLowerCase();
}

function updateActiveSection() {
  const scrollAnchor = window.scrollY + 120;
  let activeId = sections[0]?.id;

  for (const section of sections) {
    if (!section.classList.contains("hidden-by-search") && section.offsetTop <= scrollAnchor) {
      activeId = section.id;
    }
  }

  sidebarLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
  });
}

function filterManualSections() {
  const query = searchInput?.value.trim().toLowerCase() || "";
  let visibleCount = 0;

  sections.forEach((section) => {
    const visible = query.length === 0 || sectionText(section).includes(query);
    section.classList.toggle("hidden-by-search", !visible);
    visibleCount += visible ? 1 : 0;
  });

  sidebarLinks.forEach((link) => {
    const target = document.querySelector(link.getAttribute("href") || "");
    link.hidden = Boolean(target?.classList.contains("hidden-by-search"));
  });

  emptyState.hidden = visibleCount > 0;
  updateActiveSection();
}

searchInput?.addEventListener("input", filterManualSections);
window.addEventListener("scroll", updateActiveSection, { passive: true });
window.addEventListener("load", updateActiveSection);
