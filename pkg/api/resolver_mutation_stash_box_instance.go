package api

import (
	"context"
	"strconv"

	"github.com/stashapp/stash/pkg/database"
	"github.com/stashapp/stash/pkg/models"
)

func (r *mutationResolver) StashBoxInstanceCreate(ctx context.Context, input models.StashBoxInstanceInput) (*models.StashBoxInstance, error) {
	newInstance := models.StashBoxInstance{
		Endpoint:      input.Endpoint,
		APIKey:      input.APIKey,
	}

	var err error

	// Start the transaction and save the tag
	tx := database.DB.MustBeginTx(ctx, nil)
	qb := models.NewStashBoxInstanceQueryBuilder()

	instance, err := qb.Create(newInstance, tx)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	// Commit
	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return instance, nil
}

func (r *mutationResolver) StashBoxInstanceUpdate(ctx context.Context, input models.StashBoxInstanceUpdateInput) (*models.StashBoxInstance, error) {
	instanceID, _ := strconv.Atoi(input.ID)
	updatedInstance:= models.StashBoxInstance{
		ID:        instanceID,
		Endpoint:      input.Endpoint,
		APIKey:      input.APIKey,
	}

	// Start the transaction and save the tag
	tx := database.DB.MustBeginTx(ctx, nil)
	qb := models.NewStashBoxInstanceQueryBuilder()

	instance, err := qb.Update(updatedInstance, tx)
	if err != nil {
		_ = tx.Rollback()
		return nil, err
	}

	// Commit
	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return instance, nil
}

func (r *mutationResolver) StashBoxInstanceDestroy(ctx context.Context, id string) (bool, error) {
	qb := models.NewStashBoxInstanceQueryBuilder()
	tx := database.DB.MustBeginTx(ctx, nil)
	if err := qb.Destroy(id, tx); err != nil {
		_ = tx.Rollback()
		return false, err
	}
	if err := tx.Commit(); err != nil {
		return false, err
	}
	return true, nil
}
