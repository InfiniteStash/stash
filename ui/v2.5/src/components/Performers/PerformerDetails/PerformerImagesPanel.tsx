import React from "react";
import * as GQL from "src/core/generated-graphql";
import { ImageList } from "src/components/Images/ImageList";
import { performerFilterHook } from "src/core/performers";

interface IPerformerImagesPanel {
  performer: Pick<GQL.PerformerDataFragment, 'id'|'name'>;
}

export const PerformerImagesPanel: React.FC<IPerformerImagesPanel> = ({
  performer,
}) => {
  return <ImageList filterHook={performerFilterHook(performer)} />;
};
