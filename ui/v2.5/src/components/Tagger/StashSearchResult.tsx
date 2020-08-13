import React, { useCallback, useState } from "react";
import { ApolloClient } from "apollo-client";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { blobToBase64 } from "base64-blob";
import { loader } from "graphql.macro";
import cx from "classnames";
import { Button } from "react-bootstrap";
import { uniq } from "lodash";

import {
  SearchScene_searchScene as SearchResult,
  SearchScene_searchScene_performers_performer as StashPerformer,
  SearchScene_searchScene_studio as StashStudio,
} from "src/definitions-box/SearchScene";
import { FingerprintAlgorithm } from "src/definitions-box/globalTypes";
import { getCountryByISO } from "src/utils/country";
import * as GQL from "src/core/generated-graphql";
import {
  SubmitFingerprintVariables,
  SubmitFingerprint,
} from "src/definitions-box/SubmitFingerprint";
import { LoadingIndicator, SuccessIcon } from "src/components/Shared";
import PerformerResult, { IPerformerOperation } from "./PerformerResult";
import StudioResult, { IStudioOperation } from "./StudioResult";
import {
  formatBodyModification,
  formatCareerLength,
  formatGender,
  formatMeasurements,
  formatBreastType,
  formatURL,
  getUrlByType,
  getImage,
} from "./utils";
import {
  useCreateTag,
  useCreatePerformer,
  useCreateStudio,
  useUpdatePerformerStashID,
  useUpdateStudioStashID,
} from "./queries";

const SubmitFingerprintMutation = loader("src/queries/submitFingerprint.gql");

const getDurationStatus = (
  scene: SearchResult,
  stashDuration: number | undefined | null
) => {
  const fingerprintDuration =
    scene.fingerprints.map((f) => f.duration)?.[0] ?? null;
  const sceneDuration = scene.duration || fingerprintDuration;
  if (!sceneDuration || !stashDuration) return "";
  const diff = Math.abs(sceneDuration - stashDuration);
  if (diff < 5) {
    return (
      <div className="font-weight-bold">
        <SuccessIcon className="mr-2" />
        Duration is a match
      </div>
    );
  }
  return <div>Duration off by {Math.floor(diff)}s</div>;
};

const getFingerprintStatus = (scene: SearchResult, stashChecksum?: string) => {
  if (scene.fingerprints.some((f) => f.hash === stashChecksum))
    return (
      <div className="font-weight-bold">
        <SuccessIcon className="mr-2" />
        Checksum is a match
      </div>
    );
};

interface IStashSearchResultProps {
  scene: SearchResult;
  stashScene: Partial<GQL.Scene>;
  isActive: boolean;
  setActive: () => void;
  showMales: boolean;
  setScene: (scene: Partial<GQL.Scene>) => void;
  setCoverImage: boolean;
  tagOperation: string;
  client?: ApolloClient<NormalizedCacheObject>;
  endpoint: string;
}

const titleCase = (str?: string) => {
  if (!str) return "";
  return (str ?? "")
    .split(" ")
    .map((w) => w[0].toUpperCase() + w.substr(1).toLowerCase())
    .join(" ");
};

const StashSearchResult: React.FC<IStashSearchResultProps> = ({
  scene,
  stashScene,
  isActive,
  setActive,
  showMales,
  setScene,
  setCoverImage,
  tagOperation,
  client,
  endpoint,
}) => {
  const [studio, setStudio] = useState<IStudioOperation>();
  const [performers, setPerformers] = useState<
    Record<string, IPerformerOperation>
  >({});
  const [saveState, setSaveState] = useState<string>("");
  const [error, setError] = useState<string>("");

  const createStudio = useCreateStudio();
  const createPerformer = useCreatePerformer();
  const createTag = useCreateTag();
  const updatePerformerStashID = useUpdatePerformerStashID();
  const updateStudioStashID = useUpdateStudioStashID();
  const [updateScene] = GQL.useSceneUpdateMutation();
  const { data: allTags } = GQL.useAllTagsForFilterQuery();

  const setPerformer = useCallback(
    (performerData: IPerformerOperation, performerID: string) =>
      setPerformers({ ...performers, [performerID]: performerData }),
    [performers]
  );

  const handleSave = async () => {
    setError("");
    let performerIDs = [];
    let studioData: StashStudio|GQL.StudioDataFragment|GQL.SlimStudioDataFragment;
    if (studio?.create)
      studioData = studio.create;
    else if (studio?.existing)
      studioData = studio.existing;
    else if (studio?.update)
      studioData = studio.update;
    else
      return;

    if (studio?.create) {
      setSaveState("Creating studio");
      const newStudio = {
        name: studioData.name,
        stash_ids: [{
          endpoint,
          stash_id: scene.studio!.id,
        }],
        ...(!!getUrlByType(studio.create.urls, "HOME") && {
          url: getUrlByType(studio.create.urls, "HOME"),
        }),
        ...(!!getImage(studio.create.images, "landscape") && {
          image: getImage(studio.create.images, "landscape"),
        }),
      };
      const studioCreateResult = await createStudio(newStudio, scene.studio!.id);

      if (!studioCreateResult?.data?.studioCreate) {
        setError(`Failed to save studio "${newStudio.name}"`);
        return setSaveState("");
      }
      studioData = studioCreateResult.data?.studioCreate;
    }

    if (studio.update) {
      setSaveState("Saving studio stashID");
      const res = await updateStudioStashID(scene.studio!.id, endpoint, studio.update.id);
      if (!res?.data?.studioUpdate) {
        setError(`Failed to save stashID to studio "${studio.update.name}"`);
        return setSaveState("");
      }
    }

    setSaveState("Saving performers");
    performerIDs = await Promise.all(
      Object.keys(performers).map(async (stashID) => {
        const performer = performers[stashID];
        if (performer.skip) return "Skip";

        let performerData: StashPerformer|GQL.PerformerDataFragment|GQL.SlimPerformerDataFragment;
        if (performer?.create)
          performerData = performer.create;
        else if (performer?.existing)
          performerData = performer.existing;
        else if (performer?.update)
          performerData = performer.update;
        else
          return;

        if (performer.create) {
          const imgurl = performer.create.images[0]?.url;
          let imgData = null;
          if (imgurl) {
            const img = await fetch(imgurl, {
              mode: "cors",
              cache: "no-store",
            });
            if (img.status === 200) {
              const blob = await img.blob();
              imgData = await blobToBase64(blob);
            }
          }

          const performerInput = {
            name: performerData.name,
            gender: formatGender(performer.create.gender),
            country: getCountryByISO(performer.create.country) ?? "",
            height: performer.create.height?.toString(),
            ethnicity: titleCase(performer.create.ethnicity ?? ""),
            birthdate: performer.create.birthdate?.date ?? null,
            eye_color: titleCase(performer.create.eye_color ?? ""),
            fake_tits: formatBreastType(performer.create.breast_type),
            measurements: formatMeasurements(performer.create.measurements),
            career_length: formatCareerLength(
              performer.create.career_start_year,
              performer.create.career_end_year
            ),
            tattoos: formatBodyModification(performer.create.tattoos),
            piercings: formatBodyModification(performer.create.piercings),
            twitter: formatURL(performer.create.urls, "TWITTER"),
            image: imgData,
            stash_ids: [{
              endpoint,
              stash_id: stashID,
            }]
          };

          const res = await createPerformer(performerInput, stashID);
          if (!res?.data?.performerCreate) {
            setError(`Failed to save performer "${performerInput.name}"`);
            return null;
          }
          performerData = res.data?.performerCreate;
        }

        if (performer.update) {
          await updatePerformerStashID(performerData.id, stashID, endpoint);
        }

        return performerData.id;
      })
    );

    setSaveState("Updating scene");
    if (studioData && !performerIDs.some((id) => !id)) {
      const imgurl = getImage(scene.images, "landscape");
      let imgData = null;
      if (imgurl && setCoverImage) {
        const img = await fetch(imgurl, {
          mode: "cors",
          cache: "no-store",
        });
        if (img.status === 200) {
          const blob = await img.blob();
          imgData = await blobToBase64(blob);
        }
      }

      const tagIDs: string[] =
        tagOperation === "merge"
          ? stashScene?.tags?.map((t) => t.id) ?? []
          : [];
      const tags = scene.tags ?? [];
      if (tags.length > 0) {
        const tagDict: Record<string, string> = (allTags?.allTagsSlim ?? [])
          .filter((t) => t.name)
          .reduce((dict, t) => ({ ...dict, [t.name.toLowerCase()]: t.id }), {});
        const newTags: string[] = [];
        tags.forEach((tag) => {
          if (tagDict[tag.name.toLowerCase()])
            tagIDs.push(tagDict[tag.name.toLowerCase()]);
          else newTags.push(tag.name);
        });

        const createdTags = await Promise.all(
          newTags.map((tag) =>
            createTag(tag)
          )
        );
        createdTags.forEach((createdTag) => {
          if (createdTag?.data?.tagCreate?.id)
            tagIDs.push(createdTag.data.tagCreate.id);
        });
      }

      const sceneUpdateResult = await updateScene({
        variables: {
          id: stashScene.id ?? "",
          title: scene.title,
          details: scene.details,
          date: scene.date,
          performer_ids: performerIDs.filter((id) => id !== "Skip") as string[],
          studio_id: studioData.id,
          cover_image: imgData,
          url: getUrlByType(scene.urls, "STUDIO") ?? null,
          ...(tagIDs ? { tag_ids: uniq(tagIDs) } : {}),
          stash_ids: [
            ...(stashScene?.stash_ids ?? []),
            {
              endpoint,
              stash_id: scene.id,
          }]
        },
      });

      if (sceneUpdateResult.data?.sceneUpdate)
        setScene(sceneUpdateResult.data.sceneUpdate);

      if (stashScene.checksum && stashScene.file?.duration)
        client?.mutate<SubmitFingerprint, SubmitFingerprintVariables>({
          mutation: SubmitFingerprintMutation,
          variables: {
            input: {
              scene_id: scene.id,
              fingerprint: {
                hash: stashScene.checksum,
                algorithm: FingerprintAlgorithm.MD5,
                duration: Math.floor(stashScene.file?.duration),
              },
            },
          },
        });
      if (stashScene.oshash && stashScene.file?.duration)
        client?.mutate<SubmitFingerprint, SubmitFingerprintVariables>({
          mutation: SubmitFingerprintMutation,
          variables: {
            input: {
              scene_id: scene.id,
              fingerprint: {
                hash: stashScene.oshash,
                algorithm: FingerprintAlgorithm.OSHASH,
                duration: Math.floor(stashScene.file?.duration),
              },
            },
          },
        });
    }
    setSaveState("");
  };

  const classname = cx("row no-gutters mt-2 search-result", {
    "selected-result": isActive,
  });

  const sceneTitle = getUrlByType(scene.urls, "STUDIO") ? (
    <a
      href={getUrlByType(scene.urls, "STUDIO")}
      target="_blank"
      rel="noopener noreferrer"
      className="scene-link"
    >
      {scene?.title}
    </a>
  ) : (
    <span>{scene?.title}</span>
  );

  const saveEnabled =
    Object.keys(performers ?? []).length ===
      scene.performers.filter((p) => p.performer.gender !== "MALE" || showMales)
        .length &&
    Object.keys(performers ?? []).every((id) => (
      performers?.[id].create ||
      performers?.[id].update ||
      performers?.[id].existing ||
      performers?.[id].skip
    )) && saveState === "";

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <li
      className={classname}
      key={scene?.id}
      onClick={() => !isActive && setActive()}
    >
      <div className="col-6">
        <div className="row">
          <img
            src={getImage(scene?.images, "landscape")}
            alt=""
            className="align-self-center scene-image"
          />
          <div className="d-flex flex-column justify-content-center scene-metadata">
            <h4 className="text-truncate" title={scene?.title ?? ""}>
              {sceneTitle}
            </h4>
            <h5>
              {scene?.studio?.name} • {scene?.date}
            </h5>
            <div>
              Performers:{" "}
              {scene?.performers?.map((p) => p.performer.name).join(", ")}
            </div>
            {getDurationStatus(scene, stashScene.file?.duration)}
            {getFingerprintStatus(
              scene,
              stashScene.checksum ?? stashScene.oshash ?? undefined
            )}
          </div>
        </div>
      </div>
      {isActive && (
        <div className="col-6">
          <StudioResult studio={scene.studio} setStudio={setStudio} />
          {scene.performers
            .filter((p) => p.performer.gender !== "MALE" || showMales)
            .map((performer) => (
              <PerformerResult
                performer={performer.performer}
                setPerformer={(data: IPerformerOperation) =>
                  setPerformer(data, performer.performer.id)
                }
                key={`${scene.id}${performer.performer.id}`}
              />
            ))}
          <div className="row no-gutters mt-2 align-items-center justify-content-end">
            { error && (
              <strong className="col-6 mt-1 mr-2 text-danger text-right">{error}</strong>
            )}
            { saveState && (
              <strong className="col-4 mt-1 mr-2 text-right">{saveState}</strong>
            )}
            <Button onClick={handleSave} disabled={!saveEnabled}>
              {saveState ? (
                <LoadingIndicator inline small message="" />
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      )}
    </li>
  );
};

export default StashSearchResult;
