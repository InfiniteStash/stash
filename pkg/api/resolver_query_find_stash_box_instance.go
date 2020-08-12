package api

import (
	"context"

	"github.com/stashapp/stash/pkg/models"
)

func (r *queryResolver) ListStashBoxInstances(ctx context.Context) ([]*models.StashBoxInstance, error) {
	qb := models.NewStashBoxInstanceQueryBuilder()
	return qb.All()
}
