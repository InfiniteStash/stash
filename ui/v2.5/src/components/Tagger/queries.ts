import * as GQL from "src/core/generated-graphql";
import { sortBy } from "lodash";

export const useUpdatePerformerStashID = () => {
  const [updatePerformer] = GQL.usePerformerUpdateMutation({
    onError: (errors) => errors,
  });

  const updatePerformerHandler = (
    performerID: string,
    stashID: string,
    endpoint: string
  ) =>
    updatePerformer({
      variables: {
        id: performerID,
        stash_ids: [
          {
            // TODO: WIll wipe existing stash_ids
            endpoint,
            stash_id: stashID,
          },
        ],
      },
      update: (store, updatedPerformer) => {
        if (!updatedPerformer.data?.performerUpdate) return;

        store.writeQuery<
          GQL.FindPerformersQuery,
          GQL.FindPerformersQueryVariables
        >({
          query: GQL.FindPerformersDocument,
          variables: {
            performer_filter: {
              stash_id: stashID,
            },
          },
          data: {
            findPerformers: {
              count: 1,
              performers: [updatedPerformer.data.performerUpdate],
              __typename: "FindPerformersResultType",
            },
          },
        });
      },
    });

  return updatePerformerHandler;
};

export const useCreatePerformer = () => {
  const [createPerformer] = GQL.usePerformerCreateMutation({
    onError: (errors) => errors,
  });

  const handleCreate = (performer: GQL.PerformerCreateInput, stashID: string) =>
    createPerformer({
      variables: performer,
      update: (store, newPerformer) => {
        if (!newPerformer?.data?.performerCreate) return;

        const currentQuery = store.readQuery<
          GQL.AllPerformersForFilterQuery,
          GQL.AllPerformersForFilterQueryVariables
        >({
          query: GQL.AllPerformersForFilterDocument,
        });
        const allPerformersSlim = sortBy(
          [
            ...(currentQuery?.allPerformersSlim ?? []),
            newPerformer.data.performerCreate,
          ],
          ["name"]
        );
        if (allPerformersSlim.length > 1) {
          store.writeQuery<
            GQL.AllPerformersForFilterQuery,
            GQL.AllPerformersForFilterQueryVariables
          >({
            query: GQL.AllPerformersForFilterDocument,
            data: {
              allPerformersSlim,
            },
          });
        }

        store.writeQuery<
          GQL.FindPerformersQuery,
          GQL.FindPerformersQueryVariables
        >({
          query: GQL.FindPerformersDocument,
          variables: {
            performer_filter: {
              stash_id: stashID,
            },
          },
          data: {
            findPerformers: {
              count: 1,
              performers: [newPerformer.data.performerCreate],
              __typename: "FindPerformersResultType",
            },
          },
        });
      },
    });

  return handleCreate;
};

export const useUpdateStudioStashID = () => {
  const [updateStudio] = GQL.useStudioUpdateMutation({
    onError: (errors) => errors,
  });

  const handleUpdate = (stashID: string, endpoint: string, studioID: string) =>
    updateStudio({
      variables: {
        id: studioID,
        stash_ids: [
          {
            // TODO: Will wipe existing stashids
            endpoint,
            stash_id: stashID,
          },
        ],
      },
      update: (store, result) => {
        if (!result.data?.studioUpdate) return;

        store.writeQuery<GQL.FindStudiosQuery, GQL.FindStudiosQueryVariables>({
          query: GQL.FindStudiosDocument,
          variables: {
            studio_filter: {
              stash_id: stashID,
            },
          },
          data: {
            findStudios: {
              count: 1,
              studios: [result.data.studioUpdate],
              __typename: "FindStudiosResultType",
            },
          },
        });
      },
    });

  return handleUpdate;
};

export const useCreateStudio = () => {
  const [createStudio] = GQL.useStudioCreateMutation({
    onError: (errors) => errors,
  });

  const handleCreate = (studio: GQL.StudioCreateInput, stashID: string) =>
    createStudio({
      variables: studio,
      update: (store, result) => {
        if (!result?.data?.studioCreate) return;

        const currentQuery = store.readQuery<
          GQL.AllStudiosForFilterQuery,
          GQL.AllStudiosForFilterQueryVariables
        >({
          query: GQL.AllStudiosForFilterDocument,
        });
        const allStudiosSlim = sortBy(
          [...(currentQuery?.allStudiosSlim ?? []), result.data.studioCreate],
          ["name"]
        );
        if (allStudiosSlim.length > 1) {
          store.writeQuery<
            GQL.AllStudiosForFilterQuery,
            GQL.AllStudiosForFilterQueryVariables
          >({
            query: GQL.AllStudiosForFilterDocument,
            data: {
              allStudiosSlim,
            },
          });
        }

        store.writeQuery<GQL.FindStudiosQuery, GQL.FindStudiosQueryVariables>({
          query: GQL.FindStudiosDocument,
          variables: {
            studio_filter: {
              stash_id: stashID,
            },
          },
          data: {
            findStudios: {
              count: 1,
              studios: [result.data.studioCreate],
              __typename: "FindStudiosResultType",
            },
          },
        });
      },
    });

  return handleCreate;
};

export const useCreateTag = () => {
  const [createTag] = GQL.useTagCreateMutation({
    onError: (errors) => errors,
  });

  const handleCreate = (tag: string) =>
    createTag({
      variables: {
        name: tag,
      },
      update: (store, result) => {
        if (!result.data?.tagCreate) return;

        const currentQuery = store.readQuery<
          GQL.AllTagsForFilterQuery,
          GQL.AllTagsForFilterQueryVariables
        >({
          query: GQL.AllTagsForFilterDocument,
        });
        const allTagsSlim = sortBy(
          [...(currentQuery?.allTagsSlim ?? []), result.data.tagCreate],
          ["name"]
        );

        store.writeQuery<
          GQL.AllTagsForFilterQuery,
          GQL.AllTagsForFilterQueryVariables
        >({
          query: GQL.AllTagsForFilterDocument,
          data: {
            allTagsSlim,
          },
        });
      },
    });

  return handleCreate;
};
