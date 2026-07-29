import type { AgreementStrength } from "../schemas/agreement-group";

export function determineAgreementStrength(input: {
  independentSourceCount: number;
  primarySourcePresent: boolean;
}): AgreementStrength {
  if (input.primarySourcePresent && input.independentSourceCount >= 2)
    return "primary_plus_independent";
  if (input.independentSourceCount >= 4) return "broad_corroboration";
  if (input.independentSourceCount >= 2) return "multi_source";
  if (input.independentSourceCount === 1) return "single_source";
  return "limited_corroboration";
}
