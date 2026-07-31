import { Button } from "@cluster-mkt/ui";
import { useState } from "react";
import { demoReviewerWorkflow as demo } from "../../data/demoReviewerWorkflow";
import { ReviewerConfidence } from "./ReviewerConfidence";

export function AnnotationForm() {
  const [label, setLabel] = useState("");
  const [cannotDetermine, setCannotDetermine] = useState(false);
  const [insufficientEvidence, setInsufficientEvidence] = useState(false);
  const [confidence, setConfidence] = useState("medium");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  return (
    <form
      className="reviewer-card reviewer-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (label || cannotDetermine || insufficientEvidence) setSubmitted(true);
      }}
    >
      <h2>Independent annotation</h2>
      <p>
        Choose the label supported by the visible evidence. Uncertainty is valid; forced certainty
        is not.
      </p>
      <fieldset className="reviewer-fieldset">
        <legend>Decision</legend>
        {demo.sample.labels.map((option) => (
          <label key={option}>
            <input
              checked={label === option}
              disabled={cannotDetermine || insufficientEvidence}
              name="annotation"
              onChange={() => setLabel(option)}
              type="radio"
            />{" "}
            {option}
          </label>
        ))}
        <label>
          <input
            checked={cannotDetermine}
            onChange={(event) => {
              setCannotDetermine(event.target.checked);
              if (event.target.checked) {
                setLabel("");
                setInsufficientEvidence(false);
              }
            }}
            type="checkbox"
          />{" "}
          Cannot determine from available evidence
        </label>
        <label>
          <input
            checked={insufficientEvidence}
            onChange={(event) => {
              setInsufficientEvidence(event.target.checked);
              if (event.target.checked) {
                setLabel("");
                setCannotDetermine(false);
              }
            }}
            type="checkbox"
          />{" "}
          Insufficient evidence in this package
        </label>
      </fieldset>
      <ReviewerConfidence onChange={setConfidence} value={confidence} />
      <label className="reviewer-notes">
        Reviewer notes
        <textarea
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Cite the visible evidence. Explain uncertainty or missing evidence."
          value={notes}
        />
      </label>
      <Button type="submit">Submit independent decision</Button>
      {submitted ? (
        <p className="reviewer-submission-status" role="status">
          Local demonstration submission recorded. Peer decisions and pipeline predictions remain
          hidden; this is not a gold label. Corrections would create an amendment rather than
          overwrite this decision.
        </p>
      ) : null}
    </form>
  );
}
