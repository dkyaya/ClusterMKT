# Event boundary review guide

## Question

Determine whether records describe the same bounded event, related events, or separate events. Compare action, actor, object, reporting period, announcement and effective dates, geography, product or business line, policy or filing identifier, quantitative anchors, and certainty state. Entity plus date is never sufficient.

## Labels

- `same_event`: records describe the same occurrence or action.
- `related_event`: events have a meaningful relationship but retain distinct identities.
- `separate_event`: a material boundary differs.
- `update`: later evidence updates the same event.
- `correction`: later evidence explicitly corrects earlier event facts.
- `proposal` and `final_action`: preserve action state.
- `rumor` and `confirmation`: preserve certainty state.
- `multi_event_record`: one record materially contains more than one separable event.

Explicit proposal, final, correction, and filing identifiers are relatively objective. Same-versus-related boundaries and multi-event judgments are judgment-based and safety-critical.

## Positive, negative, and edge examples

- Same event: independent reports describe the same filing, reporting period, disclosed action, and quantitative anchors.
- Update/correction: a later release corrects a figure in the same filing and period.
- Related events: a proposal and its later final rule, or a rumor and later official confirmation.
- Separate events: earnings and an analyst downgrade occur for the same company on the same date.
- Separate events: similar product announcements concern different geographies, effective dates, or business lines.
- Edge: one article discusses a product launch and management departure; a policy identifier is shared but the action state differs; an economic release is later benchmark-revised.

## Decision tree

```text
Do action, object, period, geography, and stable identifiers align?
├─ Yes
│  ├─ Later content corrects or extends the same event? → correction or update
│  └─ Otherwise → same_event
└─ No
   ├─ Is there a documented lineage or causal relationship? → related_event
   ├─ Are materially distinct actions/objects present? → separate_event
   └─ Does one record contain both? → multi_event_record or review_required
```

Do not split an event merely because headlines or publishers differ. Do not merge records merely because an entity and date overlap. Use `insufficient_evidence` when required boundary fields are absent and `cannot_determine` when visible boundary signals conflict. Escalate conflicting identifiers, unknown periods, evolving rumor/correction chains, and mixed-event records that cannot be split deterministically.
