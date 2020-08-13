import React, { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import * as GQL from "src/core/generated-graphql";
import { Icon } from "src/components/Shared";

type StashBoxInput = Omit<GQL.StashBoxInstance, 'id'> & Partial<Pick<GQL.StashBoxInstance, 'id'>>;

interface IInstanceProps {
  instance?: GQL.StashBoxInstance;
  isCreate?: boolean;
  onSave: (instance: StashBoxInput) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
}


const Instance: React.FC<IInstanceProps> = ({ instance, onSave, onCancel, onDelete, isCreate = false }) => {
  const [isEditing, setIsEditing] = useState(isCreate);
  const [endpoint, setEndpoint] = useState(instance?.endpoint);
  const [apiKey, setApiKey] = useState(instance?.api_key);

  const handleCancel = () => {
    if (isCreate) {
      onCancel();
      setEndpoint('');
      setApiKey('');
    } else {
      setIsEditing(false);
    }
  }

  const handleSave = () => {
    if (!endpoint || !apiKey) return;
    setIsEditing(false);
    onSave({
      id: instance?.id,
      api_key: apiKey,
      endpoint,
    });
    if (!instance?.id) {
      setEndpoint('');
      setApiKey('');
    }
  }

  return (
    <Form.Group className="row">
      <InputGroup className="col-6">
        <InputGroup.Prepend>
        { !isEditing && (
          <>
            <Button className="" variant="primary" title="Edit" onClick={() => setIsEditing(true)}>
              <Icon icon="edit" />
            </Button>
            { instance?.id && (
              <Button className="" variant="danger" title="Delete" onClick={() => onDelete?.(instance.id)}>
                <Icon icon="minus" />
              </Button>
            )}
          </>
        )}
        { isEditing && (
          <>
            <Button className="" variant="primary" title="Save" onClick={handleSave}>
              <Icon icon="save" />
            </Button>
            <Button className="" variant="danger" title="Cancel" onClick={handleCancel}>
              <Icon icon="times" />
            </Button>
          </>
        )}
        </InputGroup.Prepend>
        <Form.Control placeholder="GraphQL endpoint" className="text-input" value={endpoint} disabled={!isEditing} onInput={(e: React.FormEvent<HTMLInputElement>) => setEndpoint(e.currentTarget.value)} />
        <Form.Control placeholder="API key" className="text-input" value={apiKey} disabled={!isEditing} onInput={(e: React.FormEvent<HTMLInputElement>) => setApiKey(e.currentTarget.value)} />
      </InputGroup>
    </Form.Group>
  );
};

export const StashBoxConfiguration: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);
  const { data } = GQL.useListStashBoxInstancesQuery();
  const [createInstance] = GQL.useStashBoxInstanceCreateMutation();
  const [removeInstance] = GQL.useStashBoxInstanceDestroyMutation();
  const [updateInstance] = GQL.useStashBoxInstanceUpdateMutation();

  const handleCancel = () => setShowCreate(false);
  const handleSave = (instance: StashBoxInput) => {
    if (!instance.api_key || !instance.endpoint) return;

    if (instance.id !== undefined) {
      updateInstance({ variables: { input: instance as GQL.StashBoxInstance }});
    } else {
      createInstance({
        variables: { input: instance },
        update: (store, createResult) => {
          if (!createResult.data?.stashBoxInstanceCreate) return;
          const currentInstances = store.readQuery<GQL.ListStashBoxInstancesQuery>({
            query: GQL.ListStashBoxInstancesDocument,
          });

          const newInstances = {
            ...currentInstances,
            listStashBoxInstances: [
              ...(currentInstances?.listStashBoxInstances ?? []),
              createResult.data.stashBoxInstanceCreate
            ]
          };
          store.writeQuery({
            query: GQL.ListStashBoxInstancesDocument,
            data: newInstances,
          });
          setShowCreate(false);
        }
      });
    }
  };
  const handleDelete = (id: string) => {
    removeInstance({
      variables: { id },
      update: (store, deleteResult) => {
        if (!deleteResult.data?.stashBoxInstanceDestroy) return;
        const currentInstances = store.readQuery<GQL.ListStashBoxInstancesQuery>({
          query: GQL.ListStashBoxInstancesDocument,
        });

        const filteredInstances = currentInstances?.listStashBoxInstances.filter(i => i.id !== id);
        store.writeQuery({
          query: GQL.ListStashBoxInstancesDocument,
          variables: {},
          data: {
            listStashBoxInstances: filteredInstances,
          },
        });
      }
    });
  };

  return (
    <Form.Group>
      <h4>Stash-box integration</h4>
      <div className="">
        { data?.listStashBoxInstances.map(instance => (
          <Instance instance={instance} onSave={handleSave} onCancel={handleCancel} onDelete={handleDelete} key={`instance-${instance.id}`} />
        ))}
        { showCreate && (
          <Instance onSave={handleSave} onCancel={handleCancel} isCreate={true} />
        )}
      </div>
      <Button className="minimal" title="Add stash-box instance" onClick={() => setShowCreate(true)} disabled={showCreate}>
        <Icon icon="plus" />
      </Button>
      <Form.Text className="text-muted">Stash-box facilitates automated tagging of scenes and performers based on fingerprints and filenames.</Form.Text>
    </Form.Group>
  );
};

export default StashBoxConfiguration;
