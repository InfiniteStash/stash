import React from "react";
import * as GQL from "src/core/generated-graphql";
import { SceneList } from "src/components/Scenes/SceneList";
import { studioFilterHook } from "src/core/studios";

interface IStudioScenesPanel {
  studio: Pick<GQL.StudioDataFragment, 'id'|'name'>;
}

export const StudioScenesPanel: React.FC<IStudioScenesPanel> = ({ studio }) => {
  return <SceneList filterHook={studioFilterHook(studio)} />;
};
