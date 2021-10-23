import React from "react";
import * as GQL from "src/core/generated-graphql";
import { SceneList } from "src/components/Scenes/SceneList";
import { performerFilterHook } from "src/core/performers";

interface IPerformerDetailsProps {
  performer: Pick<GQL.PerformerDataFragment, 'id'|'name'>;
}

export const PerformerScenesPanel: React.FC<IPerformerDetailsProps> = ({
  performer,
}) => {
  return <SceneList filterHook={performerFilterHook(performer)} />;
};
