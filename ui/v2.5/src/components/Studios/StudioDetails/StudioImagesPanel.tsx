import React from "react";
import * as GQL from "src/core/generated-graphql";
import { studioFilterHook } from "src/core/studios";
import { ImageList } from "src/components/Images/ImageList";

interface IStudioImagesPanel {
  studio: Pick<GQL.StudioDataFragment, 'id'|'name'>;
}

export const StudioImagesPanel: React.FC<IStudioImagesPanel> = ({ studio }) => {
  return <ImageList filterHook={studioFilterHook(studio)} />;
};
