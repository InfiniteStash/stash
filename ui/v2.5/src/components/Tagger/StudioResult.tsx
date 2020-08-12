import React, { useEffect, useState, Dispatch, SetStateAction } from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import cx from "classnames";

import { SuccessIcon, Modal, StudioSelect } from "src/components/Shared";
import * as GQL from "src/core/generated-graphql";
import { ValidTypes } from "src/components/Shared/Select";
import { SearchScene_searchScene_studio as StashStudio } from "src/definitions-box/SearchScene";
import { getImage, getUrlByType } from "./utils";

export interface IStudioOperation {
  create?: StashStudio;
  update?: GQL.StudioDataFragment | GQL.SlimStudioDataFragment;
  existing?: GQL.StudioDataFragment;
  skip?: boolean;
}

interface IStudioResultProps {
  studio: StashStudio | null;
  setStudio: Dispatch<SetStateAction<IStudioOperation | undefined>>;
}

const StudioResult: React.FC<IStudioResultProps> = ({ studio, setStudio }) => {
  const [selectedStudio, setSelectedStudio] = useState<string | null>();
  const [modalVisible, showModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState<
    "create" | "existing" | "skip" | undefined
  >();
  const {
    data: stashData,
    loading: stashLoading,
  } = GQL.useFindStudiosQuery({
    variables: {
      studio_filter: {
        stash_id: studio?.id ?? "",
      }
    },
  });

  const handleStudioSelect = (studio: ValidTypes[]) => {
    if (studio.length) {
      setSelectedSource("existing");
      setSelectedStudio(studio[0].id);
      setStudio({
        update: studio[0] as GQL.SlimStudioDataFragment,
      });
    } else {
      setSelectedSource(undefined);
      setSelectedStudio(null);
    }
  };

  const { loading } = GQL.useFindStudiosQuery({
    variables: {
      filter: {
        q: `"${studio?.name ?? ""}"`,
      },
    },
    onCompleted: (data) => {
      const studioResult = data.findStudios.studios[0];
      if (studioResult) {
        setSelectedSource("existing");
        setSelectedStudio(studioResult.id);
        setStudio({
          update: studioResult
        });
      }}
  });

  useEffect(() => {
    if (!stashData?.findStudios.studios.length) return;

    setStudio({
      existing: stashData.findStudios.studios[0]
    });
  }, [stashData]);

  const handleStudioCreate = () => {
    if (!studio) return;
    setSelectedSource("create");
    setStudio({
      create: studio,
    });
    showModal(false);
  };

  const handleStudioSkip = () => {
    setSelectedSource("skip");
    setStudio({
      skip: true,
    });
  };

  if (loading || stashLoading) return <div>Loading studio</div>;

  if (stashData?.findStudios.studios.length) {
    return (
      <div className="row no-gutters my-2">
        <div className="entity-name">
          Studio:
          <b className="ml-2">{studio?.name}</b>
        </div>
        <span className="ml-auto">
          <SuccessIcon className="mr-2" />
          Matched:
        </span>
        <b className="col-3 text-right">{stashData.findStudios.studios[0].name}</b>
      </div>
    );
  }

  return (
    <div className="row no-gutters align-items-center mt-2">
      <Modal
        show={modalVisible}
        accept={{ text: "Save", onClick: handleStudioCreate }}
        cancel={{ onClick: () => showModal(false), variant: "secondary" }}
      >
        <div className="row">
          <strong className="col-2">Name:</strong>
          <span className="col-10">{studio?.name}</span>
        </div>
        <div className="row">
          <strong className="col-2">URL:</strong>
          <span className="col-10">
            {getUrlByType(studio?.urls ?? [], "HOME")}
          </span>
        </div>
        <div className="row">
          <strong className="col-2">Logo:</strong>
          <span className="col-10">
            <img src={getImage(studio?.images ?? [], "landscape")} alt="" />
          </span>
        </div>
      </Modal>

      <div className="entity-name">
        Studio:
        <b className="ml-2">{studio?.name}</b>
      </div>
      <ButtonGroup>
        <Button
          variant={selectedSource === "create" ? "primary" : "secondary"}
          onClick={() => showModal(true)}
        >
          Create
        </Button>
        <Button
          variant={selectedSource === "skip" ? "primary" : "secondary"}
          onClick={() => handleStudioSkip()}
        >
          Skip
        </Button>
        <StudioSelect
          ids={selectedStudio ? [selectedStudio] : []}
          onSelect={handleStudioSelect}
          className={cx("studio-select", {
            "studio-select-active": selectedSource === "existing",
          })}
          isClearable={false}
        />
      </ButtonGroup>
    </div>
  );
};

export default StudioResult;
