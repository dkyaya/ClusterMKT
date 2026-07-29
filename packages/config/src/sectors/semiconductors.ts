import { SectorSchema, type Sector } from "@cluster-mkt/core";

export const semiconductorCompanyFixtures = [
  {
    id: "company-nvidia",
    displayName: "Nvidia",
    ticker: "NVDA",
    subindustryId: "chip_design_and_compute",
  },
  {
    id: "company-amd",
    displayName: "AMD",
    ticker: "AMD",
    subindustryId: "chip_design_and_compute",
  },
  {
    id: "company-tsmc",
    displayName: "TSMC",
    ticker: "TSM",
    subindustryId: "foundries_and_manufacturing",
  },
  {
    id: "company-globalfoundries",
    displayName: "GlobalFoundries",
    ticker: "GFS",
    subindustryId: "foundries_and_manufacturing",
  },
  { id: "company-micron", displayName: "Micron Technology", ticker: "MU", subindustryId: "memory" },
  {
    id: "company-asml",
    displayName: "ASML",
    ticker: "ASML",
    subindustryId: "semiconductor_equipment",
  },
  {
    id: "company-applied-materials",
    displayName: "Applied Materials",
    ticker: "AMAT",
    subindustryId: "semiconductor_equipment",
  },
  {
    id: "company-texas-instruments",
    displayName: "Texas Instruments",
    ticker: "TXN",
    subindustryId: "analog_and_power",
  },
  {
    id: "company-amkor",
    displayName: "Amkor Technology",
    ticker: "AMKR",
    subindustryId: "packaging_and_testing",
  },
  {
    id: "company-entegris",
    displayName: "Entegris",
    ticker: "ENTG",
    subindustryId: "semiconductor_materials",
  },
] as const;

export const semiconductorsSector: Sector = SectorSchema.parse({
  id: "semiconductors",
  name: "Semiconductors",
  description:
    "Project-owned editorial coverage of chip design, manufacturing, memory, equipment, analog and power, packaging and testing, and materials.",
  editorialTaxonomyVersion: "cluster-mkt-semiconductors-v1",
  industries: [
    {
      id: "semiconductor_industry",
      displayName: "Semiconductor industry",
      subindustryIds: [
        "chip_design_and_compute",
        "foundries_and_manufacturing",
        "memory",
        "semiconductor_equipment",
        "analog_and_power",
        "packaging_and_testing",
        "semiconductor_materials",
      ],
    },
  ],
  subindustries: [
    {
      id: "chip_design_and_compute",
      displayName: "Chip design & compute",
      description: "Fabless processors, accelerators, architectures, and design platforms.",
      commonTerminology: ["fabless", "accelerator", "GPU", "CPU", "architecture"],
      representativePublicCompanyIds: ["company-nvidia", "company-amd"],
      upstreamSubindustryIds: ["semiconductor_materials"],
      downstreamSubindustryIds: ["foundries_and_manufacturing", "packaging_and_testing"],
    },
    {
      id: "foundries_and_manufacturing",
      displayName: "Foundries & manufacturing",
      description:
        "Wafer fabrication, foundry capacity, process nodes, and manufacturing services.",
      commonTerminology: ["foundry", "wafer fabrication", "process node", "utilization"],
      representativePublicCompanyIds: ["company-tsmc", "company-globalfoundries"],
      upstreamSubindustryIds: ["semiconductor_equipment", "semiconductor_materials"],
      downstreamSubindustryIds: ["packaging_and_testing"],
    },
    {
      id: "memory",
      displayName: "Memory",
      description: "DRAM, NAND, high-bandwidth memory, pricing, inventory, and capacity.",
      commonTerminology: ["DRAM", "NAND", "HBM", "memory pricing", "inventory"],
      representativePublicCompanyIds: ["company-micron"],
      upstreamSubindustryIds: ["semiconductor_equipment", "semiconductor_materials"],
      downstreamSubindustryIds: ["packaging_and_testing"],
    },
    {
      id: "semiconductor_equipment",
      displayName: "Semiconductor equipment",
      description: "Lithography, deposition, etch, metrology, and fabrication equipment.",
      commonTerminology: ["lithography", "wafer-fab equipment", "deposition", "etch", "metrology"],
      representativePublicCompanyIds: ["company-asml", "company-applied-materials"],
      upstreamSubindustryIds: ["semiconductor_materials"],
      downstreamSubindustryIds: ["foundries_and_manufacturing", "memory"],
    },
    {
      id: "analog_and_power",
      displayName: "Analog & power",
      description: "Analog signal, mixed-signal, embedded, and power semiconductor devices.",
      commonTerminology: ["analog", "mixed-signal", "power semiconductor", "embedded"],
      representativePublicCompanyIds: ["company-texas-instruments"],
      upstreamSubindustryIds: ["foundries_and_manufacturing"],
      downstreamSubindustryIds: ["packaging_and_testing"],
    },
    {
      id: "packaging_and_testing",
      displayName: "Packaging & testing",
      description: "Assembly, advanced packaging, chiplets, and outsourced testing services.",
      commonTerminology: ["advanced packaging", "OSAT", "chiplet", "assembly", "testing"],
      representativePublicCompanyIds: ["company-amkor"],
      upstreamSubindustryIds: ["foundries_and_manufacturing", "memory"],
      downstreamSubindustryIds: ["chip_design_and_compute"],
    },
    {
      id: "semiconductor_materials",
      displayName: "Semiconductor materials",
      description: "Wafers, specialty gases, chemicals, substrates, and process materials.",
      commonTerminology: ["silicon wafer", "photoresist", "specialty gas", "substrate"],
      representativePublicCompanyIds: ["company-entegris"],
      upstreamSubindustryIds: [],
      downstreamSubindustryIds: [
        "semiconductor_equipment",
        "foundries_and_manufacturing",
        "memory",
      ],
    },
  ],
  representativeConstituentIds: semiconductorCompanyFixtures.map((company) => company.id),
  followable: true,
});
