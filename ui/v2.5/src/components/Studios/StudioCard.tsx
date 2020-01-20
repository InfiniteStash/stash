import { Card } from "react-bootstrap";
import React from "react";
import { Link } from "react-router-dom";
import * as GQL from "src/core/generated-graphql";

interface IProps {
  studio: GQL.StudioDataFragment;
}

export const StudioCard: React.FC<IProps> = ({ studio }) => {
  return (
    <Card className="col-4">
      <Link
        to={`/studios/${studio.id}`}
        className="studio previewable image"
        style={{ backgroundImage: `url(${studio.image_path})` }}
      />
      <div className="card-section">
        <h4 className="text-truncate">{studio.name}</h4>
        <span>{studio.scene_count} scenes.</span>
      </div>
    </Card>
  );
};
