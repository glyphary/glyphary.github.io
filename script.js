const searchInput = document.querySelector("#manual-search");
const sections = Array.from(document.querySelectorAll(".doc-section"));
const sidebarLinks = Array.from(document.querySelectorAll(".manual-sidebar a[href^='#']"));
const sidebarGroups = Array.from(document.querySelectorAll(".sidebar-group"));
const sidebarToggle = document.querySelector(".sidebar-toggle");

const emptyState = document.createElement("p");
emptyState.className = "search-empty";
emptyState.hidden = true;
emptyState.textContent = "No matching documentation sections.";
document.querySelector(".manual-content")?.prepend(emptyState);

const scrim = document.createElement("button");
scrim.className = "nav-scrim";
scrim.type = "button";
scrim.tabIndex = -1;
scrim.setAttribute("aria-label", "Close contents");
document.body.append(scrim);

function sectionText(section) {
  return `${section.textContent || ""} ${section.dataset.searchText || ""}`.toLowerCase();
}

function closeSidebar() {
  document.body.classList.remove("nav-open");
  sidebarToggle?.setAttribute("aria-expanded", "false");
  sidebarToggle?.setAttribute("aria-label", "Open contents");
}

function toggleSidebar() {
  const open = !document.body.classList.contains("nav-open");
  document.body.classList.toggle("nav-open", open);
  sidebarToggle?.setAttribute("aria-expanded", String(open));
  sidebarToggle?.setAttribute("aria-label", open ? "Close contents" : "Open contents");
}

let activeFrame = 0;

function updateActiveSection() {
  activeFrame = 0;
  const anchor = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--manual-topbar-height"),
  ) + 40;
  let activeId = sections.find((section) => !section.classList.contains("hidden-by-search"))?.id;

  for (const section of sections) {
    if (!section.classList.contains("hidden-by-search") && section.getBoundingClientRect().top <= anchor) {
      activeId = section.id;
    }
  }

  sidebarLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
  });
}

function scheduleActiveSectionUpdate() {
  if (!activeFrame) {
    activeFrame = window.requestAnimationFrame(updateActiveSection);
  }
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

  sidebarGroups.forEach((group) => {
    const links = Array.from(group.querySelectorAll("a[href^='#']"));
    group.hidden = links.length > 0 && links.every((link) => link.hidden);
  });

  emptyState.hidden = visibleCount > 0;
  scheduleActiveSectionUpdate();
}

searchInput?.addEventListener("input", filterManualSections);
sidebarToggle?.addEventListener("click", toggleSidebar);
scrim.addEventListener("click", closeSidebar);
sidebarLinks.forEach((link) => link.addEventListener("click", closeSidebar));

window.addEventListener("scroll", scheduleActiveSectionUpdate, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 1120) closeSidebar();
  scheduleActiveSectionUpdate();
});
window.addEventListener("load", updateActiveSection);

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

  if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
    event.preventDefault();
    searchInput?.focus();
  }

  if (event.key === "Escape") {
    closeSidebar();
    if (document.activeElement === searchInput && searchInput?.value) {
      searchInput.value = "";
      filterManualSections();
    }
  }
});
