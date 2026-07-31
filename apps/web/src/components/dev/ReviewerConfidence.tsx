export function ReviewerConfidence({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="reviewer-fieldset">
      <legend>Reviewer confidence</legend>
      {["low", "medium", "high"].map((level) => (
        <label key={level}>
          <input
            checked={value === level}
            name="confidence"
            onChange={() => onChange(level)}
            type="radio"
            value={level}
          />{" "}
          {level}
        </label>
      ))}
    </fieldset>
  );
}
