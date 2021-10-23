import React from "react";
import * as GQL from "src/core/generated-graphql";
import { studioFilterHook } from "src/core/studios";
import { PerformerList } from "src/components/Performers/PerformerList";
import { StudiosCriterion } from "src/models/list-filter/criteria/studios";

interface IStudioPerformersPanel {
  studio: Pick<GQL.StudioDataFragment, 'id'|'name'>;
}

export const StudioPerformersPanel: React.FC<IStudioPerformersPanel> = ({
  studio,
}) => {
  const studioCriterion = new StudiosCriterion();
  studioCriterion.value = {
    items: [{ id: studio.id, label: studio.name }],
    depth: 0,
  };

  const extraCriteria = {
    scenes: [studioCriterion],
    images: [studioCriterion],
    galleries: [studioCriterion],
    movies: [studioCriterion],
  };

  return (
    <PerformerList
      filterHook={studioFilterHook(studio)}
      extraCriteria={extraCriteria}
    />
  );
};
