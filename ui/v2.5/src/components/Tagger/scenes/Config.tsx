import React, { Dispatch, useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Collapse,
  Form,
  InputGroup,
} from "react-bootstrap";
import { Icon } from "src/components/Shared";
import { useConfiguration } from "src/core/StashService";
import { TextUtils } from "src/utils";
import FieldSelector from "../FieldSelector";

import { ITaggerConfig, ParseMode, ModeDesc, SCENE_FIELDS } from "../constants";

interface IConfigProps {
  show: boolean;
  config: ITaggerConfig;
  setConfig: Dispatch<ITaggerConfig>;
}

const Config: React.FC<IConfigProps> = ({ show, config, setConfig }) => {
  const stashConfig = useConfiguration();
  const blacklistRef = useRef<HTMLInputElement | null>(null);
  const [showExclusionModal, setShowExclusionModal] = useState(false);
  const excludedFields = config.excludedSceneFields ?? [];

  const handleInstanceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedEndpoint = e.currentTarget.value;
    setConfig({
      ...config,
      selectedEndpoint,
    });
  };

  const removeBlacklist = (index: number) => {
    setConfig({
      ...config,
      blacklist: [
        ...config.blacklist.slice(0, index),
        ...config.blacklist.slice(index + 1),
      ],
    });
  };

  const handleBlacklistAddition = () => {
    if (!blacklistRef.current) return;

    const input = blacklistRef.current.value;
    if (input.length === 0) return;

    setConfig({
      ...config,
      blacklist: [...config.blacklist, input],
    });
    blacklistRef.current.value = "";
  };

  const stashBoxes = stashConfig.data?.configuration.general.stashBoxes ?? [];

  const handleFieldSelect = (fields: string[]) => {
    setConfig({ ...config, excludedSceneFields: fields });
    setShowExclusionModal(false);
  };

  return (
    <>
      <Collapse in={show}>
        <Card>
          <div className="row">
            <h4 className="col-12">Configuration</h4>
            <hr className="w-100" />
            <Form className="col-md-6">
              <Form.Group controlId="excluded-scene-fields">
                <h6>Excluded fields:</h6>
                <span>
                  {excludedFields.length > 0
                    ? excludedFields.map((f) => (
                        <Badge variant="secondary" className="tag-item">
                          {TextUtils.capitalize(f)}
                        </Badge>
                      ))
                    : "No fields are excluded"}
                </span>
                <Form.Text>
                  These fields will not be changed when updating scenes.
                </Form.Text>
                <Button
                  onClick={() => setShowExclusionModal(true)}
                  className="mt-2"
                >
                  Edit Excluded Fields
                </Button>
              </Form.Group>

              <Form.Group controlId="tag-males" className="align-items-center">
                <Form.Check
                  label="Show male performers"
                  checked={config.showMales}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setConfig({ ...config, showMales: e.currentTarget.checked })
                  }
                />
                <Form.Text>
                  Toggle whether male performers will be available to tag.
                </Form.Text>
              </Form.Group>

              <Form.Group className="align-items-center">
                <div className="d-flex align-items-center">
                  <Form.Check
                    id="tag-mode"
                    label="Set tags"
                    className="mr-4"
                    checked={config.setTags}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setConfig({ ...config, setTags: e.currentTarget.checked })
                    }
                  />
                  <Form.Control
                    id="tag-operation"
                    className="col-md-2 col-3 input-control"
                    as="select"
                    value={config.tagOperation}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setConfig({
                        ...config,
                        tagOperation: e.currentTarget.value,
                      })
                    }
                    disabled={!config.setTags}
                  >
                    <option value="merge">Merge</option>
                    <option value="overwrite">Overwrite</option>
                  </Form.Control>
                </div>
                <Form.Text>
                  Attach tags to scene, either by overwriting or merging with
                  existing tags on scene.
                </Form.Text>
              </Form.Group>

              <Form.Group className="align-items-center">
                <div className="d-flex align-items-center">
                  <Form.Check
                    id="create-tags"
                    label="Create tags"
                    className="mr-4"
                    checked={config.createTags}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setConfig({ ...config, createTags: e.currentTarget.checked })
                    }
                  />
                </div>
                <Form.Text>Sets whether tags that don&apos;t exist in stash should be created or ignored.</Form.Text>
              </Form.Group>

              <Form.Group className="align-items-center">
                <div className="d-flex align-items-center">
                  <Form.Check
                    id="set-organized"
                    label="Set organized flag on tagged scenes"
                    className="mr-4"
                    checked={config.setOrganized}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setConfig({ ...config, setOrganized: e.currentTarget.checked })
                    }
                  />
                </div>
              </Form.Group>

            </Form>
            <div className="col-md-6">
              <h5>Blacklist</h5>
              <InputGroup>
                <Form.Control className="text-input" ref={blacklistRef} />
                <InputGroup.Append>
                  <Button onClick={handleBlacklistAddition}>Add</Button>
                </InputGroup.Append>
              </InputGroup>
              <div>
                Blacklist items are excluded from queries. Note that they are
                regular expressions and also case-insensitive. Certain characters
                must be escaped with a backslash: <code>[\^$.|?*+()</code>
              </div>
              {config.blacklist.map((item, index) => (
                <Badge
                  className="tag-item d-inline-block"
                  variant="secondary"
                  key={item}
                >
                  {item.toString()}
                  <Button
                    className="minimal ml-2"
                    onClick={() => removeBlacklist(index)}
                  >
                    <Icon icon="times" />
                  </Button>
                </Badge>
              ))}

              <Form.Group controlId="mode-select">
                <div className="row no-gutters">
                  <Form.Label className="mr-4 mt-1">Query Mode:</Form.Label>
                  <Form.Control
                    as="select"
                    className="col-md-2 col-3 input-control"
                    value={config.mode}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setConfig({
                        ...config,
                        mode: e.currentTarget.value as ParseMode,
                      })
                    }
                  >
                    <option value="auto">Auto</option>
                    <option value="filename">Filename</option>
                    <option value="dir">Dir</option>
                    <option value="path">Path</option>
                    <option value="metadata">Metadata</option>
                  </Form.Control>
                </div>
                <Form.Text>{ModeDesc[config.mode]}</Form.Text>
              </Form.Group>

              <Form.Group
                controlId="stash-box-endpoint"
                className="align-items-center row no-gutters mt-4"
              >
                <Form.Label className="mr-4">
                  Active stash-box instance:
                </Form.Label>
                <Form.Control
                  as="select"
                  value={config.selectedEndpoint}
                  className="col-md-4 col-6 input-control"
                  disabled={!stashBoxes.length}
                  onChange={handleInstanceSelect}
                >
                  {!stashBoxes.length && <option>No instances found</option>}
                  {stashConfig.data?.configuration.general.stashBoxes.map((i) => (
                    <option value={i.endpoint} key={i.endpoint}>
                      {i.endpoint}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

            </div>
          </div>
        </Card>
      </Collapse>
      <FieldSelector
        fields={SCENE_FIELDS}
        show={showExclusionModal}
        onSelect={handleFieldSelect}
        excludedFields={excludedFields}
      />
</>
  );
};

export default Config;
