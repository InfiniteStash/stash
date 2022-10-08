import React from "react";
import { Form } from "react-bootstrap";
import {
  Criterion,
  CriterionValue,
} from "../../../models/list-filter/criteria/criterion";

interface IInputFilterProps {
  criterion: Criterion<CriterionValue>;
  onValueChanged: (value: string) => void;
}

export const InputFilter: React.FC<IInputFilterProps> = ({
  criterion,
  onValueChanged,
}) => (
  <Form.Group>
    <Form.Control
      className="btn-secondary"
      type={criterion.criterionOption.inputType}
      onBlur={e => onValueChanged(e.target.value)}
      defaultValue={criterion.value ? criterion.value.toString() : ""}
    />
  </Form.Group>
);
