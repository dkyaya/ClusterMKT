export const sourceFamilies = [
  {
    sourceFamilyId: "fixture-government-family",
    name: "Generic government primary fixtures",
    editorialIndependence: "primary",
  },
  {
    sourceFamilyId: "fixture-company-family",
    name: "Generic company primary fixtures",
    editorialIndependence: "primary",
  },
  {
    sourceFamilyId: "fixture-regulatory-family",
    name: "Generic regulatory fixtures",
    editorialIndependence: "primary",
  },
  {
    sourceFamilyId: "fixture-news-family",
    name: "Generic financial-news fixtures",
    editorialIndependence: "shared_family",
  },
  {
    sourceFamilyId: "fixture-trade-family",
    name: "Generic trade fixtures",
    editorialIndependence: "independent",
  },
  {
    sourceFamilyId: "fixture-podcast-family",
    name: "Generic podcast fixtures",
    editorialIndependence: "shared_family",
  },
  {
    sourceFamilyId: "fixture-restricted-family",
    name: "Restricted fixture boundary",
    editorialIndependence: "unknown",
  },
] as const;
