import { z } from "zod";
import { PodcastSourceSchema } from "./podcast";
import { ArticleSourceSchema, RelevanceLabelSchema } from "./source";

export const StoryClusterSectionSchema = z.object({
  key: z.enum(["what-happened", "why-it-matters", "agreement", "uncertainty", "future-evidence"]),
  title: z.string().min(1),
  body: z.string().min(1),
  evidenceSourceIds: z.array(z.string().min(1)),
});

export const ClusterArgumentSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  summary: z.string().min(1),
  sourceIds: z.array(z.string().min(1)),
});

export const ClusterUncertaintySchema = z.object({
  id: z.string().min(1),
  summary: z.string().min(1),
  evidenceNeeded: z.string().min(1),
});

export const StoryClusterSchema = z
  .object({
    id: z.string().regex(/^cluster-[a-z0-9-]+$/),
    title: z.string().min(1),
    shortOverview: z.string().min(1),
    whyItMatters: z.string().min(1),
    stocks: z.array(z.string().min(1)),
    sectors: z.array(z.string().min(1)),
    themes: z.array(z.string().min(1)),
    firstDetectedAt: z.iso.datetime(),
    lastUpdatedAt: z.iso.datetime(),
    relevance: RelevanceLabelSchema,
    sourceCount: z.number().int().nonnegative(),
    primarySourceCount: z.number().int().nonnegative(),
    sections: z.array(StoryClusterSectionSchema),
    agreementPoints: z.array(z.string().min(1)),
    competingArguments: z.array(ClusterArgumentSchema),
    uncertainty: z.array(ClusterUncertaintySchema),
    whatWouldChangeThePicture: z.array(z.string().min(1)),
    readSources: z.array(ArticleSourceSchema),
    listenSources: z.array(PodcastSourceSchema),
  })
  .superRefine((cluster, context) => {
    const actualCount = cluster.readSources.length + cluster.listenSources.length;
    if (cluster.sourceCount !== actualCount) {
      context.addIssue({
        code: "custom",
        path: ["sourceCount"],
        message: "Source count must match included sources.",
      });
    }
    const primaryCount = [...cluster.readSources, ...cluster.listenSources].filter(
      (source) => source.evidenceRole === "primary",
    ).length;
    if (cluster.primarySourceCount !== primaryCount) {
      context.addIssue({
        code: "custom",
        path: ["primarySourceCount"],
        message: "Primary-source count must match included sources.",
      });
    }
  });

export type StoryCluster = z.infer<typeof StoryClusterSchema>;
export type StoryClusterSection = z.infer<typeof StoryClusterSectionSchema>;
export type ClusterArgument = z.infer<typeof ClusterArgumentSchema>;
export type ClusterUncertainty = z.infer<typeof ClusterUncertaintySchema>;
